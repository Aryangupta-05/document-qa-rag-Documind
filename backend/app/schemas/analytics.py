from pydantic import BaseModel


class AnalyticsStatsResponse(BaseModel):
    total_documents: int
    total_queries: int
    successful_queries: int
    failed_queries: int
    average_response_time: float