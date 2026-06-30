from functools import lru_cache
from typing import Any

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq

from app.config import settings


class LLMService:
    def __init__(self) -> None:
        if not settings.groq_api_key:
            raise RuntimeError("GROQ_API_KEY is not configured.")

        self.llm = ChatGroq(
            model=settings.groq_model_name,
            api_key=settings.groq_api_key,
            temperature=0.2,
            max_tokens=500,
        )

    def stream_answer(self, question: str, context: str):
        prompt = self._build_prompt(question=question, context=context)

        for chunk in self.llm.stream(prompt):
            if chunk.content:
                yield chunk.content

    def generate_answer(
        self,
        question: str,
        context_chunks: list[dict[str, Any]],
    ) -> dict[str, str]:
        context = self._build_context(context_chunks)
        prompt = self._build_prompt(question, context)

        response = self.llm.invoke(
            [
                SystemMessage(
                    content="You are a document question-answering assistant. Answer only using the provided document context."
                ),
                HumanMessage(content=prompt),
            ]
        )

        return {
            "answer": str(response.content).strip(),
            "model": settings.groq_model_name,
        }

    def _build_context(self, chunks: list[dict[str, Any]]) -> str:
        if not chunks:
            return "No relevant context was found."

        context_parts = []

        for index, chunk in enumerate(chunks, start=1):
            filename = chunk.get("filename", "Unknown document")
            text = chunk.get("text", "")

            context_parts.append(
                f"[Source {index}: {filename}]\n{text}"
            )

        return "\n\n".join(context_parts)

    def _build_prompt(self, question: str, context: str) -> str:
        return f"""
Use the document context below to answer the question.

DOCUMENT CONTEXT:
{context}

QUESTION:
{question}

Rules:
- Answer only from the provided context.
- If the context does not contain the answer, say you do not have enough information.
- Be clear and concise.
""".strip()


@lru_cache
def get_llm_service() -> LLMService:
    return LLMService()