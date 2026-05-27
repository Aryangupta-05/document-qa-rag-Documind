from sentence_transformers import SentenceTransformer

from app.config import settings

from functools import lru_cache




class EmbeddingService:
    def __init__(self) -> None:
        self.model = SentenceTransformer(settings.embedding_model_name)

    def embed_texts(self, texts: list[str]) -> list[list[float]]:
        embeddings = self.model.encode(
            texts,
            normalize_embeddings=True,
        )

        return embeddings.tolist()

    def calculate_similarity(self, first_text: str, second_text: str) -> float:
        embeddings = self.embed_texts([first_text, second_text])
        first_vector = embeddings[0]
        second_vector = embeddings[1]

        similarity = sum(
            first_value * second_value
            for first_value, second_value in zip(first_vector, second_vector)
        )

        return float(similarity)

@lru_cache
def get_embedding_service() -> EmbeddingService:
    return EmbeddingService()