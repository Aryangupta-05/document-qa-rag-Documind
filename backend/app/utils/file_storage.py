from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from app.config import settings


def save_upload(file: UploadFile) -> tuple[str, Path]:
    file_id = str(uuid4())
    extension = Path(file.filename or "").suffix.lower()
    saved_filename = f"{file_id}{extension}"

    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    file_path = settings.upload_dir / saved_filename

    with file_path.open("wb") as destination:
        destination.write(file.file.read())

    return file_id, file_path