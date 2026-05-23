from fastapi import APIRouter

from app.config import settings


router = APIRouter(
    prefix="/system",
    tags=["system"],
)


@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "app_name": settings.app_name,
        "environment": settings.environment,
    }