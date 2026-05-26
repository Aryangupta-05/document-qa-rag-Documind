from pathlib import Path


class DocumentProcessor:
    @staticmethod
    def extract_text(file_path: Path) -> str:
        extension = file_path.suffix.lower()

        if extension == ".txt":
            return DocumentProcessor._extract_from_txt(file_path)

        raise ValueError(f"Text extraction is not implemented for {extension} files yet.")

    @staticmethod
    def _extract_from_txt(file_path: Path) -> str:
        return file_path.read_text(encoding="utf-8").strip()