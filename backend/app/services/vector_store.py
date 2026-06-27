from functools import lru_cache
from typing import Any

import faiss
import numpy as np

from app.services.embedding import get_embedding_service


class VectorStore:
    def __init__(self) -> None:
        self.dimension = 384
        self.index = faiss.IndexFlatIP(self.dimension)
        self.chunks: list[dict[str, Any]] = []

    def add_chunks(self, chunks: list[dict[str, Any]]) -> int:
        if not chunks:
            return 0

        texts = [chunk["text"] for chunk in chunks]

        embedding_service = get_embedding_service()
        embeddings = embedding_service.embed_texts(texts)
        vectors = np.array(embeddings, dtype="float32")

        self.index.add(vectors)
        self.chunks.extend(chunks)

        return len(chunks)

    def search(
        self,
        query: str,
        top_k: int = 3,
        document_ids: list[str] | None = None,
    ) -> list[dict[str, Any]]:
        if not self.chunks:
            return []

        allowed_document_ids = set(document_ids or [])

        embedding_service = get_embedding_service()
        query_embedding = embedding_service.embed_texts([query])
        query_vector = np.array(query_embedding, dtype="float32")

        search_count = len(self.chunks)
        scores, indices = self.index.search(query_vector, search_count)

        results = []

        for score, index in zip(scores[0], indices[0]):
            chunk = self.chunks[index]

            if allowed_document_ids and chunk.get("document_id") not in allowed_document_ids:
                continue

            result = chunk.copy()
            result["similarity_score"] = float(score)
            results.append(result)

            if len(results) >= top_k:
                break

        return results

    def stats(self) -> dict[str, int]:
        return {
            "total_chunks": len(self.chunks),
            "index_size": self.index.ntotal,
            "dimension": self.dimension,
        }
    
    def clear(self) -> None:
        self.index = faiss.IndexFlatIP(self.dimension)
        self.chunks = []



@lru_cache
def get_vector_store() -> VectorStore:
    return VectorStore()