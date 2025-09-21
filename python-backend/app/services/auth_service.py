from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.models.database import User
from app.schemas.auth import UserCreate
from app.utils.auth import get_password_hash, verify_password, create_access_token

class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def register_user(self, user_data: UserCreate) -> User:
        # Hash password
        hashed_password = get_password_hash(user_data.password)
        
        # Check if user exists
        result = await self.db.execute(select(User).where(User.email == user_data.email))
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create user
        db_user = User(
            email=user_data.email,
            name=user_data.name,
            password=hashed_password
        )
        
        self.db.add(db_user)
        await self.db.commit()
        await self.db.refresh(db_user)
        return db_user

    async def authenticate_user(self, email: str, password: str) -> User:
        result = await self.db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if not user:
            return None
        if not verify_password(password, user.password):
            return None
        return user

    async def create_access_token_for_user(self, user: User) -> str:
        access_token = create_access_token(data={"sub": user.email})
        return access_token

    async def get_user_by_email(self, email: str) -> User:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()
