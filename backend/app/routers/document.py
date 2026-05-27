from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.services.document_processor import DocumentProcessor

from app.config import settings
from app.database import get_db
from app.models.document import Document
from app.schemas.document import DocumentListResponse, DocumentResponse
from app.utils.file_storage import save_upload,save_processed_text


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


@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    extension = Path(file.filename or "").suffix.lower()

    if extension not in settings.allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type. Allowed: PDF, DOCX, TXT, HTML, MD.",
        )

    file_id, file_path = save_upload(file)

    document = Document(
        id=file_id,
        filename=file.filename or file_path.name,
        file_type=extension,
        file_path=str(file_path),
        status="uploaded",
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    extracted_text = DocumentProcessor.extract_text(file_path)
    save_processed_text(document.id, extracted_text)

    document.status = "processed"
    document.char_count = len(extracted_text)

    db.commit()
    db.refresh(document)

    return document