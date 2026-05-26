from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.document import Document
from app.schemas.document import DocumentListResponse


router = APIRouter(
    prefix="/documents",
    tags=["documents"],
)


@router.get("", response_model=DocumentListResponse)
def list_documents(db: Session = Depends(get_db)):
    documents = db.query(Document).order_by(Document.created_at.desc()).all()

    return {
        "documents": documents,
        "count": len(documents),
    }