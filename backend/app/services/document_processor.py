from pathlib import Path

from docx import Document as WordDocument
from pypdf import PdfReader


class DocumentProcessor:
    @staticmethod
    def extract_text(file_path: Path) -> str:
        extension = file_path.suffix.lower()

        if extension == ".txt":
            return DocumentProcessor._extract_from_txt(file_path)

        if extension == ".pdf":
            return DocumentProcessor._extract_from_pdf(file_path)

        if extension == ".docx":
            return DocumentProcessor._extract_from_docx(file_path)

        raise ValueError(f"Text extraction is not implemented for {extension} files yet.")

    @staticmethod
    def _extract_from_txt(file_path: Path) -> str:
        return file_path.read_text(encoding="utf-8").strip()

    @staticmethod
    def _extract_from_pdf(file_path: Path) -> str:
        reader = PdfReader(file_path)
        pages_text = []

        for page in reader.pages:
            text = page.extract_text()

            if text:
                pages_text.append(text)

        return "\n\n".join(pages_text).strip()

    @staticmethod
    def _extract_from_docx(file_path: Path) -> str:
        document = WordDocument(file_path)
        paragraphs = []

        for paragraph in document.paragraphs:
            text = paragraph.text.strip()

            if text:
                paragraphs.append(text)

        return "\n\n".join(paragraphs).strip()