from pydantic import BaseModel, Field
from typing import List
import os

class Settings(BaseModel):
    # Server settings
    port: int = Field(default=8000, alias="PORT")
    cors_origins: List[str] = Field(default=["http://localhost:3000", "http://localhost:3001"], alias="CORS_ORIGINS")

    # Database
    database_url: str = Field(default="postgresql+asyncpg://postgres:password@localhost:5432/careeradviser", alias="DATABASE_URL")

    # Redis
    redis_url: str = Field(default="redis://localhost:6379/0", alias="REDIS_URL")

    # JWT settings
    secret_key: str = Field(default="your-secret-key-change-this-in-production", alias="SECRET_KEY")
    algorithm: str = Field(default="HS256", alias="ALGORITHM")
    access_token_expire_minutes: int = Field(default=30, alias="ACCESS_TOKEN_EXPIRE_MINUTES")

    # OpenAI settings
    openai_api_key: str = Field(default_factory=lambda: os.getenv("OPENAI_API_KEY", ""), alias="OPENAI_API_KEY")
    openai_model: str = Field(default="gpt-4o-mini", alias="OPENAI_MODEL")

    # Other API keys (if needed)
    # Add other configuration as needed

    class Config:
        env_file = ".env"
        allow_population_by_field_name = True

# Create settings instance
settings = Settings()

# For backward compatibility, add uppercase attributes
Settings.PORT = settings.port
Settings.CORS_ORIGINS = settings.cors_origins
Settings.DATABASE_URL = settings.database_url
Settings.SECRET_KEY = settings.secret_key
Settings.ALGORITHM = settings.algorithm
Settings.ACCESS_TOKEN_EXPIRE_MINUTES = settings.access_token_expire_minutes
Settings.OPENAI_API_KEY = settings.openai_api_key
Settings.OPENAI_MODEL = settings.openai_model
