from fastapi import FastAPI

from app.config import settings


app = FastAPI(
    title=settings.app_name,
    description="A RAG-based AI document assistant",
    version="0.1.0",
)


@app.get("/")
def root():
    return {
        "message": "Welcome to DocuMind AI",
        "status": "running",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "app_name": settings.app_name,
        "environment": settings.environment,
    }