from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "DocuMind AI"
    api_prefix: str = "/api/v1"
    environment: str = "development"

    database_url: str

    upload_dir: Path = Path("uploads") # original user file
    processed_dir: Path = Path("processed") #extracted plain text files
    allowed_extensions: set[str] = {".pdf", ".docx", ".txt", ".html", ".md"}
    max_file_size_mb: int =20

    embedding_model_name: str = "sentence-transformers/all-MiniLM-L6-v2"
    
    chunk_size: int = 1000
    chunk_overlap: int = 200

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )
    llm_provider: str = "groq"

    groq_api_key: str | None = None
    groq_model_name: str = "llama-3.1-8b-instant"
    
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.1"

    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ]

settings = Settings()