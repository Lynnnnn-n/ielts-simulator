from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.errors import api_error
from app.db.session import get_db
from app.models.entities import ExamAnswer, ExamAttempt, ExamResult, Highlight, MockTest, WritingResponse
from app.schemas.attempt_schema import (
    AttemptResponse,
    CreateAttemptRequest,
    HighlightRequest,
    ResultResponse,
    ReviewResponse,
    SaveAnswerRequest,
    SaveWritingRequest,
)
from app.services.grading import grade_objective_module, word_count

router = APIRouter(prefix="/api/attempts", tags=["attempts"])


def duration_for(test: MockTest, module: str) -> int:
    return int(test.content[module].get("durationSeconds", 60 * 60))


def get_attempt(db: Session, attempt_id: str) -> ExamAttempt:
    attempt = db.get(ExamAttempt, attempt_id)
    if attempt is None:
        raise api_error(404, "ATTEMPT_NOT_FOUND", "Attempt was not found.")
    return attempt


def ensure_editable(attempt: ExamAttempt) -> None:
    if attempt.status != "IN_PROGRESS":
        raise api_error(409, "ATTEMPT_LOCKED", "Submitted attempts cannot be edited.")


def serialize_attempt(attempt: ExamAttempt) -> AttemptResponse:
    return AttemptResponse(
        id=attempt.id,
        testId=attempt.test_id,
        testVersion=attempt.test_version,
        module=attempt.module,
        status=attempt.status,
        startedAt=attempt.started_at.isoformat(),
        expiresAt=attempt.expires_at.isoformat(),
        submittedAt=attempt.submitted_at.isoformat() if attempt.submitted_at else None,
        answers={answer.question_id: answer.value for answer in attempt.answers},
        writing={f"task{item.task_number}": item.content for item in attempt.writing_responses},
        highlights=[
            {
                "id": item.id,
                "passageId": item.passage_id,
                "blockId": item.block_id,
                "startOffset": item.start_offset,
                "endOffset": item.end_offset,
            }
            for item in []
        ],
    )


