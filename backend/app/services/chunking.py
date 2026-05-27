from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.config import settings


class ChunkingService:
    def __init__(self) -> None:
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.chunk_size,
            chunk_overlap=settings.chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""],
        )

    def split_text(self, text: str) -> list[str]:
        cleaned_text = text.strip()

        if not cleaned_text:
            return []

        return self.splitter.split_text(cleaned_text)