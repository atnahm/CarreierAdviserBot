from pydantic import BaseModel, UUID4
from typing import List, Dict, Optional
from datetime import datetime

class MessageCreate(BaseModel):
    content: str
    sender: str  # "user" or "ai"

class MessageResponse(BaseModel):
    id: str
    content: str
    sender: str
    timestamp: datetime
    suggestions: Optional[List[str]] = []
    metadata: Optional[Dict] = {}

    class Config:
        from_attributes = True

class ChatResponse(BaseModel):
    id: str
    user_id: str
    assessment_id: Optional[str]
    started_at: datetime
    last_activity: datetime
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True

class ChatCreate(BaseModel):
    assessment_id: Optional[str] = None

class ChatGenerateRequest(BaseModel):
    message: str
    include_recommendations: bool = False

class ChatGenerateResponse(BaseModel):
    response: str
    confidence: float
    suggestions: List[str] = []
    metadata: Dict = {}
    recommendations: Optional[List[Dict]] = []
