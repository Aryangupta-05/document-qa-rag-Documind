from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.document import Document
from app.models.query import QueryHistory
from app.schemas.analytics import AnalyticsStatsResponse


router = APIRouter(
    prefix="/analytics",
    tags=["analytics"],
)


@router.get("/stats", response_model=AnalyticsStatsResponse)
def get_analytics_stats(db: Session = Depends(get_db)):
    total_documents = db.query(Document).count()
    total_queries = db.query(QueryHistory).count()

    successful_queries = (
        db.query(QueryHistory)
        .filter(QueryHistory.success.is_(True))
        .count()
    )

    failed_queries = total_queries - successful_queries

    average_response_time = (
        db.query(func.avg(QueryHistory.response_time)).scalar()
    )

    return {
        "total_documents": total_documents,
        "total_queries": total_queries,
        "successful_queries": successful_queries,
        "failed_queries": failed_queries,
        "average_response_time": float(average_response_time or 0.0),
    }