@router.post("", response_model=AttemptResponse)
def create_attempt(payload: CreateAttemptRequest, db: Session = Depends(get_db)) -> AttemptResponse:
    test = db.get(MockTest, payload.testId)
    if test is None or test.status != "published":
        raise api_error(404, "TEST_NOT_FOUND", "Published test was not found.")

    now = datetime.now(UTC)
    attempt = ExamAttempt(
        test_id=test.id,
        test_version=test.version,
        module=payload.module,
        status="IN_PROGRESS",
        started_at=now,
        expires_at=now + timedelta(seconds=duration_for(test, payload.module)),
        created_at=now,
        updated_at=now,
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return serialize_attempt(attempt)


@router.get("/{attempt_id}", response_model=AttemptResponse)
def read_attempt(attempt_id: str, db: Session = Depends(get_db)) -> AttemptResponse:
    return serialize_attempt(get_attempt(db, attempt_id))


@router.put("/{attempt_id}/answers/{question_id}", response_model=AttemptResponse)
def save_answer(
    attempt_id: str,
    question_id: str,
    payload: SaveAnswerRequest,
    db: Session = Depends(get_db),
) -> AttemptResponse:
    attempt = get_attempt(db, attempt_id)
    ensure_editable(attempt)
    now = datetime.now(UTC)
    answer = db.scalar(
        select(ExamAnswer).where(
            ExamAnswer.attempt_id == attempt_id,
            ExamAnswer.question_id == question_id,
        )
    )
    if answer is None:
        answer = ExamAnswer(
            attempt_id=attempt_id,
            question_id=question_id,
            value=payload.value,
            updated_at=now,
        )
        db.add(answer)
    else:
        answer.value = payload.value
        answer.updated_at = now
    attempt.updated_at = now
    db.commit()
    db.refresh(attempt)
    return serialize_attempt(attempt)


@router.put("/{attempt_id}/writing/{task_number}", response_model=AttemptResponse)
def save_writing(
    attempt_id: str,
    task_number: int,
    payload: SaveWritingRequest,
    db: Session = Depends(get_db),
) -> AttemptResponse:
    if task_number not in (1, 2):
        raise api_error(400, "INVALID_TASK_NUMBER", "Writing task number must be 1 or 2.")

    attempt = get_attempt(db, attempt_id)
    ensure_editable(attempt)
    now = datetime.now(UTC)
    response = db.scalar(
        select(WritingResponse).where(
            WritingResponse.attempt_id == attempt_id,
            WritingResponse.task_number == task_number,
        )
    )
    if response is None:
        response = WritingResponse(
            attempt_id=attempt_id,
            task_number=task_number,
            content=payload.content,
            word_count=word_count(payload.content),
            updated_at=now,
        )
        db.add(response)
    else:
        response.content = payload.content
        response.word_count = word_count(payload.content)
        response.updated_at = now
    attempt.updated_at = now
    db.commit()
    db.refresh(attempt)
    return serialize_attempt(attempt)


@router.post("/{attempt_id}/submit", response_model=AttemptResponse)
def submit_attempt(attempt_id: str, db: Session = Depends(get_db)) -> AttemptResponse:
    attempt = get_attempt(db, attempt_id)
    ensure_editable(attempt)
    now = datetime.now(UTC)
    attempt.status = "TIME_EXPIRED" if now >= attempt.expires_at else "SUBMITTED"
    attempt.submitted_at = now
    attempt.updated_at = now

    answers = {answer.question_id: answer.value for answer in attempt.answers}
    if attempt.module in ("listening", "reading"):
        module_content = attempt.test.content[attempt.module]
        payload = grade_objective_module(
            attempt.module,
            module_content.get("questions", []),
            module_content.get("answerKey", []),
            answers,
        )
        db.add(
            ExamResult(
                attempt_id=attempt.id,
                raw_score=payload["correctCount"],
                max_score=payload["totalQuestions"],
                band_score=str(payload["bandScore"]) if payload["bandScore"] is not None else None,
                payload=payload,
                graded_at=now,
            )
        )
    else:
        writing = {item.task_number: item for item in attempt.writing_responses}
        payload = {
            "task1WordCount": writing.get(1).word_count if writing.get(1) else 0,
            "task2WordCount": writing.get(2).word_count if writing.get(2) else 0,
            "submittedAt": now.isoformat(),
        }
        db.add(
            ExamResult(
                attempt_id=attempt.id,
                raw_score=None,
                max_score=None,
                band_score=None,
                payload=payload,
                graded_at=now,
            )
        )
    db.commit()
    db.refresh(attempt)
    return serialize_attempt(attempt)


@router.get("/{attempt_id}/result", response_model=ResultResponse)
def read_result(attempt_id: str, db: Session = Depends(get_db)) -> ResultResponse:
    attempt = get_attempt(db, attempt_id)
    if attempt.result is None:
        raise api_error(404, "RESULT_NOT_FOUND", "Result was not found.")
    return ResultResponse(
        attemptId=attempt.id,
        rawScore=attempt.result.raw_score,
        maxScore=attempt.result.max_score,
        bandScore=float(attempt.result.band_score) if attempt.result.band_score else None,
        payload=attempt.result.payload,
    )


@router.get("/{attempt_id}/review", response_model=ReviewResponse)
def read_review(attempt_id: str, db: Session = Depends(get_db)) -> ReviewResponse:
    attempt = get_attempt(db, attempt_id)
    if attempt.status not in ("SUBMITTED", "TIME_EXPIRED", "REVIEW"):
        raise api_error(409, "REVIEW_NOT_AVAILABLE", "Review is available only after submission.")
    if attempt.result is None:
        raise api_error(404, "RESULT_NOT_FOUND", "Result was not found.")
    return ReviewResponse(
        attemptId=attempt.id,
        module=attempt.module,
        items=attempt.result.payload.get("items", []),
    )


@router.post("/{attempt_id}/highlights", response_model=AttemptResponse)
def create_highlight(
    attempt_id: str,
    payload: HighlightRequest,
    db: Session = Depends(get_db),
) -> AttemptResponse:
    attempt = get_attempt(db, attempt_id)
    ensure_editable(attempt)
    db.add(
        Highlight(
            id=payload.id,
            attempt_id=attempt_id,
            passage_id=payload.passageId,
            block_id=payload.blockId,
            start_offset=payload.startOffset,
            end_offset=payload.endOffset,
            created_at=datetime.now(UTC),
        )
    )
    db.commit()
    db.refresh(attempt)
    return serialize_attempt(attempt)


@router.delete("/{attempt_id}/highlights/{highlight_id}", response_model=AttemptResponse)
def delete_highlight(
    attempt_id: str,
    highlight_id: str,
    db: Session = Depends(get_db),
) -> AttemptResponse:
    attempt = get_attempt(db, attempt_id)
    ensure_editable(attempt)
    highlight = db.get(Highlight, highlight_id)
    if highlight and highlight.attempt_id == attempt_id:
        db.delete(highlight)
        db.commit()
        db.refresh(attempt)
    return serialize_attempt(attempt)
