from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from pydantic import BaseModel
from app.models.database import Assessment, User
from app.database import get_db
from app.routes.auth import get_current_user
from datetime import datetime

router = APIRouter()

class AssessmentCreate(BaseModel):
    skills: List[str]
    interests: List[str]
    personality: dict
    experience: str = ""
    goals: List[str]

class AssessmentResponse(BaseModel):
    id: str
    user_id: str
    skills: List[str]
    interests: List[str]
    personality: dict
    experience: str
    goals: List[str]
    completed_at: datetime

    class Config:
        from_attributes = True

@router.post("/", response_model=AssessmentResponse)
async def create_assessment(assessment_data: AssessmentCreate,
                           current_user: User = Depends(get_current_user),
                           db: AsyncSession = Depends(get_db)):
    """Create a new assessment"""
    assessment = Assessment(
        user_id=current_user.id,
        skills=assessment_data.skills,
        interests=assessment_data.interests,
        personality=assessment_data.personality,
        experience=assessment_data.experience,
        goals=assessment_data.goals
    )

    db.add(assessment)
    await db.commit()
    await db.refresh(assessment)

    return assessment

@router.get("/", response_model=List[AssessmentResponse])
async def get_user_assessments(current_user: User = Depends(get_current_user),
                              db: AsyncSession = Depends(get_db)):
    """Get all assessments for the current user"""
    result = await db.execute(
        select(Assessment).where(Assessment.user_id == current_user.id)
        .order_by(Assessment.completed_at.desc())
    )
    assessments = result.scalars().all()
    return assessments

@router.get("/{assessment_id}", response_model=AssessmentResponse)
async def get_assessment(assessment_id: str,
                        current_user: User = Depends(get_current_user),
                        db: AsyncSession = Depends(get_db)):
    """Get a specific assessment"""
    result = await db.execute(select(Assessment).where(Assessment.id == assessment_id))
    assessment = result.scalar_one_or_none()

    if not assessment or assessment.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Assessment not found")

    return assessment
