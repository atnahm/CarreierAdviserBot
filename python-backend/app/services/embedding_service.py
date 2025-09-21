from sentence_transformers import SentenceTransformer
import numpy as np
import asyncio
from typing import List, Dict, Union
from app.config import settings

class EmbeddingService:
    def __init__(self, model_name: str = 'all-MiniLM-L6-v2'):
        self.model_name = model_name
        self.model = None
        self.is_loaded = False

    async def load_model(self):
        """Load the embedding model asynchronously"""
        if not self.is_loaded:
            loop = asyncio.get_event_loop()
            self.model = await loop.run_in_executor(None, self._load_model_sync)
            self.is_loaded = True
            print("✅ Embedding model loaded successfully")

    def _load_model_sync(self):
        """Synchronous model loading"""
        return SentenceTransformer(self.model_name)

    async def encode_text(self, text: Union[str, List[str]]) -> Union[List[float], List[List[float]]]:
        """Encode text into embeddings"""
        if not self.is_loaded:
            await self.load_model()

        loop = asyncio.get_event_loop()
        embeddings = await loop.run_in_executor(None, self.model.encode, text)

        # Convert numpy array to list
        if isinstance(embeddings, np.ndarray):
            if len(embeddings.shape) == 1:
                return embeddings.tolist()
            else:
                return embeddings.tolist()
        return embeddings

    async def encode_user_profile(self, skills: List[str], interests: List[str],
                                 experience: str = "", goals: List[str] = []) -> List[float]:
        """Generate embeddings for user profile"""
        # Combine user information into a comprehensive text
        profile_text = f"Skills: {', '.join(skills)}\n"
        profile_text += f"Interests: {', '.join(interests)}\n"
        if experience:
            profile_text += f"Experience: {experience}\n"
        if goals:
            profile_text += f"Goals: {', '.join(goals)}\n"

        return await self.encode_text(profile_text)

    async def encode_skills(self, skills: List[str]) -> Dict[str, List[float]]:
        """Generate embeddings for skill list"""
        if not skills:
            return {}
        embeddings = await self.encode_text(skills)
        return dict(zip(skills, embeddings))

    async def encode_careers(self, careers: List[Dict]) -> Dict[str, List[float]]:
        """Generate embeddings for career paths"""
        career_texts = []
        career_titles = []
        for career in careers:
            text = f"""
            Career: {career['title']}
            Description: {career.get('description', '')}
            Required Skills: {', '.join(career.get('required_skills', []))}
            Interests: {', '.join(career.get('interests', []))}
            """
            career_texts.append(text)
            career_titles.append(career['title'])

        embeddings = await self.encode_text(career_texts)
        return dict(zip(career_titles, embeddings))

    def cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity between two vectors"""
        v1 = np.array(vec1)
        v2 = np.array(vec2)
        return np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))

    async def find_similar_careers(self, user_embedding: List[float],
                                  career_embeddings: Dict[str, List[float]],
                                  top_k: int = 5) -> List[tuple]:
        """Find most similar careers to user embedding"""
        similarities = []
        for career, embedding in career_embeddings.items():
            sim = self.cosine_similarity(user_embedding, embedding)
            similarities.append((career, sim))

        similarities.sort(key=lambda x: x[1], reverse=True)
        return similarities[:top_k]

    async def find_similar_skills(self, target_skill: str,
                                 skills_embeddings: Dict[str, List[float]],
                                 top_k: int = 10) -> List[tuple]:
        """Find similar skills based on embeddings"""
        if not target_skill in skills_embeddings:
            return []

        target_embedding = skills_embeddings[target_skill]
        similarities = []

        for skill, embedding in skills_embeddings.items():
            if skill != target_skill:
                sim = self.cosine_similarity(target_embedding, embedding)
                similarities.append((skill, sim))

        similarities.sort(key=lambda x: x[1], reverse=True)
        return similarities[:top_k]
