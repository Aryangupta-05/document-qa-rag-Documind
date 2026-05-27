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
    max_file_size_mb: int = 20
    chunk_size: int = 500
    chunk_overlap: int = 100

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )


settings = Settings()