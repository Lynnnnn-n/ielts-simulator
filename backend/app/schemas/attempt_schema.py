from typing import Literal

from pydantic import BaseModel, Field


class CreateAttemptRequest(BaseModel):
    testId: str
    module: Literal["listening", "reading", "writing"]


class AttemptResponse(BaseModel):
    id: str
    testId: str
    testVersion: int
    module: str
    status: str
    startedAt: str
    expiresAt: str
    submittedAt: str | None
    answers: dict[str, str] = Field(default_factory=dict)
    writing: dict[str, str] = Field(default_factory=dict)
    highlights: list[dict] = Field(default_factory=list)


class SaveAnswerRequest(BaseModel):
    value: str


class SaveWritingRequest(BaseModel):
    content: str


class ResultResponse(BaseModel):
    attemptId: str
    rawScore: int | None
    maxScore: int | None
    bandScore: float | None
    payload: dict


class ReviewResponse(BaseModel):
    attemptId: str
    module: str
    items: list[dict]


class HighlightRequest(BaseModel):
    id: str
    passageId: str
    blockId: str
    startOffset: int
    endOffset: int
