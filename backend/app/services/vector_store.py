import faiss
import numpy as np

from app.services.embedding import get_embedding_service


class VectorStore:
    def __init__(self) -> None:
        self.dimension = 384
        self.index = faiss.IndexFlatIP(self.dimension)
        self.texts: list[str] = []

    def add_texts(self, texts: list[str]) -> int:
        if not texts:
            return 0

        embedding_service = get_embedding_service()
        embeddings = embedding_service.embed_texts(texts)
        vectors = np.array(embeddings, dtype="float32")

        self.index.add(vectors)
        self.texts.extend(texts)

        return len(texts)

    def search(self, query: str, top_k: int = 3) -> list[dict]:
        if not self.texts:
            return []

        embedding_service = get_embedding_service()
        query_embedding = embedding_service.embed_texts([query])
        query_vector = np.array(query_embedding, dtype="float32")

        result_count = min(top_k, len(self.texts))
        scores, indices = self.index.search(query_vector, result_count)

        results = []

        for score, index in zip(scores[0], indices[0]):
            results.append(
                {
                    "text": self.texts[index],
                    "similarity_score": float(score),
                }
            )

        return results