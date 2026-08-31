import re
from typing import Any


def normalize_answer(value: str) -> str:
    return re.sub(r"\s+", " ", value.strip()).lower()


LISTENING_SCALE = [
    (39, 9),
    (37, 8.5),
    (35, 8),
    (32, 7.5),
    (30, 7),
    (26, 6.5),
    (23, 6),
    (18, 5.5),
    (16, 5),
    (13, 4.5),
    (10, 4),
    (0, 0),
]

ACADEMIC_READING_SCALE = [
    (39, 9),
    (37, 8.5),
    (35, 8),
    (33, 7.5),
    (30, 7),
    (27, 6.5),
    (23, 6),
    (19, 5.5),
    (15, 5),
    (13, 4.5),
    (10, 4),
    (0, 0),
]


def convert_raw_score(module: str, correct_count: int) -> float | None:
    scale = LISTENING_SCALE if module == "listening" else ACADEMIC_READING_SCALE
    for minimum, band in scale:
        if correct_count >= minimum:
            return band
    return None


def grade_objective_module(
    module: str,
    questions: list[dict[str, Any]],
    answer_key: list[dict[str, Any]],
    answers: dict[str, str],
) -> dict[str, Any]:
    key_by_question_id = {entry["questionId"]: entry for entry in answer_key}
    items = []

    for question in questions:
        question_id = question["id"]
        key = key_by_question_id.get(question_id)
        raw_answer = answers.get(question_id, "")
        normalized_answer = normalize_answer(raw_answer)
        accepted = [normalize_answer(item) for item in key.get("acceptedAnswers", [])] if key else []
        is_unanswered = normalized_answer == ""
        is_correct = not is_unanswered and normalized_answer in accepted

        items.append(
            {
                "questionId": question_id,
                "number": question["number"],
                "userAnswer": raw_answer,
                "correctAnswer": key.get("displayAnswer", "") if key else "",
                "isCorrect": is_correct,
                "status": "unanswered" if is_unanswered else "correct" if is_correct else "incorrect",
            }
        )

    correct_count = len([item for item in items if item["isCorrect"]])
    return {
        "module": module,
        "correctCount": correct_count,
        "totalQuestions": len(questions),
        "bandScore": convert_raw_score(module, correct_count),
        "items": items,
    }


def word_count(value: str) -> int:
    return len(re.findall(r"\b[\w'-]+\b", value))
