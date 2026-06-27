from sqlalchemy.orm import Session

from app.models.document import Document
from app.services.chunking import ChunkingService
from app.services.vector_store import get_vector_store
from app.utils.file_storage import read_processed_text


def rebuild_vector_index(db: Session) -> dict:
    documents = (
        db.query(Document)
        .filter(Document.status == "processed")
        .order_by(Document.created_at.asc())
        .all()
    )

    vector_store = get_vector_store()
    vector_store.clear()

    total_chunks = 0
    skipped_documents = []

    for document in documents:
        try:
            processed_text = read_processed_text(document.id)
            chunks = ChunkingService().split_text(processed_text)

            chunk_records = [
                {
                    "document_id": document.id,
                    "filename": document.filename,
                    "chunk_index": index,
                    "text": chunk,
                }
                for index, chunk in enumerate(chunks)
            ]

            vector_store.add_chunks(chunk_records)
            total_chunks += len(chunk_records)

        except FileNotFoundError:
            skipped_documents.append(document.id)

    return {
        "documents_considered": len(documents),
        "chunks_indexed": total_chunks,
        "skipped_documents": skipped_documents,
        "vector_store": vector_store.stats(),
    }