from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.config import settings
from app.routers import document, system, query, analytics
from fastapi.middleware.cors import CORSMiddleware

from app.database import SessionLocal, create_tables
from app.services.indexing import rebuild_vector_index

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()

    db = SessionLocal()
    try:
        rebuild_vector_index(db)
    finally:
        db.close()

    yield




app = FastAPI(
    title=settings.app_name,
    description="A RAG-based AI document assistant",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(system.router, prefix=settings.api_prefix)
app.include_router(document.router, prefix=settings.api_prefix)
app.include_router(query.router, prefix=settings.api_prefix)
app.include_router(analytics.router, prefix=settings.api_prefix)


@app.get("/")
def root():
    return {
        "message": "Welcome to DocuMind AI",
        "status": "running",
    }