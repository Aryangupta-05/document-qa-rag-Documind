from fastapi import APIRouter

from app.config import settings
from app.database import check_database_connection


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