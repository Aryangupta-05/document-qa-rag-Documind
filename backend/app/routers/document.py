from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.services.document_processor import DocumentProcessor

from app.config import settings
from app.database import get_db
from app.models.document import Document
from app.schemas.document import DocumentListResponse, DocumentResponse
from app.utils.file_storage import save_upload,save_processed_text

from pydantic import BaseModel

from app.services.chunking import ChunkingService

from app.services.embedding import get_embedding_service

from app.services.vector_store import VectorStore

router = APIRouter(
    prefix="/documents",
    tags=["documents"],
)
class ChunkTestRequest(BaseModel):
    text: str

class VectorSearchTestRequest(BaseModel):
    query: str
    texts: list[str]
    top_k: int = 3

@router.get("", response_model=DocumentListResponse)
def list_documents(db: Session = Depends(get_db)):
    documents = db.query(Document).order_by(Document.created_at.desc()).all()

    return {
        "documents": documents,
        "count": len(documents),
    }

@router.post("/test-chunks")
def test_chunks(request: ChunkTestRequest):
    chunks = ChunkingService().split_text(request.text)

    return {
        "chunk_size": settings.chunk_size,
        "chunk_overlap": settings.chunk_overlap,
        "chunk_count": len(chunks),
        "chunks": chunks,
    }

class EmbeddingTestRequest(BaseModel):
    texts: list[str]

class SimilarityTestRequest(BaseModel):
    query: str
    candidates: list[str]

@router.post("/test-embeddings")
def test_embeddings(request: EmbeddingTestRequest):
    embedding_service = get_embedding_service()
    embeddings = embedding_service.embed_texts(request.texts)

    return {
        "model": settings.embedding_model_name,
        "input_count": len(request.texts),
        "embedding_dimension": len(embeddings[0]) if embeddings else 0,
        "embeddings_preview": [vector[:5] for vector in embeddings],
    }


@router.post("/test-similarity")
def test_similarity(request: SimilarityTestRequest):
    embedding_service = get_embedding_service()

    results = [
        {
            "text": candidate,
            "similarity_score": embedding_service.calculate_similarity(
                request.query,
                candidate,
            ),
        }
        for candidate in request.candidates
    ]

    ranked_results = sorted(
        results,
        key=lambda result: result["similarity_score"],
        reverse=True,
    )

    return {
        "query": request.query,
        "results": ranked_results,
    }


@router.post("/test-vector-search")
def test_vector_search(request: VectorSearchTestRequest):
    vector_store = VectorStore()
    vector_store.add_texts(request.texts)

    results = vector_store.search(request.query, request.top_k)

    return {
        "query": request.query,
        "indexed_text_count": len(request.texts),
        "results": results,
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

    try:
        extracted_text = DocumentProcessor.extract_text(file_path)

        if not extracted_text.strip():
            document.status = "failed"
            db.commit()
            db.refresh(document)

            return document

        save_processed_text(document.id, extracted_text)

        chunks = ChunkingService().split_text(extracted_text)

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