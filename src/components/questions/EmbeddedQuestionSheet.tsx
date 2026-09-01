import type { ReactNode } from "react";
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

interface QuestionItem {
  questionId: string;
  number: number;
  introLines: string[];
  bodyLines: string[];
  sharedChoices: ChoiceOption[];
  showSharedChoices: boolean;
}

interface ChoiceOption {
  label: string;
  text: string;
}

const blankPattern = /(?:\. ?){4,}|_{4,}|…+/g;
const optionStartPattern = /^([A-Ha-h])(?:[.)])?(?:\s+(.+))?$/;
const sectionHeadingPattern =
  /^(?:SECTION \d|READING PASSAGE \d|Questions? \d|Test \d|Part \d)/i;

function getQuestionNumber(questionId: string): number {
  return Number(questionId.replace(/\D/g, ""));
}

function getLineQuestionNumber(line: string) {
  const trimmed = line.trim();
  const directMatch = trimmed.match(/^(\d{1,2})(?:\s+|$)/);
  if (directMatch) {
    return Number(directMatch[1]);
  }

  const blankMatch = trimmed.match(/\b(\d{1,2})\s*(?:\. ?){4,}/);
  if (blankMatch) {
    return Number(blankMatch[1]);
  }

  const namedMatch = trimmed.match(/^Question\s+(\d{1,2})\b/i);
  return namedMatch ? Number(namedMatch[1]) : null;
}

function isQuestionStart(line: string, expectedNumber: number) {
  return getLineQuestionNumber(line) === expectedNumber;
}

function normalizeLines(text: string) {
  return text
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line.trim().length > 0);
}

function startsFor(lines: string[], numbers: number[]) {
  return numbers.map((number) => ({
    number,
    index: lines.findIndex((line) => isQuestionStart(line, number)),
  }));
}

function lastHeadingBefore(lines: string[], startIndex: number, previousEnd: number) {
  for (let index = startIndex - 1; index >= previousEnd; index -= 1) {
    if (sectionHeadingPattern.test(lines[index].trim())) {
      return index;
    }
  }

  return startIndex;
}

function buildQuestionItems(text: string, questionIds: string[], questions: Question[]) {
  const lines = normalizeLines(text);
  const validQuestionIds = questionIds.filter((questionId) =>
    questions.some((question) => question.id === questionId),
  );
  const numbers = validQuestionIds.map(getQuestionNumber);
  const locatedStarts = startsFor(lines, numbers);
  const foundStarts = locatedStarts.filter((start) => start.index >= 0);

  if (foundStarts.length === 0) {
    return {
      introLines: lines,
      items: validQuestionIds.map<QuestionItem>((questionId) => ({
        questionId,
        number: getQuestionNumber(questionId),
        introLines: [],
        bodyLines: [],
        sharedChoices: [],
        showSharedChoices: false,
      })),
    };
  }

  let previousEnd = 0;
  let activeSharedChoices: ChoiceOption[] = [];
  const items = validQuestionIds.map<QuestionItem>((questionId, questionIndex) => {
    const number = getQuestionNumber(questionId);
    const ownStart = locatedStarts[questionIndex]?.index ?? -1;
    const nextStart = locatedStarts
      .slice(questionIndex + 1)
      .find((start) => start.index > ownStart)?.index;

    if (ownStart < 0) {
      return {
        questionId,
        number,
        introLines: [],
        bodyLines: [],
        sharedChoices: activeSharedChoices,
        showSharedChoices: false,
      };
    }

    const introStart = lastHeadingBefore(lines, ownStart, previousEnd);
    const introLines = introStart < ownStart ? lines.slice(introStart, ownStart) : [];
    const bodyEnd = nextStart ?? lines.length;
    const bodyLines = lines.slice(ownStart, bodyEnd);
    const introChoices = optionChoices(introLines);
    const beginsNewQuestionGroup = introLines.some((line) =>
      /^Questions?\s+\d/i.test(line.trim()),
    );
    const showSharedChoices = introChoices.length >= 2;

    if (showSharedChoices) {
      activeSharedChoices = introChoices;
    } else if (beginsNewQuestionGroup) {
      activeSharedChoices = [];
    }

    previousEnd = bodyEnd;

    return {
      questionId,
      number,
      introLines,
      bodyLines,
      sharedChoices: activeSharedChoices,
      showSharedChoices,
    };
  });

  return {
    introLines: lines.slice(0, foundStarts[0].index),
    items,
  };
}

