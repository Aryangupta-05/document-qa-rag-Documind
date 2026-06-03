from datetime import datetime

from pydantic import BaseModel, ConfigDict


class QueryHistoryResponse(BaseModel):
    id: int
    question: str
    answer: str | None
    model: str | None
    sources_count: int
    response_time: float
    success: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class QueryHistoryListResponse(BaseModel):
    queries: list[QueryHistoryResponse]
    count: int