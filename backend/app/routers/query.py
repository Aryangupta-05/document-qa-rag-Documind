import time

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.query import QueryHistory
from app.schemas.query import QueryHistoryListResponse
from app.services.llm import get_llm_service
from app.services.vector_store import get_vector_store


router = APIRouter(
    prefix="/query",
    tags=["query"],
)


class AskRequest(BaseModel):
    question: str = Field(..., min_length=3)
    top_k: int = Field(default=3, ge=1, le=10)


def save_query_history(
    db: Session,
    question: str,
    answer: str | None,
    model: str | None,
    sources_count: int,
    response_time: float,
    success: bool,
) -> None:
    history = QueryHistory(
        question=question,
        answer=answer,
        model=model,
        sources_count=sources_count,
        response_time=response_time,
        success=success,
    )

    db.add(history)
    db.commit()


@router.post("/ask")
def ask_question(
    request: AskRequest,
    db: Session = Depends(get_db),
):
    start_time = time.perf_counter()
    vector_store = get_vector_store()

    retrieved_chunks = vector_store.search(
        query=request.question,
        top_k=request.top_k,
    )

    if not retrieved_chunks:
        response_time = time.perf_counter() - start_time
        answer = "I could not find relevant information in the indexed documents."

        save_query_history(
            db=db,
            question=request.question,
            answer=answer,
            model=None,
            sources_count=0,
            response_time=response_time,
            success=False,
        )

        return {
            "success": False,
            "answer": answer,
            "sources": [],
            "response_time": response_time,
        }

    try:
        llm_result = get_llm_service().generate_answer(
            question=request.question,
            context_chunks=retrieved_chunks,
        )

    except Exception as error:
        response_time = time.perf_counter() - start_time
        answer = f"LLM generation failed: {str(error)}"

        save_query_history(
            db=db,
            question=request.question,
            answer=answer,
            model=None,
            sources_count=len(retrieved_chunks),
            response_time=response_time,
            success=False,
        )

        raise HTTPException(
            status_code=500,
            detail=answer,
        )

    response_time = time.perf_counter() - start_time

    save_query_history(
        db=db,
        question=request.question,
        answer=llm_result["answer"],
        model=llm_result["model"],
        sources_count=len(retrieved_chunks),
        response_time=response_time,
        success=True,
    )

    return {
        "success": True,
        "question": request.question,
        "answer": llm_result["answer"],
        "model": llm_result["model"],
        "sources": retrieved_chunks,
        "response_time": response_time,
    }


@router.get("/history", response_model=QueryHistoryListResponse)
def get_query_history(
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    queries = (
        db.query(QueryHistory)
        .order_by(QueryHistory.created_at.desc())
        .limit(limit)
        .all()
    )

    return {
        "queries": queries,
        "count": len(queries),
    }