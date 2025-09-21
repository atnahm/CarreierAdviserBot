from sqlalchemy import Column, Integer, String, DateTime, Float, Text, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

# Enhanced User Model with Embeddings
class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=func.gen_random_uuid())
    email = Column(String, unique=True, index=True)
    password = Column(String)
    name = Column(String, nullable=True)
    embeddings = Column(JSON, nullable=True)  # User profile embeddings
    cluster_id = Column(String, nullable=True)  # ML-based clustering
    career_trajectory = Column(JSON, nullable=True)  # Predictive career path
    preferences = Column(JSON, nullable=True)  # Personalized learning preferences
    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())

    assessments = relationship("Assessment", back_populates="user")
    chats = relationship("Chat", back_populates="user")

# Enhanced Assessment Model
class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(String, primary_key=True, default=func.gen_random_uuid())
    user_id = Column(String, ForeignKey("users.id"), index=True)
    user = relationship("User", back_populates="assessments")

    skills = Column(JSON)  # Array of skill strings with embeddings
    interests = Column(JSON)  # Array of interest strings
    personality = Column(JSON)  # Big Five traits scores
    experience = Column(String, nullable=True)
    goals = Column(JSON)  # Array of goal strings
    embeddings = Column(JSON, nullable=True)  # Assessment embeddings
    completed_at = Column(DateTime(timezone=True), default=func.now())
    created_at = Column(DateTime(timezone=True), default=func.now())

    chats = relationship("Chat", back_populates="assessment")

# Enhanced Chat Model
class Chat(Base):
    __tablename__ = "chats"

    id = Column(String, primary_key=True, default=func.gen_random_uuid())
    user_id = Column(String, ForeignKey("users.id"), index=True)
    user = relationship("User", back_populates="chats")
    assessment_id = Column(String, ForeignKey("assessments.id"), nullable=True)
    assessment = relationship("Assessment", back_populates="chats")

    started_at = Column(DateTime(timezone=True), default=func.now())
    last_activity = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())
    embeddings = Column(ARRAY(Float), nullable=True)  # Conversation embeddings

    messages = relationship("Message", back_populates="chat")

# Enhanced Message Model with AI Metadata
class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=func.gen_random_uuid())
    chat_id = Column(String, ForeignKey("chats.id"), index=True)
    chat = relationship("Chat", back_populates="messages")

    content = Column(Text)
    sender = Column(String)  # "user" or "ai"
    timestamp = Column(DateTime(timezone=True), default=func.now())
    embeddings = Column(ARRAY(Float), nullable=True)  # Message embeddings
    suggestions = Column(JSON, nullable=True)  # Suggested follow-ups
    metadata = Column(JSON, nullable=True)  # Confidence scores, etc.
    feedback_score = Column(Float, nullable=True)  # User satisfaction

# Enhanced Skill Model with Embeddings
class Skill(Base):
    __tablename__ = "skills"

    id = Column(String, primary_key=True, default=func.gen_random_uuid())
    name = Column(String, unique=True, index=True)
    category = Column(String)
    difficulty = Column(Float, default=1.0)  # 1-5 scale
    demand_score = Column(Float, default=0.0)  # Market demand 0-100
    embeddings = Column(ARRAY(Float), nullable=True)  # Skill vector embeddings
    salary_ranges = Column(JSON, nullable=True)
    industry_trends = Column(JSON, nullable=True)

# Enhanced Career Path Model
class CareerPath(Base):
    __tablename__ = "career_paths"

    id = Column(String, primary_key=True, default=func.gen_random_uuid())
    title = Column(String, unique=True, index=True)
    description = Column(Text)
    embeddings = Column(ARRAY(Float), nullable=True)  # Career path vectors
    required_skills = Column(JSON)  # Array of skill strings
    interests = Column(JSON)  # Array of compatible interests
    average_salary = Column(Integer)
    job_growth_rate = Column(Float)
    demand_level = Column(String)
    entry_level = Column(String, nullable=True)
    experienced = Column(String, nullable=True)
    senior = Column(String, nullable=True)
    industry_id = Column(String)
    predicted_growth = Column(Float)
    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())

# Career Transition Model (New)
class CareerTransition(Base):
    __tablename__ = "career_transitions"

    id = Column(String, primary_key=True, default=func.gen_random_uuid())
    from_career_id = Column(String, ForeignKey("career_paths.id"))
    to_career_id = Column(String, ForeignKey("career_paths.id"))
    transition_time = Column(Integer)  # Months typically required
    required_skills = Column(ARRAY(String))  # Additional skills needed
    success_rate = Column(Float)  # Historical success rate
    common_obstacles = Column(JSON)  # Common challenges
    support_resources = Column(JSON)  # Books, courses, mentors

# Job Posting Model (New)
class JobPosting(Base):
    __tablename__ = "job_postings"

    id = Column(String, primary_key=True, default=func.gen_random_uuid())
    title = Column(String)
    company = Column(String)
    embeddings = Column(ARRAY(Float), nullable=True)  # Job description vectors
    required_skills = Column(ARRAY(String))
    salary_range = Column(String)
    location = Column(String)
    seniority_level = Column(String)
    posted_date = Column(DateTime(timezone=True))
    active = Column(Boolean, default=True)

# User Interaction Model (New)
class UserInteraction(Base):
    __tablename__ = "user_interactions"

    id = Column(String, primary_key=True, default=func.gen_random_uuid())
    user_id = Column(String, ForeignKey("users.id"), index=True)
    interaction_type = Column(String)  # 'chat', 'assessment', 'resource_view'
    content = Column(JSON)  # Interaction details
    embeddings = Column(ARRAY(Float), nullable=True)  # Content embeddings
    feedback_score = Column(Float, nullable=True)  # User satisfaction
    timestamp = Column(DateTime(timezone=True), default=func.now())
