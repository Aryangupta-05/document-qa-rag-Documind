from functools import lru_cache

from sentence_transformers import SentenceTransformer

from app.config import settings


class EmbeddingService:
    def __init__(self) -> None:
        self.model = SentenceTransformer(settings.embedding_model_name)
        self.dimension = self.model.get_embedding_dimension()

    def embed_texts(self, texts: list[str]) -> list[list[float]]:
        embeddings = self.model.encode(
            texts,
            normalize_embeddings=True,
        )

        return embeddings.tolist()

    def get_dimension(self) -> int:
        return self.dimension


@lru_cache
def get_embedding_service() -> EmbeddingService:
    return EmbeddingService()