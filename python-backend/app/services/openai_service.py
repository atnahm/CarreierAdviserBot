import openai
import asyncio
from typing import List, Dict, Optional
from app.config import settings
from app.models.database import Assessment, Message

class OpenAIService:
    def __init__(self):
        openai.api_key = settings.OPENAI_API_KEY
        self.model = "gpt-4o-mini"

    async def generate_response(self, user_message: str, context: Dict = None,
                              history: List[Dict] = None) -> Dict:
        """Generate AI response using OpenAI API with career context"""

        if not context:
            context = {}
        if not history:
            history = []

        # Build system prompt
        system_prompt = self._build_system_prompt(context)

        # Build conversation history
        messages = self._build_conversation_messages(user_message, system_prompt, history, context)

        try:
            # Make API call
            response = await self._call_openai_api(messages)

            # Process response
            ai_response = response.choices[0].message.content
            metadata = {
                "model": response.model,
                "usage": response.usage.model_dump() if response.usage else {},
                "finish_reason": response.choices[0].finish_reason,
                "timestamp": asyncio.get_event_loop().time()
            }

            return {
                "response": ai_response,
                "metadata": metadata,
                "confidence": self._calculate_confidence(response),
                "suggestions": self._extract_suggestions(ai_response)
            }

        except Exception as e:
            print(f"⚠️  OpenAI API error: {e}")
            # Fallback response
            return {
                "response": self._get_fallback_response(user_message, context),
                "metadata": {"error": str(e), "fallback": True},
                "confidence": 0.0,
                "suggestions": []
            }

    def _build_system_prompt(self, context: Dict) -> str:
        """Build personalized system prompt based on context"""
        base_prompt = """You are an advanced AI career counselor specializing in helping users discover and navigate their career paths.

You have access to the user's assessment data including their skills, interests, goals, and personality traits.

Your responses should be:
- Personalized to the user's profile
- Practical and actionable
- Evidence-based where possible
- Encouraging and supportive
- Focused on career development

Always consider the user's current assessment data and provide tailored advice."""

        # Add assessment context if available
        if context.get("assessment"):
            assessment = context["assessment"]
            skills = assessment.get("skills", [])
            interests = assessment.get("interests", [])
            goals = assessment.get("goals", [])

            if skills:
                base_prompt += f"\n\nUser Skills: {', '.join(skills)}"
            if interests:
                base_prompt += f"\n\nUser Interests: {', '.join(interests)}"
            if goals:
                base_prompt += f"\n\nUser Goals: {', '.join(goals)}"

        return base_prompt

    def _build_conversation_messages(self, user_message: str, system_prompt: str,
                                   history: List[Dict], context: Dict) -> List[Dict]:
        """Build the message list for OpenAI API"""
        messages = [
            {"role": "system", "content": system_prompt}
        ]

        # Add recent conversation history (limit to last 10 messages to manage tokens)
        max_history = 20
        for msg in history[-max_history:]:
            role = "user" if msg.get("sender") == "user" else "assistant"
            content = msg.get("content", "")
            messages.append({"role": role, "content": content})

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
