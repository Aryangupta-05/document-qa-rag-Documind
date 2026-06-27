from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.services.document_processor import DocumentProcessor

from app.config import settings
from app.database import get_db
from app.models.document import Document
from app.schemas.document import DocumentListResponse, DocumentResponse

from app.utils.file_storage import (
    delete_file_if_exists,
    get_processed_text_path,
    read_processed_text,
    save_processed_text,
    save_upload,
)

from pydantic import BaseModel

from app.services.chunking import ChunkingService

from app.services.embedding import get_embedding_service

from app.services.vector_store import VectorStore,get_vector_store

from app.services.indexing import rebuild_vector_index

router = APIRouter(
    prefix="/documents",
    tags=["documents"],
)

class DocumentSearchRequest(BaseModel):
    query: str
    top_k: int = 3


@router.get("", response_model=DocumentListResponse)
def list_documents(db: Session = Depends(get_db)):
    documents = db.query(Document).order_by(Document.created_at.desc()).all()

    return {
        "documents": documents,
        "count": len(documents),
    }

@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(
    document_id: str,
    db: Session = Depends(get_db),
):
    document = (
        db.query(Document)
        .filter(Document.id == document_id)
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )

    return document

@router.get("/{document_id}/processed-text")
def get_processed_text(
    document_id: str,
    db: Session = Depends(get_db),
):
    document = (
        db.query(Document)
        .filter(Document.id == document_id)
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )

    if document.status != "processed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document has no processed text available.",
        )

    try:
        text = read_processed_text(document.id)
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Processed text file not found.",
        )

    return {
        "document_id": document.id,
        "filename": document.filename,
        "char_count": len(text),
        "text": text,
    }

@router.delete("/{document_id}")
def delete_document(
    document_id: str,
    db: Session = Depends(get_db),
):
    document = (
        db.query(Document)
        .filter(Document.id == document_id)
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )

    delete_file_if_exists(Path(document.file_path))
    delete_file_if_exists(get_processed_text_path(document.id))

    db.delete(document)
    db.commit()

    rebuild_result = rebuild_vector_index(db)

    return {
    "message": "Document deleted successfully.",
    "document_id": document_id,
    "rebuild_index": rebuild_result,
}

@router.post("/search")
def search_documents(request: DocumentSearchRequest):
    results = get_vector_store().search(
        query=request.query,
        top_k=request.top_k,
    )

    return {
        "query": request.query,
        "results_count": len(results),
        "vector_store": get_vector_store().stats(),
        "results": results,
    }

@router.post("/rebuild-index")
def rebuild_document_index(db: Session = Depends(get_db)):
    return rebuild_vector_index(db)


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

    try:
        extracted_text = DocumentProcessor.extract_text(file_path)

        if not extracted_text.strip():
            document.status = "failed"
            db.commit()
            db.refresh(document)

            return document

        save_processed_text(document.id, extracted_text)

        chunks = ChunkingService().split_text(extracted_text)

        chunk_records = [
            {
                "document_id": document.id,
                "filename": document.filename,
                "chunk_index": index,
                "text": chunk,
            }
            for index, chunk in enumerate(chunks)
        ]

        get_vector_store().add_chunks(chunk_records)

        document.status = "processed"
        document.char_count = len(extracted_text)
        document.chunks_created = len(chunks)

        db.commit()
        db.refresh(document)

        return document

    except Exception:
        document.status = "failed"
        db.commit()
        db.refresh(document)

        return document