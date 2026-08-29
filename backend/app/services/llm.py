from functools import lru_cache
from typing import Any, Iterator

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq
from langchain_ollama import ChatOllama

from app.config import settings


class BaseLLMService:
    def generate_answer( #generate_ans exectued when its children doesn't impplemetnt the obj generate_ans
        self,
        question: str,
        context_chunks: list[dict[str, Any]],
    ) -> dict[str, str]:
        raise NotImplementedError

    def stream_answer(
        self,
        question: str,
        context: str,
        history: list[dict] | None = None,
    ) -> Iterator[str]:
        raise NotImplementedError

    def generate_follow_ups(self, answer_text: str) -> list[str]:
        raise NotImplementedError


class PromptMixin:
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

    def _build_prompt(self, question: str, context: str, history: list[dict] | None = None) -> str:
        history_section = ""
        if history:
            lines = []
            for msg in history:
                role = "User" if msg.get("role") == "user" else "Assistant"
                content = msg.get("content", "").strip()
                if content:
                    lines.append(f"{role}: {content}")
            if lines:
                history_section = "\nCONVERSATION HISTORY (current session):\n" + "\n".join(lines) + "\n"

        return f"""
You are a helpful and intelligent AI assistant. Use the document context and conversation history to answer the user's question.

DOCUMENT CONTEXT:
{context}
{history_section}
CURRENT QUESTION:
{question}

Instructions:
- Provide a direct, helpful answer using the context.
- You can infer meaning (e.g., marks = CGPA, grades).
- Only say you do not have enough information if the answer is completely missing from the context.
""".strip()

    def _build_messages(self, prompt: str) -> list:
        return [
            SystemMessage(
                content="You are a document question-answering assistant. Answer only using the provided document context."
            ),
            HumanMessage(content=prompt),
        ]


class GroqLLMService(PromptMixin, BaseLLMService): #parents are PromptMixin & BaseLLMservice
    def __init__(self) -> None:
        if not settings.groq_api_key:
            raise RuntimeError("GROQ_API_KEY is not configured.")

        self.llm = ChatGroq(
            model=settings.groq_model_name,
            api_key=settings.groq_api_key,
            temperature=0.2,
            max_tokens=500,
        )

    def generate_answer(
        self,
        question: str,
        context_chunks: list[dict[str, Any]],
    ) -> dict[str, str]:
        context = self._build_context(context_chunks)
        prompt = self._build_prompt(question, context)

        response = self.llm.invoke(self._build_messages(prompt))

        return {
            "answer": str(response.content).strip(),
            "model": settings.groq_model_name,
            "provider": "groq",
        }

    def stream_answer(
        self,
        question: str,
        context: str,
        history: list[dict] | None = None,
    ) -> Iterator[str]:
        prompt = self._build_prompt(question=question, context=context, history=history)

        for chunk in self.llm.stream(self._build_messages(prompt)):
            if chunk.content:
                yield str(chunk.content)

    def generate_follow_ups(self, answer_text: str) -> list[str]:
        prompt = f"""
Given this answer provided to a user, suggest exactly 3 short, relevant follow-up questions they might ask next.
Return ONLY the 3 questions, one per line, with no numbers, bullets, or intro text.

ANSWER:
{answer_text}
""".strip()
        response = self.llm.invoke([HumanMessage(content=prompt)])
        content = str(response.content).strip().replace('\\n', '\n')
        questions = [q.lstrip("- *1234567890.").strip() for q in content.split('\n') if q.strip()]
        return questions[:3]


class OllamaLLMService(PromptMixin, BaseLLMService):
    def __init__(self) -> None:
        self.llm = ChatOllama(
            base_url=settings.ollama_base_url,
            model=settings.ollama_model,
            temperature=0.2,
        )

    def generate_answer(
        self,
        question: str,
        context_chunks: list[dict[str, Any]],
    ) -> dict[str, str]:
        context = self._build_context(context_chunks)
        prompt = self._build_prompt(question, context)

        response = self.llm.invoke(self._build_messages(prompt))

        return {
            "answer": str(response.content).strip(),
            "model": settings.ollama_model,
            "provider": "ollama",
        }

    def stream_answer(
        self,
        question: str,
        context: str,
        history: list[dict] | None = None,
    ) -> Iterator[str]:
        prompt = self._build_prompt(question=question, context=context, history=history)

        for chunk in self.llm.stream(self._build_messages(prompt)):
            if chunk.content:
                yield str(chunk.content)

    def generate_follow_ups(self, answer_text: str) -> list[str]:
        prompt = f"""
Given this answer provided to a user, suggest exactly 3 short, relevant follow-up questions they might ask next.
Return ONLY the 3 questions, one per line, with no numbers, bullets, or intro text.

ANSWER:
{answer_text}
""".strip()
        response = self.llm.invoke([HumanMessage(content=prompt)])
        content = str(response.content).strip().replace('\\n', '\n')
        questions = [q.lstrip("- *1234567890.").strip() for q in content.split('\n') if q.strip()]
        return questions[:3]


@lru_cache
def get_llm_service() -> BaseLLMService:
    provider = settings.llm_provider.lower()

    if provider == "groq":
        return GroqLLMService()

    if provider == "ollama":
        return OllamaLLMService()

    raise ValueError(f"Unsupported LLM provider: {settings.llm_provider}")