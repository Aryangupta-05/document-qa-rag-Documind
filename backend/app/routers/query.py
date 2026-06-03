from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.llm import get_llm_service
from app.services.vector_store import get_vector_store


router = APIRouter(
    prefix="/query",
    tags=["query"],
)


class AskRequest(BaseModel):
    question: str = Field(..., min_length=3)
    top_k: int = Field(default=3, ge=1, le=10)


@router.post("/ask")
def ask_question(request: AskRequest):
    vector_store = get_vector_store()

    retrieved_chunks = vector_store.search(
        query=request.question,
        top_k=request.top_k,
    )

    if not retrieved_chunks:
        return {
            "success": False,
            "answer": "I could not find relevant information in the indexed documents.",
            "sources": [],
        }

    try:
        llm_result = get_llm_service().generate_answer(
            question=request.question,
            context_chunks=retrieved_chunks,
        )
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"LLM generation failed: {str(error)}",
        )

    return {
        "success": True,
        "question": request.question,
        "answer": llm_result["answer"],
        "model": llm_result["model"],
        "sources": retrieved_chunks,
    }