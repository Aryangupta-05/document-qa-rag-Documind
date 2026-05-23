from fastapi import FastAPI

from app.config import settings
from app.routers import system


app = FastAPI(
    title=settings.app_name,
    description="A RAG-based AI document assistant",
    version="0.1.0",
)


app.include_router(system.router, prefix=settings.api_prefix)


@app.get("/")
def root():
    return {
        "message": "Welcome to DocuMind AI",
        "status": "running",
    }