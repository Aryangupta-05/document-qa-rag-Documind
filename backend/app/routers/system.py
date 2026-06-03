from fastapi import APIRouter

from app.config import settings
from app.database import check_database_connection
from app.services.vector_store import get_vector_store


router = APIRouter(
    prefix="/system",
    tags=["system"],
)


@router.get("/health")
def health_check():
    database_connected = check_database_connection()

    return {
        "status": "healthy" if database_connected else "degraded",
        "app_name": settings.app_name,
        "environment": settings.environment,
        "database": "connected" if database_connected else "unavailable",
        "llm": "configured" if settings.groq_api_key else "missing_api_key",
    }
@router.get("/rag-status")
def rag_status():
    return {
        "embedding_model": settings.embedding_model_name,
        "vector_store": get_vector_store().stats(),
        "llm_model": settings.groq_model_name,
        "llm_configured": bool(settings.groq_api_key),
    }

