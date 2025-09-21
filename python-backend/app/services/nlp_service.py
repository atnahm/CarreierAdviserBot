from transformers import pipeline, Pipeline
import asyncio
from typing import List, Dict, Tuple
from app.config import settings

class NLPService:
    def __init__(self):
        self.intent_classifier: Pipeline = None
        self.ner_model: Pipeline = None
        self.is_loaded = False

    async def load_models(self):
        """Load NLP models asynchronously"""
        if not self.is_loaded:
            loop = asyncio.get_event_loop()

            # Load intent classification model (zero-shot or fine-tuned)
            try:
                # Try zero-shot classification for flexibility
                self.intent_classifier = await loop.run_in_executor(
                    None,
                    lambda: pipeline("zero-shot-classification",
                                   model="facebook/bart-large-mnli",
                                   device=-1)  # CPU
                )
                print("✅ Intent classifier loaded successfully")
            except Exception as e:
                print(f"⚠️  Could not load intent classifier: {e}")

            # Load NER model
            try:
                self.ner_model = await loop.run_in_executor(
                    None,
                    lambda: pipeline("ner",
                                   model="dbmdz/bert-large-cased-finetuned-conll03-english",
                                   aggregation_strategy="simple",
                                   device=-1)
                )
                print("✅ NER model loaded successfully")
            except Exception as e:
                print(f"⚠️  Could not load NER model: {e}")

            self.is_loaded = True

    async def classify_intent(self, text: str) -> Dict:
        """Classify user intent with confidence scores"""
        if not self.intent_classifier:
            await self.load_models()
            if not self.intent_classifier:
                return {"intent": "general_question", "confidence": 0.5}

        # Define possible intents for career chatbot
        career_intents = [
            "career_advice",
            "skill_assessment",
            "job_recommendation",
            "career_transition",
            "learning_resources",
            "salary_expectations",
            "skill_development",
            "career_exploration",
            "general_question",
            "feedback"
        ]

        try:
            result = self.intent_classifier(text, career_intents)
            best_intent = result['labels'][0]
            confidence = result['scores'][0]

            # Map to simplified intents if needed
            simplified_intents = {
                "career_advice": "advice",
                "skill_assessment": "assessment",
                "job_recommendation": "recommendation",
                "career_transition": "transition",
                "learning_resources": "learning",
                "salary_expectations": "salary",
                "skill_development": "development",
                "career_exploration": "exploration",
                "general_question": "question",
                "feedback": "feedback"
            }

            simplified = simplified_intents.get(best_intent, "general")

            return {
                "intent": simplified,
                "original_intent": best_intent,
                "confidence": float(confidence),
                "all_scores": dict(zip(result['labels'], result['scores']))
            }
        except Exception as e:
            print(f"⚠️  Intent classification error: {e}")
            return {"intent": "general", "confidence": 0.5}

    async def extract_entities(self, text: str) -> List[Dict]:
        """Extract named entities related to careers and skills"""
        if not self.ner_model:
            await self.load_models()
            if not self.ner_model:
                return []

        try:
            results = self.ner_model(text)

            career_entities = []
            skill_entities = []
            organization_entities = []

            for entity in results:
                entity_type = entity['entity_group']
                entity_text = entity['word']
                confidence = entity['score']

                if confidence > 0.7:  # Only high confidence entities
                    if entity_type in ['ORG']:  # Organizations could be companies
                        organization_entities.append({
                            "text": entity_text,
                            "type": "organization",
                            "confidence": confidence
                        })
                    elif entity_type in ['PERSON']:  # Could be people asking about specific careers
                        # Not directly useful for careers, but maybe influencers
                        pass
                    elif entity_type in ['MISC']:  # Miscellaneous, might include career terms
                        career_entities.append({
                            "text": entity_text,
                            "type": "misc",
                            "confidence": confidence
                        })

            # Also extract skills from text (simple keyword matching)
            skill_keywords = await self.extract_skills_keywords(text)
            skill_entities = [{
                "text": skill,
                "type": "skill",
                "confidence": 0.8
            } for skill in skill_keywords]

            return career_entities + skill_entities + organization_entities

        except Exception as e:
            print(f"⚠️  Entity extraction error: {e}")
            return []

    async def extract_skills_keywords(self, text: str) -> List[str]:
        """Simple keyword-based skill extraction"""
        skills_database = [
            "python", "javascript", "java", "c++", "ruby", "go", "rust",
            "react", "angular", "vue", "node.js", "django", "flask",
            "machine learning", "ai", "data science", "data analysis",
            "sql", "mongodb", "postgresql", "aws", "docker", "kubernetes",
            "leadership", "project management", "communication",
            "marketing", "sales", "finance", "accounting"
        ]

        text_lower = text.lower()
        found_skills = []

        for skill in skills_database:
            if skill in text_lower:
                found_skills.append(skill)

        return found_skills

    async def process_message(self, message: str, context: Dict = None) -> Dict:
        """Complete NLP processing for a message"""
        if context is None:
            context = {}

        # Classify intent
        intent = await self.classify_intent(message)

        # Extract entities
        entities = await self.extract_entities(message)

        # Combine with context
        contextual_understanding = {
            "intent": intent,
            "entities": entities,
            "message": message,
            "context": context,
            "timestamp": asyncio.get_event_loop().time()
        }

        # Add conversation coherence analysis
        coherence = await self.analyze_conversation_coherence(message, context)
        contextual_understanding["coherence"] = coherence

        return contextual_understanding

    async def analyze_conversation_coherence(self, message: str, context: Dict) -> Dict:
        """Analyze if the message fits the conversation context"""
        if not context:
            return {"coherent": True, "reason": "new_conversation"}

        # Simple coherence analysis based on intent continuity
        previous_intent = context.get("last_intent", "")
        current_intent = (await self.classify_intent(message))["intent"]

        intent_flow = {
            ("assessment", "advice"): "high",
            ("advice", "recommendation"): "high",
            ("question", "exploration"): "medium",
            ("transition", "learning"): "medium"
        }

        coherence_level = intent_flow.get((previous_intent, current_intent), "low")

        return {
            "coherent": coherence_level in ["high", "medium"],
            "coherence_level": coherence_level,
            "previous_intent": previous_intent,
            "current_intent": current_intent
        }
