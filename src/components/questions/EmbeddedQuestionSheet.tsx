import type { ExamModule, Question } from "../../domain/examTypes";
import styles from "./EmbeddedQuestionSheet.module.css";

interface EmbeddedQuestionSheetProps {
  text: string;
  module: ExamModule;
  questionIds: string[];
  questions: Question[];
  answers: Record<string, string>;
  isReviewMode?: boolean;
  onAnswer: (questionId: string, value: string) => void;
  onFocusQuestion: (questionId: string) => void;
}

const blankPattern = /(?:\. ?){4,}|_{4,}|…+/g;

function getQuestionNumber(questionId: string): number {
  return Number(questionId.replace(/\D/g, ""));
}

function questionIdFor(module: ExamModule, questionNumber: string) {
  const prefix = module === "listening" ? "lq" : "rq";
  return `${prefix}${questionNumber}`;
}

function getChoiceLabels(lines: string[], startIndex: number): string[] {
  const labels: string[] = [];

  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const line = lines[index].trim();

    if (/^\d{1,2}\s+/.test(line)) {
      break;
    }

    const optionMatch = line.match(/^([A-H])(?:\s+|$)/);
    if (optionMatch) {
      labels.push(optionMatch[1]);
    }
  }

  return labels.length >= 2 ? labels : [];
}

function lineClassName(line: string) {
  const trimmed = line.trim();
  const isQuestion = /^\d{1,2}\s+/.test(trimmed);
  const isTitle =
    /^SECTION \d/.test(trimmed) ||
    /^READING PASSAGE \d/.test(trimmed) ||
    /^Questions? \d/.test(trimmed) ||
    /^Test \d/.test(trimmed);

  return [
    styles.line,
    isTitle ? styles.sectionTitle : "",
    isQuestion ? styles.questionLine : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function EmbeddedQuestionSheet({
  text,
  module,
  questionIds,
  questions,
  answers,
  isReviewMode = false,
  onAnswer,
  onFocusQuestion,
}: EmbeddedQuestionSheetProps) {
  const lines = text.split("\n");
  const validQuestionIds = questionIds.filter((questionId) =>
    questions.some((question) => question.id === questionId),
  );
  let nextBlankIndex = 0;

  function renderInput(questionId: string) {
    const number = getQuestionNumber(questionId);

    return (
      <input
        aria-label={`Question ${number}`}
        className={styles.answerInput}
        id={questionId}
        key={`${questionId}:input:${nextBlankIndex}`}
        readOnly={isReviewMode}
        spellCheck={false}
        type="text"
        value={answers[questionId] ?? ""}
        onChange={(event) => onAnswer(questionId, event.target.value)}
        onFocus={() => onFocusQuestion(questionId)}
      />
    );
  }

  function renderLine(line: string, lineIndex: number) {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    blankPattern.lastIndex = 0;
    while ((match = blankPattern.exec(line)) !== null) {
      const questionId = validQuestionIds[nextBlankIndex];
      parts.push(line.slice(lastIndex, match.index));

      if (questionId) {
        parts.push(renderInput(questionId));
        nextBlankIndex += 1;
      } else {
        parts.push(match[0]);
      }

      lastIndex = match.index + match[0].length;
    }

    parts.push(line.slice(lastIndex));

    const questionNumber = line.trim().match(/^(\d{1,2})\s+/)?.[1];
    const questionId = questionNumber ? questionIdFor(module, questionNumber) : "";
    const labels =
      questionId && validQuestionIds.includes(questionId)
        ? getChoiceLabels(lines, lineIndex)
        : [];

    return (
      <div className={lineClassName(line)} key={`line:${lineIndex}`}>
        <span>{parts}</span>
        {labels.length > 0 ? (
          <div className={styles.choiceGroup} id={questionId}>
            {labels.map((label) => (
              <label className={styles.choiceOption} key={`${questionId}:${label}`}>
                <input
                  checked={answers[questionId] === label}
                  disabled={isReviewMode}
                  name={questionId}
                  type="radio"
                  value={label}
                  onChange={() => {
                    onFocusQuestion(questionId);
                    onAnswer(questionId, label);
                  }}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return <section className={styles.sheet}>{lines.map(renderLine)}</section>;
}
