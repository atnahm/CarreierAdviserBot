from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
from app.database import engine, Base
from app.routes.auth import router as auth_router
from app.routes.assessments import router as assessment_router
from app.routes.chat import router as chat_router
from app.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("🚀 FastAPI server starting up...")
    yield
    # Shutdown
    await engine.dispose()
    print("🛑 FastAPI server shutting down...")

app = FastAPI(
    title="Career Anthem AI - Advanced Chatbot API",
    description="Enterprise-grade AI platform for career guidance and recommendations",
    version="1.0.0",
    lifespan=lifespan
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(assessment_router, prefix="/api/assessments", tags=["Assessments"])
app.include_router(chat_router, prefix="/api/chat", tags=["Chat"])
# app.include_router(user_router, prefix="/api/users", tags=["Users"])  # TODO: Implement user router

# Health check
@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "timestamp": asyncio.get_event_loop().time()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=True,
        log_level="info"
    )
