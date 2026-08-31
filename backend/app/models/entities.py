from datetime import datetime
from enum import StrEnum
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class TestStatus(StrEnum):
    draft = "draft"
    published = "published"
    archived = "archived"


class ExamStatus(StrEnum):
    NOT_STARTED = "NOT_STARTED"
    IN_PROGRESS = "IN_PROGRESS"
    SUBMITTED = "SUBMITTED"
    TIME_EXPIRED = "TIME_EXPIRED"
    REVIEW = "REVIEW"


class ExamModule(StrEnum):
    listening = "listening"
    reading = "reading"
    writing = "writing"


class MockTest(Base):
    __tablename__ = "mock_tests"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    slug: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    title: Mapped[str] = mapped_column(String(240), nullable=False)
    test_type: Mapped[str] = mapped_column(String(40), nullable=False, default="academic")
    description: Mapped[str | None] = mapped_column(Text)
    status: Mapped[TestStatus] = mapped_column(String(20), nullable=False, default=TestStatus.draft)
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    content: Mapped[dict] = mapped_column(JSONB, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    attempts: Mapped[list["ExamAttempt"]] = relationship(back_populates="test")


class Asset(Base):
    __tablename__ = "assets"

    id: Mapped[str] = mapped_column(String(120), primary_key=True)
    test_id: Mapped[str] = mapped_column(ForeignKey("mock_tests.id", ondelete="CASCADE"), nullable=False)
    type: Mapped[str] = mapped_column(String(40), nullable=False)
    file_name: Mapped[str] = mapped_column(String(260), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(120), nullable=False)
    storage_key: Mapped[str] = mapped_column(String(500), nullable=False)
    size: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    extra_metadata: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class ExamAttempt(Base):
    __tablename__ = "exam_attempts"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    test_id: Mapped[str] = mapped_column(ForeignKey("mock_tests.id"), nullable=False)
    test_version: Mapped[int] = mapped_column(Integer, nullable=False)
    module: Mapped[ExamModule] = mapped_column(String(20), nullable=False)
    status: Mapped[ExamStatus] = mapped_column(String(20), nullable=False, default=ExamStatus.IN_PROGRESS)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    test: Mapped[MockTest] = relationship(back_populates="attempts")
    answers: Mapped[list["ExamAnswer"]] = relationship(back_populates="attempt", cascade="all, delete-orphan")
    writing_responses: Mapped[list["WritingResponse"]] = relationship(back_populates="attempt", cascade="all, delete-orphan")
    result: Mapped["ExamResult | None"] = relationship(back_populates="attempt", cascade="all, delete-orphan")


class ExamAnswer(Base):
    __tablename__ = "exam_answers"
    __table_args__ = (UniqueConstraint("attempt_id", "question_id"),)

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    attempt_id: Mapped[str] = mapped_column(ForeignKey("exam_attempts.id", ondelete="CASCADE"), nullable=False)
    question_id: Mapped[str] = mapped_column(String(80), nullable=False)
    value: Mapped[str] = mapped_column(Text, nullable=False, default="")
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    attempt: Mapped[ExamAttempt] = relationship(back_populates="answers")


class WritingResponse(Base):
    __tablename__ = "writing_responses"
    __table_args__ = (UniqueConstraint("attempt_id", "task_number"),)

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    attempt_id: Mapped[str] = mapped_column(ForeignKey("exam_attempts.id", ondelete="CASCADE"), nullable=False)
    task_number: Mapped[int] = mapped_column(Integer, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False, default="")
    word_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    attempt: Mapped[ExamAttempt] = relationship(back_populates="writing_responses")


class ExamResult(Base):
    __tablename__ = "exam_results"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    attempt_id: Mapped[str] = mapped_column(ForeignKey("exam_attempts.id", ondelete="CASCADE"), unique=True, nullable=False)
    raw_score: Mapped[int | None] = mapped_column(Integer)
    max_score: Mapped[int | None] = mapped_column(Integer)
    band_score: Mapped[str | None] = mapped_column(String(8))
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    graded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    attempt: Mapped[ExamAttempt] = relationship(back_populates="result")


class Highlight(Base):
    __tablename__ = "highlights"

    id: Mapped[str] = mapped_column(String(180), primary_key=True)
    attempt_id: Mapped[str] = mapped_column(ForeignKey("exam_attempts.id", ondelete="CASCADE"), nullable=False)
    passage_id: Mapped[str] = mapped_column(String(120), nullable=False)
    block_id: Mapped[str] = mapped_column(String(120), nullable=False)
    start_offset: Mapped[int] = mapped_column(Integer, nullable=False)
    end_offset: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
