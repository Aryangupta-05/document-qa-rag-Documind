import json
import time

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
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
    document_ids: list[str] | None = None


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
        document_ids=request.document_ids,
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


@router.post("/ask-stream")
def ask_question_stream(
    request: AskRequest,
    db: Session = Depends(get_db),
):
    start_time = time.perf_counter()
    vector_store = get_vector_store()

    retrieved_chunks = vector_store.search(
        query=request.question,
        top_k=request.top_k,
        document_ids=request.document_ids,
    )

    if not retrieved_chunks:
        def no_results_stream():
            payload = {
                "type": "error",
                "message": "No indexed document chunks found. Upload and index documents first.",
            }
            yield f"data: {json.dumps(payload)}\n\n"

        return StreamingResponse(
            no_results_stream(),
            media_type="text/event-stream",
        )

    context = "\n\n".join(
        [
            f"Source: {chunk.get('filename')}\n{chunk.get('text')}"
            for chunk in retrieved_chunks
        ]
    )

    llm_service = get_llm_service()

    def event_stream():
        full_answer = ""

        try:
            sources_payload = {
                "type": "sources",
                "sources": [
                    {
                        "document_id": chunk.get("document_id"),
                        "filename": chunk.get("filename"),
                        "chunk_index": chunk.get("chunk_index"),
                        "similarity_score": chunk.get("similarity_score"),
                    }
                    for chunk in retrieved_chunks
                ],
            }
            yield f"data: {json.dumps(sources_payload)}\n\n"

            for token in llm_service.stream_answer(
                question=request.question,
                context=context,
            ):
                full_answer += token

                payload = {
                    "type": "token",
                    "content": token,
                }
                yield f"data: {json.dumps(payload)}\n\n"

            response_time = time.perf_counter() - start_time

            save_query_history(
                db=db,
                question=request.question,
                answer=full_answer,
                model=None,
                sources_count=len(retrieved_chunks),
                response_time=response_time,
                success=True,
            )

            done_payload = {
                "type": "done",
                "response_time": response_time,
            }
            yield f"data: {json.dumps(done_payload)}\n\n"

        except Exception as error:
            response_time = time.perf_counter() - start_time

            save_query_history(
                db=db,
                question=request.question,
                answer=str(error),
                model=None,
                sources_count=len(retrieved_chunks),
                response_time=response_time,
                success=False,
            )

            error_payload = {
                "type": "error",
                "message": "Streaming answer failed.",
            }
            yield f"data: {json.dumps(error_payload)}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
    )


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