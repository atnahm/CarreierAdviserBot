from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
import numpy as np
import asyncio
from typing import List, Dict, Tuple
from app.services.embedding_service import EmbeddingService
from app.database import get_db
from sqlalchemy.future import select
from app.models.database import User, Assessment, CareerPath, Skill

class RecommendationService:
    def __init__(self, db=None):
        self.db = db
        self.embedding_service = EmbeddingService()
        self.scaler = StandardScaler()

    async def get_career_recommendations(self, user_id: str, top_k: int = 5) -> List[Dict]:
        """Generate hybrid career recommendations for a user"""
        # Get user assessment data
        assessment_data = await self._get_user_assessment_data(user_id)
        if not assessment_data:
            return await self._get_default_recommendations(assessment_data, top_k)

        # Get user embeddings
        user_embeddings = await self.embedding_service.encode_user_profile(
            skills=assessment_data.get('skills', []),
            interests=assessment_data.get('interests', []),
            experience=assessment_data.get('experience', ''),
            goals=assessment_data.get('goals', [])
        )

        # Get career database
        career_data, career_embeddings = await self._get_career_data_with_embeddings()

        # Calculate similarities
        similarities = {}
        for career, embedding in career_embeddings.items():
            sim = self.embedding_service.cosine_similarity(user_embeddings, embedding)
            similarities[career] = sim

        # Sort and get top recommendations
        sorted_careers = sorted(similarities.items(), key=lambda x: x[1], reverse=True)
        recommendations = []

        for career_title, similarity_score in sorted_careers[:top_k]:
            career_info = career_data.get(career_title, {})
            recommendations.append({
                "title": career_title,
                "description": career_info.get('description', ''),
                "similarity_score": similarity_score,
                "required_skills": career_info.get('required_skills', []),
                "average_salary": career_info.get('average_salary', 0),
                "demand_level": career_info.get('demand_level', 'medium'),
                "reasoning": self._generate_recommendation_reasoning(
                    assessment_data, career_info, similarity_score
                )
            })

        return recommendations

    async def get_skill_recommendations(self, user_skills: List[str],
                                      current_career_goal: str = None,
                                      top_k: int = 10) -> List[Dict]:
        """Recommend additional skills based on user's current skills"""
        # Get embeddings for current skills
        skill_embeddings = await self.embedding_service.encode_skills(user_skills)

        # Get all available skills
        all_skills = await self._get_all_skills()
        all_skill_names = [s['name'] for s in all_skills]
        all_skill_embeddings = await self.embedding_service.encode_skills(all_skill_names)

        recommendations = []

        # Find similar skills not already possessed
        for skill in user_skills:
            if skill in all_skill_embeddings:
                similar_skills = await self.embedding_service.find_similar_skills(
                    skill, all_skill_embeddings, min(top_k, 5)
                )
                recommendations.extend([
                    (similar_skill, score) for similar_skill, score in similar_skills
                    if similar_skill not in user_skills
                ])

        # Remove duplicates and sort by score
        unique_recommendations = {}
        for skill, score in recommendations:
            if skill not in unique_recommendations or unique_recommendations[skill] < score:
                unique_recommendations[skill] = score

        sorted_recommendations = sorted(unique_recommendations.items(), key=lambda x: x[1], reverse=True)

        # Format and add metadata
        skill_details = {s['name']: s for s in all_skills}
        formatted_recommendations = []
        for skill_name, score in sorted_recommendations[:top_k]:
            skill_info = skill_details.get(skill_name, {})
            formatted_recommendations.append({
                "skill": skill_name,
                "relevance_score": score,
                "difficulty": skill_info.get('difficulty', 3),
                "demand_score": skill_info.get('demand_score', 50),
                "category": skill_info.get('category', 'technical'),
                "reasoning": f"Complementary to your existing skills in {', '.join(user_skills[:3])}"
            })

        return formatted_recommendations

    async def get_learning_path_recommendations(self, user_skills: List[str],
                                              target_skills: List[str],
                                              time_available: int = 30) -> Dict:
        """Generate personalized learning path"""
        # Calculate skill gaps
        skill_gaps = []
        user_skill_set = set(user_skills)

        for skill in target_skills:
            if skill not in user_skill_set:
                skill_gaps.append(skill)

        # Prioritize skill gaps based on demand and difficulty
        all_skills = await self._get_all_skills()
        skill_metadata = {s['name']: s for s in all_skills}

        prioritized_gaps = []
        for skill in skill_gaps:
            metadata = skill_metadata.get(skill, {})
            priority_score = (
                metadata.get('demand_score', 50) * 0.6 +
                (6 - metadata.get('difficulty', 3)) * 10  # Easier skills higher priority
            )
            prioritized_gaps.append((skill, priority_score, metadata))

        # Sort by priority and create learning sequence
        prioritized_gaps.sort(key=lambda x: x[1], reverse=True)
        learning_path = []

        time_used = 0
        max_time_per_skill = 5  # days

        for skill, score, metadata in prioritized_gaps:
            if time_used >= time_available:
                break

            learning_path.append({
                "skill": skill,
                "estimated_time": min(max_time_per_skill, time_available - time_used),
                "difficulty": metadata.get('difficulty', 3),
                "resources": self._get_learning_resources(skill, metadata),
                "prerequisites": self._find_prerequisites(skill)
            })
            time_used += min(max_time_per_skill, time_available - time_used)

        return {
            "learning_path": learning_path,
            "total_estimated_time": time_used,
            "completion_rate": len([s for s in target_skills if s in user_skill_set]) / len(target_skills) if target_skills else 0,
            "next_steps": self._generate_next_steps_recommendations(learning_path)
        }

    def _generate_recommendation_reasoning(self, user_data: Dict,
                                          career_info: Dict,
                                          similarity_score: float) -> str:
        """Generate human-readable reasoning for career recommendation"""
        user_skills = set(user_data.get('skills', []))
        user_interests = set(user_data.get('interests', []))
        career_skills = set(career_info.get('required_skills', []))
        career_interests = set(career_info.get('interests', []))

        # Calculate overlaps
        skill_overlap = len(user_skills & career_skills)
        interest_overlap = len(user_interests & career_interests)

        reasoning = []

        if skill_overlap > 0:
            reasoning.append(f"You have {skill_overlap} skills that match this career")

        if interest_overlap > 0:
            reasoning.append(f"{interest_overlap} of your interests align with this career")

        if similarity_score > 0.8:
            reasoning.append("High overall similarity to your profile")
        elif similarity_score > 0.6:
            reasoning.append("Good match for your background")
        else:
            reasoning.append("Emerging opportunity based on your interests")

        return ". ".join(reasoning)

    def _get_learning_resources(self, skill: str, metadata: Dict) -> List[Dict]:
        """Generate learning resource recommendations"""
        resources = [
            {
                "type": "course",
                "name": f"Learn {skill.title()}",
                "platform": "Online learning platforms",
                "duration": "2-4 weeks",
                "cost": "Free to $100"
            },
            {
                "type": "practice",
                "name": f"{skill.title()} Projects",
                "platform": "GitHub/Personal projects",
                "duration": "Ongoing",
                "cost": "Free"
            }
        ]

        # Add specific resources based on skill difficulty
        if metadata.get('difficulty', 3) <= 2:
            resources.append({
                "type": "tutorial",
                "name": f"{skill.title()} Tutorials",
                "platform": "YouTube/Udemy",
                "duration": "1-2 days",
                "cost": "Free to $50"
            })

        return resources

    def _find_prerequisites(self, skill: str) -> List[str]:
        """Find prerequisite skills"""
        # Simple rule-based prerequisites (could be enhanced with database)
        prerequisites_map = {
            "machine learning": ["python", "statistics"],
            "data science": ["python", "sql"],
            "web development": ["html", "css", "javascript"],
            "django": ["python"],
            "react": ["javascript"],
            "docker": ["linux", "command line"],
            "kubernetes": ["docker"],
        }

        return prerequisites_map.get(skill.lower(), [])

    def _generate_next_steps_recommendations(self, learning_path: List[Dict]) -> List[str]:
        """Generate actionable next steps"""
        if not learning_path:
            return ["Complete a skills assessment", "Define your career goals"]

        next_steps = []
        immediate_skill = learning_path[0]['skill']

        next_steps.extend([
            f"Start learning {immediate_skill} (estimated {learning_path[0]['estimated_time']} days)",
            "Dedicate 1-2 hours daily to skill development",
            "Join relevant online communities for support",
            "Track your progress and adjust your learning plan"
        ])

        if len(learning_path) > 1:
            next_steps.append(f"After {immediate_skill}, focus on {learning_path[1]['skill']}")

        return next_steps

    async def _get_user_assessment_data(self, user_id: str) -> Dict:
        """Fetch user's assessment data"""
        async for session in get_db():
            result = await session.execute(
                select(Assessment).where(Assessment.user_id == user_id)
                .order_by(Assessment.created_at.desc())
            )
            assessment = result.scalar_one_or_none()
            if assessment:
                return {
                    "skills": assessment.skills or [],
                    "interests": assessment.interests or [],
                    "goals": assessment.goals or [],
                    "experience": assessment.experience or "",
                    "personality": assessment.personality or {}
                }
        return {}

    async def _get_career_data_with_embeddings(self) -> Tuple[Dict, Dict]:
        """Get careers with their embeddings"""
        async for session in get_db():
            result = await session.execute(select(CareerPath))
            careers = result.scalars().all()

            career_data = {}
            # Mock embeddings for now (in production, store pre-computed embeddings)
            career_embeddings = {}

            for career in careers:
                career_data[career.title] = {
                    "description": career.description,
                    "required_skills": career.required_skills or [],
                    "interests": career.interests or [],
                    "average_salary": career.average_salary,
                    "demand_level": career.demand_level,
                    "id": career.id
                }
                # Generate embedding on-the-fly for now
                embedding = await self.embedding_service.encode_careers([{
                    "title": career.title,
                    "description": career.description,
                    "required_skills": career.required_skills or [],
                    "interests": career.interests or []
                }])
                career_embeddings[career.title] = embedding.get(career.title, [0]*384)

        return career_data, career_embeddings

    async def _get_all_skills(self) -> List[Dict]:
        """Get all available skills with metadata"""
        async for session in get_db():
            result = await session.execute(select(Skill))
            skills = result.scalars().all()

        return [{
            "id": skill.id,
            "name": skill.name,
            "category": skill.category,
            "difficulty": skill.difficulty,
            "demand_score": skill.demand_score
        } for skill in skills]

    async def _get_default_recommendations(self, user_data: Dict, top_k: int) -> List[Dict]:
        """Default recommendations when no assessment data is available"""
        return [
            {
                "title": "Software Developer",
                "description": "Build and develop software applications",
                "similarity_score": 0.5,
                "required_skills": ["programming", "problem solving"],
                "average_salary": 75000,
                "demand_level": "high",
                "reasoning": "Popular career path with good growth prospects"
            },
            {
                "title": "Data Analyst",
                "description": "Analyze data to provide business insights",
                "similarity_score": 0.4,
                "required_skills": ["excel", "sql", "statistics"],
                "average_salary": 65000,
                "demand_level": "high",
                "reasoning": "Growing field with analytical focus"
            }
        ][:top_k]
