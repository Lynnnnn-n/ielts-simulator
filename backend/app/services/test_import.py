from datetime import UTC, datetime
from typing import Any

from sqlalchemy.orm import Session

from app.models.entities import Asset, MockTest
from app.schemas.test_schema import MockTestPayload


def strip_answer_keys(content: dict[str, Any]) -> dict[str, Any]:
    public_content = dict(content)
    for module_name in ("listening", "reading"):
        module = dict(public_content[module_name])
        module["answerKey"] = []
        public_content[module_name] = module
    return public_content


def metadata_from_model(test: MockTest) -> dict[str, Any]:
    content_metadata = test.content["metadata"]
    return {
        **content_metadata,
        "id": test.id,
        "slug": test.slug,
        "title": test.title,
        "testType": test.test_type,
        "description": test.description,
        "status": test.status,
        "version": test.version,
    }


def import_mock_test(db: Session, payload: MockTestPayload) -> MockTest:
    now = datetime.now(UTC)
    content = payload.model_dump(mode="json")
    content["metadata"]["status"] = "draft"
    content["metadata"]["version"] = payload.metadata.version or 1
    content["metadata"]["updatedAt"] = now.isoformat()
    content["metadata"]["createdAt"] = payload.metadata.createdAt or now.isoformat()

    test = db.get(MockTest, payload.metadata.id)
    if test is None:
        test = MockTest(
            id=payload.metadata.id,
            slug=payload.metadata.slug,
            title=payload.metadata.title,
            test_type=payload.metadata.testType,
            description=payload.metadata.description,
            status="draft",
            version=payload.metadata.version or 1,
            content=content,
            created_at=now,
            updated_at=now,
        )
        db.add(test)
    else:
        test.slug = payload.metadata.slug
        test.title = payload.metadata.title
        test.test_type = payload.metadata.testType
        test.description = payload.metadata.description
        test.status = "draft"
        test.version = payload.metadata.version or test.version
        test.content = content
        test.updated_at = now

    for asset in payload.assets:
        existing_asset = db.get(Asset, asset.id)
        if existing_asset is None:
            db.add(
                Asset(
                    id=asset.id,
                    test_id=payload.metadata.id,
                    type=asset.type,
                    file_name=asset.fileName or asset.path.rsplit("/", 1)[-1],
                    mime_type=asset.mimeType or "application/octet-stream",
                    storage_key=asset.storageKey or asset.path,
                    size=asset.size or 0,
                    extra_metadata={"description": asset.description},
                    created_at=now,
                )
            )

    db.commit()
    db.refresh(test)
    return test
