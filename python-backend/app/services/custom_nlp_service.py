from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
import asyncio
from typing import List, Dict, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from app.models.database import Assessment, Message

class CustomNLPService:
    def __init__(self):
        # Load pre-trained conversational model (DialoGPT)
        self.model_name = "microsoft/DialoGPT-medium"
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        self.model = AutoModelForCausalLM.from_pretrained(self.model_name)

        # Career-specific knowledge base
        self.career_kb = self._load_career_knowledge_base()

        # TF-IDF for intent classification
        self.intent_vectorizer = TfidfVectorizer()
        self.intent_labels = ["career_advice", "skill_question", "job_search", "education", "general"]
        self.intent_vectors = self.intent_vectorizer.fit_transform(self.intent_labels)

        # Rule-based responses for common queries
        self.rule_responses = {
            "career_advice": [
                "Based on your skills and interests, I recommend exploring roles in {field}.",
                "Your personality traits suggest you'd thrive in {career_type} environments.",
                "Consider building on your {skill} expertise for career advancement."
            ],
            "skill_question": [
                "To develop {skill}, I suggest starting with online courses on platforms like Coursera or Udemy.",
                "Building {skill} typically takes 3-6 months of consistent practice.",
                "Companies highly value {skill} - it's in demand across {industries}."
            ],
            "job_search": [
                "When searching for jobs, tailor your resume to highlight {relevant_skills}.",
                "Networking on LinkedIn can open doors in {industry}.",
                "Consider both entry-level positions and internships to gain experience."
            ]
        }

    async def generate_response(self, user_message: str, context: Dict = None,
                              history: List[Dict] = None) -> Dict:
        """Generate AI response using custom ML models"""

        if not context:
            context = {}
        if not history:
            history = []

        # Classify intent
        intent = self._classify_intent(user_message)

        # Get relevant context
        relevant_context = self._get_relevant_context(user_message, context)

        # Generate response using hybrid approach
        response = await self._generate_hybrid_response(user_message, intent, relevant_context, history)

        # Calculate confidence
        confidence = self._calculate_confidence(response, intent)

        # Generate suggestions
        suggestions = self._generate_suggestions(intent, context)

        return {
            "response": response,
            "metadata": {
                "intent": intent,
                "model": "custom-nlp-hybrid",
                "timestamp": asyncio.get_event_loop().time()
            },
            "confidence": confidence,
            "suggestions": suggestions
        }

    def _classify_intent(self, message: str) -> str:
        """Classify user message intent using TF-IDF similarity"""
        message_vector = self.intent_vectorizer.transform([message.lower()])
        similarities = cosine_similarity(message_vector, self.intent_vectors)[0]
        best_intent_idx = np.argmax(similarities)
        return self.intent_labels[best_intent_idx]

    def _get_relevant_context(self, message: str, context: Dict) -> Dict:
        """Extract relevant career context from user data"""
        relevant = {}

        if context.get("assessment"):
            assessment = context["assessment"]
            relevant["skills"] = assessment.get("skills", [])
            relevant["interests"] = assessment.get("interests", [])
            relevant["goals"] = assessment.get("goals", [])
            relevant["personality"] = assessment.get("personality", {})

        return relevant

    async def _generate_hybrid_response(self, message: str, intent: str,
                                      context: Dict, history: List[Dict]) -> str:
        """Generate response using rule-based + ML hybrid approach"""

        # First, try rule-based response
        rule_response = self._get_rule_based_response(message, intent, context)
        if rule_response:
            return rule_response

        # Fallback to ML model
        return await self._generate_ml_response(message, context, history)

    def _get_rule_based_response(self, message: str, intent: str, context: Dict) -> Optional[str]:
        """Generate rule-based response based on intent and context"""
        if intent not in self.rule_responses:
            return None

        templates = self.rule_responses[intent]
        template = np.random.choice(templates)

        # Fill in placeholders
        if "{skill}" in template and context.get("skills"):
            skill = np.random.choice(context["skills"])
            template = template.replace("{skill}", skill)

        if "{field}" in template and context.get("interests"):
            field = np.random.choice(context["interests"])
            template = template.replace("{field}", field)

        if "{career_type}" in template:
            personality = context.get("personality", {})
            if personality.get("extraversion", 0) > 3:
                career_type = "collaborative"
            else:
                career_type = "independent"
            template = template.replace("{career_type}", career_type)

        if "{relevant_skills}" in template and context.get("skills"):
            skills = ", ".join(context["skills"][:3])
            template = template.replace("{relevant_skills}", skills)

        if "{industry}" in template and context.get("interests"):
            industry = context["interests"][0] if context["interests"] else "tech"
            template = template.replace("{industry}", industry)

        if "{industries}" in template and context.get("skills"):
            industries = "technology, finance, and healthcare"
            template = template.replace("{industries}", industries)

        return template

    async def _generate_ml_response(self, message: str, context: Dict, history: List[Dict]) -> str:
        """Generate response using pre-trained conversational model"""
        try:
            # Build conversation context
            conversation = self._build_conversation_context(message, history, context)

            # Tokenize
            input_ids = self.tokenizer.encode(conversation + self.tokenizer.eos_token, return_tensors='pt')

            # Generate response
            with torch.no_grad():
                output = self.model.generate(
                    input_ids,
                    max_length=input_ids.shape[1] + 50,
                    pad_token_id=self.tokenizer.eos_token_id,
                    do_sample=True,
                    top_p=0.9,
                    temperature=0.7
                )

            # Decode response
            response = self.tokenizer.decode(output[0][input_ids.shape[1]:], skip_special_tokens=True)

            return response.strip()

        except Exception as e:
            print(f"ML generation error: {e}")
            return self._get_fallback_response(message, context)

    def _build_conversation_context(self, message: str, history: List[Dict], context: Dict) -> str:
        """Build conversation context for the model"""
        context_str = f"Career Advisor: I'm here to help with career advice. User says: {message}"

        if context.get("skills"):
            context_str += f" User skills: {', '.join(context['skills'])}"

        if context.get("interests"):
            context_str += f" User interests: {', '.join(context['interests'])}"

        # Add recent history
        for msg in history[-3:]:
            sender = "User" if msg.get("sender") == "user" else "Advisor"
            content = msg.get("content", "")
            context_str += f" {sender}: {content}"

        return context_str

    def _calculate_confidence(self, response: str, intent: str) -> float:
        """Calculate confidence score for the response"""
        # Simple heuristic: longer responses and rule-based are more confident
        if len(response.split()) > 10:
            return 0.8
        return 0.6

    def _generate_suggestions(self, intent: str, context: Dict) -> List[str]:
        """Generate follow-up suggestions"""
        suggestions = []

        if intent == "career_advice":
            suggestions = [
                "Tell me more about your current role",
                "What are your long-term career goals?",
                "Are you open to changing industries?"
            ]
        elif intent == "skill_question":
            suggestions = [
                "Which specific skills are you interested in?",
                "Do you have a timeline for learning new skills?",
                "What resources do you currently have access to?"
            ]
        else:
            suggestions = [
                "Can you elaborate on that?",
                "How can I help you further?",
                "Is there anything specific you'd like to know?"
            ]

        return suggestions[:3]

    def _get_fallback_response(self, message: str, context: Dict) -> str:
        """Fallback response when ML fails"""
        return "I'm here to help with your career questions. Could you tell me more about what you're looking for?"

    def _load_career_knowledge_base(self) -> Dict:
        """Load career-specific knowledge base"""
        # This would load from a file or database
        return {
            "tech": ["software engineering", "data science", "product management"],
            "business": ["consulting", "marketing", "finance"],
            "creative": ["design", "writing", "media"]
        }

        # Add NLP context if available
        if context.get("nlp"):
            nlp_data = context["nlp"]
            intent = nlp_data.get("intent", {})
            entities = nlp_data.get("entities", [])

            if intent:
                intent_info = f"Detected intent: {intent.get('intent')} (confidence: {intent.get('confidence', 0):.2f})"
                messages.append({"role": "system", "content": intent_info})

            if entities:
                entity_info = f"Detected entities: {[f'{e['text']} ({e['type']})' for e in entities]}"
                messages.append({"role": "system", "content": entity_info})

        # Add current user message
        messages.append({"role": "user", "content": user_message})

        return messages

    async def _call_openai_api(self, messages: List[Dict]):
        """Make the actual OpenAI API call"""
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: openai.ChatCompletion.create(
                model=self.model,
                messages=messages,
                max_tokens=1000,
                temperature=0.7,
                presence_penalty=0.1,
                frequency_penalty=0.1
            )
        )
        return response

    def _calculate_confidence(self, response) -> float:
        """Calculate confidence score based on response characteristics"""
        # Simple heuristic: higher for exact completions, lower for length limits
        finish_reason = response.choices[0].finish_reason

        if finish_reason == "stop":
            return 0.95
        elif finish_reason == "length":
            return 0.7
        else:
            return 0.5

    def _extract_suggestions(self, response: str) -> List[str]:
        """Extract suggested follow-up questions or actions from response"""
        suggestions = []

        # Look for common suggestion patterns
        suggestion_patterns = [
            "have you considered",
            "you might want to",
            "consider",
            "try",
            "what about",
            "another option"
        ]

        response_lower = response.lower()

        # Simple extraction (could be enhanced with NLP)
        sentences = response.split('.')
        for sentence in sentences:
            for pattern in suggestion_patterns:
                if pattern in sentence.lower():
                    # Clean up the suggestion
                    suggestion = sentence.strip()
                    if len(suggestion) > 10:  # Minimum length
                        suggestions.append(suggestion[:100] + "..." if len(suggestion) > 100 else suggestion)

        return suggestions[:3]  # Limit to 3 suggestions

    def _get_fallback_response(self, user_message: str, context: Dict) -> str:
        """Generate a basic fallback response when OpenAI fails"""
        fallback_responses = [
            "I understand you're looking for career guidance. Can you tell me more about your skills and interests?",
            "I'm here to help with your career development. What specific area would you like advice on?",
            "Career planning can be exciting! What are your current goals?",
            "I'd love to help guide your career journey. What's your background and what are you aiming for?"
        ]

        # Choose based on message length
        index = len(user_message) % len(fallback_responses)
        return fallback_responses[index]

    async def generate_recommendations(self, assessment_data: Dict) -> List[Dict]:
        """Generate career recommendations using OpenAI"""
        prompt = f"""
        Based on this user's assessment data:
        Skills: {', '.join(assessment_data.get('skills', []))}
        Interests: {', '.join(assessment_data.get('interests', []))}
        Goals: {', '.join(assessment_data.get('goals', []))}
        Experience: {assessment_data.get('experience', 'Not specified')}

        Generate 3 career recommendations with brief explanations of why they might be suitable.
        Focus on careers that match their skills and interests.
        """

        messages = [
            {"role": "system", "content": "You are a career counselor providing personalized career recommendations."},
            {"role": "user", "content": prompt}
        ]

        try:
            response = await self._call_openai_api(messages)
            return [
                {
                    "title": "AI Generated Recommendation",
                    "description": response.choices[0].message.content,
                    "reasoning": "Generated using AI analysis of user assessment data"
                }
            ]
        except Exception as e:
            print(f"⚠️  Recommendations generation error: {e}")
            return []