function hasBlank(lines: string[]) {
  return lines.some((line) => {
    blankPattern.lastIndex = 0;
    return blankPattern.test(line);
  });
}

function optionChoices(lines: string[]): ChoiceOption[] {
  const choices: ChoiceOption[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    const match = line.match(optionStartPattern);

    if (!match) {
      continue;
    }

    let text = match[2]?.trim() ?? "";
    const nextLine = lines[index + 1]?.trim() ?? "";

    if (
      !text &&
      nextLine &&
      !optionStartPattern.test(nextLine) &&
      !sectionHeadingPattern.test(nextLine) &&
      getLineQuestionNumber(nextLine) === null
    ) {
      text = nextLine;
      index += 1;
    }

    if (text) {
      choices.push({
        label: match[1].toUpperCase(),
        text,
      });
    }
  }

  return choices;
}

function withoutOptionLines(lines: string[]) {
  const filteredLines: string[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    const match = line.match(optionStartPattern);

    if (!match) {
      filteredLines.push(lines[index]);
      continue;
    }

    const hasInlineText = Boolean(match[2]?.trim());
    const nextLine = lines[index + 1]?.trim() ?? "";
    const usesNextLineAsText =
      !hasInlineText &&
      nextLine &&
      !optionStartPattern.test(nextLine) &&
      !sectionHeadingPattern.test(nextLine) &&
      getLineQuestionNumber(nextLine) === null;

    if (usesNextLineAsText) {
      index += 1;
    }
  }

  return filteredLines;
}

function renderLineWithoutBlanks(line: string) {
  blankPattern.lastIndex = 0;
  return line.replace(blankPattern, "").replace(/\s{2,}/g, " ").trim();
}

