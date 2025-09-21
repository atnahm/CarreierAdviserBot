from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.schemas.chat import (
    ChatCreate, ChatResponse, MessageCreate, MessageResponse,
    ChatGenerateRequest, ChatGenerateResponse
)
from app.models.database import Chat, Message, User, Assessment
from app.services.nlp_service import NLPService
from app.services.openai_service import OpenAIService
from app.services.recommendation_service import RecommendationService
from app.database import get_db
from app.routes.auth import get_current_user
from datetime import datetime

router = APIRouter()
nlp_service = NLPService()
openai_service = OpenAIService()
recommendation_service = RecommendationService()

@router.post("/", response_model=ChatResponse)
async def create_chat(chat_data: ChatCreate,
                     current_user: User = Depends(get_current_user),
                     db: AsyncSession = Depends(get_db)):
    """Create a new chat session"""
    chat = Chat(
        user_id=current_user.id,
        assessment_id=chat_data.assessment_id
    )

    db.add(chat)
    await db.commit()
    await db.refresh(chat)

    return chat

@router.get("/", response_model=List[ChatResponse])
async def get_user_chats(current_user: User = Depends(get_current_user),
                        db: AsyncSession = Depends(get_db)):
    """Get all chats for the current user"""
    result = await db.execute(
        select(Chat).where(Chat.user_id == current_user.id)
        .order_by(Chat.last_activity.desc())
    )
    chats = result.scalars().all()
    return chats

@router.get("/{chat_id}", response_model=ChatResponse)
async def get_chat(chat_id: str,
                  current_user: User = Depends(get_current_user),
                  db: AsyncSession = Depends(get_db)):
    """Get a specific chat with messages"""
    result = await db.execute(select(Chat).where(Chat.id == chat_id))
    chat = result.scalar_one_or_none()

    if not chat or chat.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Chat not found")

    # Load messages
    messages_result = await db.execute(
        select(Message).where(Message.chat_id == chat_id)
        .order_by(Message.timestamp.asc())
    )
    chat.messages = messages_result.scalars().all()

    return chat

@router.post("/{chat_id}/messages", response_model=MessageResponse)
async def send_message(chat_id: str,
                      message_data: MessageCreate,
                      current_user: User = Depends(get_current_user),
                      db: AsyncSession = Depends(get_db)):
    """Send a message to the chat"""
    # Verify chat ownership
    result = await db.execute(select(Chat).where(Chat.id == chat_id))
    chat = result.scalar_one_or_none()

    if not chat or chat.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Chat not found")

    # Create user message
    user_message = Message(
        chat_id=chat_id,
        content=message_data.content,
        sender="user"
    )

    db.add(user_message)

    # Process with NLP
    assessment = None
    if chat.assessment_id:
        assessment_result = await db.execute(
            select(Assessment).where(Assessment.id == chat.assessment_id)
        )
        assessment = assessment_result.scalar_one_or_none()

    context = {"assessment": assessment}
    nlp_result = await nlp_service.process_message(message_data.content, context)

    # Get conversation history for context
    history_result = await db.execute(
        select(Message).where(Message.chat_id == chat_id)
        .order_by(Message.timestamp.desc())
        .limit(10)
    )
    history_messages = history_result.scalars().all()
    history = [{"sender": msg.sender, "content": msg.content} for msg in reversed(history_messages)]

    # Generate AI response
    ai_response_data = await openai_service.generate_response(
        message_data.content,
        context,
        history
    )

    # Create AI message
    ai_message = Message(
        chat_id=chat_id,
        content=ai_response_data["response"],
        sender="ai",
        metadata=ai_response_data["metadata"],
        suggestions=ai_response_data["suggestions"]
    )

    db.add(ai_message)

    # Update chat activity
    chat.last_activity = datetime.utcnow()

    await db.commit()
    await db.refresh(user_message)
    await db.refresh(ai_message)

    return ai_message

@router.post("/{chat_id}/generate", response_model=ChatGenerateResponse)
async def generate_response(chat_id: str,
                           request: ChatGenerateRequest,
                           current_user: User = Depends(get_current_user),
                           db: AsyncSession = Depends(get_db)):
    """Generate an AI response with enhanced features"""
    # Verify chat ownership
    result = await db.execute(select(Chat).where(Chat.id == chat_id))
    chat = result.scalar_one_or_none()

    if not chat or chat.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Chat not found")

    # Get context
    assessment = None
    if chat.assessment_id:
        assessment_result = await db.execute(
            select(Assessment).where(Assessment.id == chat.assessment_id)
        )
        assessment = assessment_result.scalar_one_or_none()

    context = {"assessment": assessment}

    # Process with NLP
    nlp_result = await nlp_service.process_message(request.message, context)
    context["nlp"] = nlp_result

    # Get conversation history
    history_result = await db.execute(
        select(Message).where(Message.chat_id == chat_id)
        .order_by(Message.timestamp.asc())
    )
    history = [{"sender": msg.sender, "content": msg.content} for msg in history_result.scalars().all()]

    # Generate AI response
    ai_response = await openai_service.generate_response(
        request.message, context, history
    )

    # Include recommendations if requested
    recommendations = []
    if request.include_recommendations:
        if nlp_result.get("intent", {}).get("intent") in ["recommendation", "advice", "exploration"]:
            try:
                career_recs = await recommendation_service.get_career_recommendations(current_user.id, 2)
                recommendations = career_recs
            except Exception as e:
                print(f"Recommendation error: {e}")
                recommendations = []

    return ChatGenerateResponse(
        response=ai_response["response"],
        confidence=ai_response["confidence"],
        suggestions=ai_response["suggestions"],
        metadata=ai_response["metadata"],
        recommendations=recommendations
    )

@router.post("/{chat_id}/recommendations")
async def get_chat_recommendations(chat_id: str,
                                  current_user: User = Depends(get_current_user),
                                  db: AsyncSession = Depends(get_db)):
    """Get personalized recommendations based on chat context"""
    # Verify chat ownership
    result = await db.execute(select(Chat).where(Chat.id == chat_id))
    chat = result.scalar_one_or_none()

    if not chat or chat.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Chat not found")

    # Get recent messages for context
    messages_result = await db.execute(
        select(Message).where(Message.chat_id == chat_id)
        .order_by(Message.timestamp.desc())
        .limit(5)
    )
    recent_messages = messages_result.scalars().all()

    # Get assessment data
    assessment_data = await recommendation_service._get_user_assessment_data(current_user.id)

    # Analyze message content for intent
    all_content = " ".join([msg.content for msg in recent_messages if msg.sender == "user"])
    recent_nlp = await nlp_service.process_message(all_content[-500:])  # Last 500 chars

    intent = recent_nlp.get("intent", {}).get("intent", "general")

    # Generate appropriate recommendations
    if intent in ["recommendation", "career", "advice"]:
        recommendations = await recommendation_service.get_career_recommendations(current_user.id, 3)
        return {
            "type": "careers",
            "recommendations": recommendations,
            "based_on": ["assessment_data", "chat_context"]
        }
    elif intent in ["skill", "learning", "development"]:
        skill_recommendations = await recommendation_service.get_skill_recommendations(
            assessment_data.get("skills", []), top_k=5
        )
        return {
            "type": "skills",
            "recommendations": skill_recommendations,
            "based_on": ["current_skills", "chat_context"]
        }
    else:
        # Default to career recommendations
        recommendations = await recommendation_service.get_career_recommendations(current_user.id, 3)
        return {
            "type": "careers",
            "recommendations": recommendations,
            "based_on": ["assessment_data"]
        }
