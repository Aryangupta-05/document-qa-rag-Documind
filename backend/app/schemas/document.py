from datetime import datetime

from pydantic import BaseModel, ConfigDict


class DocumentResponse(BaseModel):
    id: str
    filename: str
    file_type: str
    status: str
    char_count: int
    chunks_created: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DocumentListResponse(BaseModel):
    documents: list[DocumentResponse]
    count: int