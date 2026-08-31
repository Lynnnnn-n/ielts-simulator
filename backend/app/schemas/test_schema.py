from typing import Any, Literal

from pydantic import BaseModel, Field, model_validator


class Modules(BaseModel):
    listening: bool = False
    reading: bool = False
    writing: bool = False


class MockTestMetadata(BaseModel):
    id: str
    slug: str
    title: str
    testType: Literal["academic", "general-training"]
    description: str | None = None
    status: Literal["draft", "published", "archived"] = "draft"
    modules: Modules
    version: int = 1
    createdAt: str
    updatedAt: str
    sourceNotes: list[str] = Field(default_factory=list)


class AnswerKeyEntry(BaseModel):
    questionId: str
    number: int
    acceptedAnswers: list[str]
    displayAnswer: str


class TestAsset(BaseModel):
    id: str
    type: Literal["audio", "image", "pdf", "document"]
    path: str
    assetUrl: str | None = None
    fileName: str | None = None
    mimeType: str | None = None
    storageKey: str | None = None
    size: int | None = None
    description: str


class MockTestPayload(BaseModel):
    metadata: MockTestMetadata
    materials: dict[str, Any]
    assets: list[TestAsset] = Field(default_factory=list)
    listening: dict[str, Any]
    reading: dict[str, Any]
    writing: dict[str, Any]

    @model_validator(mode="after")
    def validate_references(self) -> "MockTestPayload":
        errors: list[str] = []
        asset_ids = {asset.id for asset in self.assets}

        for module_name in ("listening", "reading"):
            module = getattr(self, module_name)
            questions = module.get("questions", [])
            question_ids = {question.get("id") for question in questions}
            numbers = [question.get("number") for question in questions]

            if len(numbers) != len(set(numbers)):
                errors.append(f"{module_name}: duplicate question numbers")

            for key in module.get("answerKey", []):
                question_id = key.get("questionId")
                if question_id not in question_ids:
                    errors.append(f"{module_name}: orphan answer key for {question_id}")
                if not key.get("acceptedAnswers"):
                    errors.append(f"{module_name}: missing accepted answers for {question_id}")

            for group in module.get("questionGroups", []) or []:
                for question_id in group.get("questionIds", []):
                    if question_id not in question_ids:
                        errors.append(f"{module_name}: group references missing {question_id}")

        for part in self.listening.get("parts", []):
            audio_asset_id = part.get("audioAssetId")
            if audio_asset_id and audio_asset_id not in asset_ids:
                errors.append(f"listening: missing audio asset {audio_asset_id}")
            for asset_id in part.get("imageAssetIds", []) or []:
                if asset_id not in asset_ids:
                    errors.append(f"listening: missing image asset {asset_id}")

        for passage in self.reading.get("passages", []):
            for asset_id in passage.get("imageAssetIds", []) or []:
                if asset_id not in asset_ids:
                    errors.append(f"reading: missing image asset {asset_id}")

        for task_name in ("task1", "task2"):
            task = self.writing.get(task_name)
            if task:
                for asset_id in task.get("imageAssetIds", []) or []:
                    if asset_id not in asset_ids:
                        errors.append(f"writing: missing image asset {asset_id}")

        if errors:
            raise ValueError("; ".join(errors))

        return self


class ImportResult(BaseModel):
    testId: str
    status: str
    validationErrors: list[str] = Field(default_factory=list)
