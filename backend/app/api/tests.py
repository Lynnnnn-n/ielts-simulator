from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.errors import api_error
from app.db.session import get_db
from app.models.entities import MockTest
from app.services.test_import import metadata_from_model, strip_answer_keys

router = APIRouter(prefix="/api/tests", tags=["tests"])


@router.get("")
def list_published_tests(db: Session = Depends(get_db)) -> list[dict]:
    tests = db.scalars(
        select(MockTest).where(MockTest.status == "published").order_by(MockTest.updated_at.desc())
    ).all()
    return [metadata_from_model(test) for test in tests]


@router.get("/{test_id}")
def get_published_test(test_id: str, db: Session = Depends(get_db)) -> dict:
    test = db.get(MockTest, test_id)
    if test is None:
        test = db.scalar(select(MockTest).where(MockTest.slug == test_id))

    if test is None or test.status != "published":
        raise api_error(404, "TEST_NOT_FOUND", "Published test was not found.")

    return strip_answer_keys(test.content)
