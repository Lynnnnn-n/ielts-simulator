from fastapi import APIRouter, Depends, Header, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.errors import api_error
from app.core.config import get_settings
from app.db.session import get_db
from app.models.entities import MockTest
from app.schemas.test_schema import ImportResult, MockTestPayload
from app.services.test_import import import_mock_test, metadata_from_model

router = APIRouter(prefix="/api/admin/tests", tags=["admin-tests"])


def require_admin(x_admin_token: str | None = Header(default=None)) -> None:
    settings = get_settings()
    if x_admin_token != settings.admin_token:
        raise api_error(401, "UNAUTHORIZED", "Admin token is required.")


@router.get("")
def list_all_tests(
    _: None = Depends(require_admin),
    db: Session = Depends(get_db),
) -> list[dict]:
    tests = db.scalars(select(MockTest).order_by(MockTest.updated_at.desc())).all()
    return [metadata_from_model(test) for test in tests]


@router.post("/import", response_model=ImportResult)
def import_test(
    payload: MockTestPayload,
    _: None = Depends(require_admin),
    db: Session = Depends(get_db),
) -> ImportResult:
    test = import_mock_test(db, payload)
    return ImportResult(testId=test.id, status=test.status)


@router.post("/{test_id}/publish")
def publish_test(
    test_id: str,
    _: None = Depends(require_admin),
    db: Session = Depends(get_db),
) -> dict:
    test = db.get(MockTest, test_id)
    if test is None:
        raise api_error(404, "TEST_NOT_FOUND", "Test was not found.")

    test.status = "published"
    test.content["metadata"]["status"] = "published"
    db.commit()
    return metadata_from_model(test)


@router.post("/{test_id}/archive")
def archive_test(
    test_id: str,
    _: None = Depends(require_admin),
    db: Session = Depends(get_db),
) -> dict:
    test = db.get(MockTest, test_id)
    if test is None:
        raise api_error(404, "TEST_NOT_FOUND", "Test was not found.")

    test.status = "archived"
    test.content["metadata"]["status"] = "archived"
    db.commit()
    return metadata_from_model(test)


@router.delete("/{test_id}")
def delete_draft_test(
    test_id: str,
    _: None = Depends(require_admin),
    db: Session = Depends(get_db),
) -> dict:
    test = db.get(MockTest, test_id)
    if test is None:
        raise api_error(404, "TEST_NOT_FOUND", "Test was not found.")
    if test.status != "draft":
        raise api_error(409, "ONLY_DRAFT_CAN_BE_DELETED", "Only draft tests can be deleted.")

    db.delete(test)
    db.commit()
    return {"deleted": True}


@router.post("/{test_id}/assets")
async def upload_asset(
    test_id: str,
    file: UploadFile,
    _: None = Depends(require_admin),
) -> dict:
    allowed = {"image/png", "image/jpeg", "image/webp", "audio/mpeg", "application/pdf"}
    if file.content_type not in allowed:
        raise api_error(400, "UNSUPPORTED_ASSET_TYPE", "Unsupported asset file type.")

    return {
        "testId": test_id,
        "fileName": file.filename,
        "contentType": file.content_type,
        "status": "accepted",
        "message": "Storage write is reserved for the next V2 implementation step.",
    }
