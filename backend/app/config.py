from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "DocuMind AI"
    api_prefix: str = "/api/v1"
    environment: str = "development"

    database_url: str

    upload_dir: Path = Path("uploads")
    allowed_extensions: set[str] = {".pdf", ".docx", ".txt", ".html", ".md"}
    max_file_size_mb: int = 20

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )


settings = Settings()