function renderLineWithInput(
  line: string,
  questionId: string,
  renderInput: () => ReactNode,
) {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let hasRenderedInput = false;
  let match: RegExpExecArray | null;

  blankPattern.lastIndex = 0;
  while ((match = blankPattern.exec(line)) !== null) {
    parts.push(line.slice(lastIndex, match.index));

    if (!hasRenderedInput) {
      parts.push(renderInput());
      hasRenderedInput = true;
    } else {
      parts.push(match[0]);
    }

    lastIndex = match.index + match[0].length;
  }

  parts.push(line.slice(lastIndex));

  return parts.map((part, index) => (
    <span key={`${questionId}:part:${index}`}>{part}</span>
  ));
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
  const { introLines, items } = buildQuestionItems(text, questionIds, questions);

  function renderInput(questionId: string, number: number, compact = false) {
    return (
      <input
        aria-label={`Question ${number}`}
        className={`${styles.answerInput} ${compact ? styles.compactInput : ""}`}
        readOnly={isReviewMode}
        spellCheck={false}
        type="text"
        value={answers[questionId] ?? ""}
        onChange={(event) => onAnswer(questionId, event.target.value)}
        onFocus={() => onFocusQuestion(questionId)}
      />
    );
  }

  function renderQuestion(item: QuestionItem) {
    const choices = optionChoices(item.bodyLines);
    const bodyHasBlank = hasBlank(item.bodyLines);
    const usesSharedChoices = item.sharedChoices.length >= 2 && bodyHasBlank;
    const shouldShowChoices = choices.length >= 2 && !bodyHasBlank;
    const shouldShowFallbackInput =
      !usesSharedChoices && !shouldShowChoices && !bodyHasBlank;
    const visibleIntroLines = item.showSharedChoices
      ? withoutOptionLines(item.introLines)
      : item.introLines;
    const visibleBodyLines = shouldShowChoices
      ? withoutOptionLines(item.bodyLines)
      : item.bodyLines;

    return (
      <article className={styles.questionCard} id={item.questionId} key={item.questionId}>
        <div className={styles.questionHeader}>
          <span className={styles.numberBadge}>{item.number}</span>
          <span>{module === "listening" ? "Listening" : "Reading"}</span>
        </div>
        {visibleIntroLines.length > 0 ? (
          <div className={styles.introBlock}>
            {visibleIntroLines.map((line, index) => (
              <p className={styles.introLine} key={`${item.questionId}:intro:${index}`}>
                {line}
              </p>
            ))}
          </div>
        ) : null}
        {item.showSharedChoices ? (
          <div className={styles.optionBank}>
            {item.sharedChoices.map((choice) => (
              <p className={styles.optionBankLine} key={`${item.questionId}:bank:${choice.label}`}>
                <span className={styles.choiceLabel}>{choice.label}</span>
                <span>{choice.text}</span>
              </p>
            ))}
          </div>
        ) : null}
        <div className={styles.bodyBlock}>
          {item.bodyLines.length > 0 ? (
            visibleBodyLines.map((line, index) => {
              return (
                <p
                  className={
                    sectionHeadingPattern.test(line.trim())
                      ? styles.sectionLine
                      : styles.promptLine
                  }
                  key={`${item.questionId}:line:${index}`}
                >
                  {usesSharedChoices
                    ? renderLineWithoutBlanks(line)
                    : renderLineWithInput(line, item.questionId, () =>
                        renderInput(item.questionId, item.number, true),
                      )}
                </p>
              );
            })
          ) : (
            <p className={styles.promptLine}>Question {item.number}</p>
          )}
          {shouldShowFallbackInput ? (
            <div className={styles.fallbackAnswer}>
              {renderInput(item.questionId, item.number)}
            </div>
          ) : null}
          {shouldShowChoices ? (
            <div className={styles.fullChoiceGroup}>
              {choices.map((choice) => (
                <label
                  className={styles.choiceOption}
                  key={`${item.questionId}:option:${choice.label}`}
                >
                  <input
                    checked={answers[item.questionId] === choice.label}
                    disabled={isReviewMode}
                    name={item.questionId}
                    type="radio"
                    value={choice.label}
                    onChange={() => {
                      onFocusQuestion(item.questionId);
                      onAnswer(item.questionId, choice.label);
                    }}
                  />
                  <span className={styles.choiceLabel}>{choice.label}</span>
                  <span>{choice.text}</span>
                </label>
              ))}
            </div>
          ) : null}
          {usesSharedChoices ? (
            <div className={styles.letterChoiceGroup}>
              {item.sharedChoices.map((choice) => (
                <label
                  className={styles.letterChoice}
                  key={`${item.questionId}:letter:${choice.label}`}
                  title={choice.text}
                >
                  <input
                    checked={answers[item.questionId] === choice.label}
                    disabled={isReviewMode}
                    name={item.questionId}
                    type="radio"
                    value={choice.label}
                    onChange={() => {
                      onFocusQuestion(item.questionId);
                      onAnswer(item.questionId, choice.label);
                    }}
                  />
                  <span>{choice.label}</span>
                </label>
              ))}
            </div>
          ) : null}
        </div>
      </article>
    );
  }

  return (
    <section className={styles.sheet}>
      {introLines.length > 0 ? (
        <div className={styles.sheetIntro}>
          {introLines.map((line, index) => (
            <p className={styles.introLine} key={`intro:${index}`}>
              {line}
            </p>
          ))}
        </div>
      ) : null}
      <div className={styles.questionList}>{items.map(renderQuestion)}</div>
    </section>
  );
}
