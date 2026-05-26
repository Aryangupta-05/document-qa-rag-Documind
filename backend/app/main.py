from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.config import settings
from app.database import create_tables
from app.routers import system


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()

    yield


app = FastAPI(
    title=settings.app_name,
    description="A RAG-based AI document assistant",
    version="0.1.0",
    lifespan=lifespan,
)


app.include_router(system.router, prefix=settings.api_prefix)


@app.get("/")
def root():
    return {
        "message": "Welcome to DocuMind AI",
        "status": "running",
    }