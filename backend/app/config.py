from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "DocuMind AI"
    api_prefix: str = "/api/v1"
    environment: str = "development"


settings = Settings()