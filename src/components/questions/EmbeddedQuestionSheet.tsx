import type { ReactNode } from "react";
import type { ExamModule, Question } from "../../domain/examTypes";
import styles from "./EmbeddedQuestionSheet.module.css";

interface EmbeddedQuestionSheetProps {
  text: string;
  testId: string;
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

interface ManualChoicePlan {
  start: number;
  end: number;
  style: "choice-list" | "option-bank" | "letter-row";
  options: ChoiceOption[];
}

const blankPattern = /(?:\. ?){4,}|_{4,}|…+/g;
const optionStartPattern = /^([A-Ha-h])(?:[.)])?(?:\s+(.+))?$/;
const removableOptionLinePattern =
  /^([A-Ha-h]|i|ii|iii|iv|v|vi|vii|viii)(?:[.)])?\s+(.+)$/;
const optionBankHeadingPattern = /^(?:List of|Possible reasons|Problems)$/i;
const sectionHeadingPattern =
  /^(?:SECTION \d|READING PASSAGE \d|Questions? \d|Test \d|Part \d)/i;

function getQuestionNumber(questionId: string): number {
  return Number(questionId.replace(/\D/g, ""));
}

function letters(labels: string[]): ChoiceOption[] {
  return labels.map((label) => ({
    label,
    text: label,
  }));
}

function option(label: string, text: string): ChoiceOption {
  return { label, text };
}

const abc = letters(["A", "B", "C"]);
const abcd = letters(["A", "B", "C", "D"]);
const ae = letters(["A", "B", "C", "D", "E"]);
const af = letters(["A", "B", "C", "D", "E", "F"]);
const ag = letters(["A", "B", "C", "D", "E", "F", "G"]);
const yesNoNotGiven = ["YES", "NO", "NOT GIVEN"].map((label) => option(label, label));
const trueFalseNotGiven = ["TRUE", "FALSE", "NOT GIVEN"].map((label) =>
  option(label, label),
);

const manualChoicePlans: Record<string, ManualChoicePlan[]> = {
  "mock-test-02:listening": [
    { start: 1, end: 5, style: "choice-list", options: abc },
    { start: 11, end: 20, style: "choice-list", options: abc },
    { start: 25, end: 26, style: "option-bank", options: ae },
    { start: 31, end: 32, style: "choice-list", options: abc },
    { start: 39, end: 40, style: "option-bank", options: af },
  ],
  "mock-test-03:listening": [
    { start: 5, end: 7, style: "choice-list", options: abc },
    { start: 11, end: 14, style: "choice-list", options: abc },
    { start: 21, end: 30, style: "choice-list", options: abc },
    { start: 38, end: 38, style: "option-bank", options: ag },
    { start: 39, end: 39, style: "choice-list", options: abc },
    { start: 40, end: 40, style: "option-bank", options: ae },
  ],
  "mock-test-04:listening": [
    { start: 11, end: 15, style: "choice-list", options: abc },
    {
      start: 27,
      end: 30,
      style: "option-bank",
      options: [
        option("A", "too messy"),
        option("B", "too boring"),
        option("C", "too difficult"),
        option("D", "too much equipment"),
        option("E", "too long"),
        option("F", "too easy"),
        option("G", "too noisy"),
        option("H", "too dangerous"),
      ],
    },
    { start: 35, end: 38, style: "choice-list", options: abc },
    { start: 39, end: 40, style: "option-bank", options: ae },
  ],
  "mock-test-02:reading": [
    {
      start: 5,
      end: 9,
      style: "option-bank",
      options: [
        option("A", "Michael Krauss"),
        option("B", "Salikoko Mufwene"),
        option("C", "Nicholas Ostler"),
        option("D", "Mark Pagel"),
        option("E", "Doug Whalen"),
      ],
    },
    { start: 10, end: 13, style: "choice-list", options: yesNoNotGiven },
    { start: 14, end: 15, style: "choice-list", options: abcd },
    { start: 16, end: 23, style: "choice-list", options: yesNoNotGiven },
    { start: 27, end: 32, style: "letter-row", options: letters(["A", "B", "C", "D", "E", "F", "G", "H", "I"]) },
    { start: 33, end: 35, style: "option-bank", options: af },
    {
      start: 36,
      end: 40,
      style: "option-bank",
      options: [
        option("A", "There is a link between a specific substance in the brain and playing."),
        option("B", "Play provides input concerning physical surroundings."),
        option("C", "Varieties of play can be matched to different stages of evolutionary history."),
        option("D", "There is a tendency for mammals with smaller brains to play less."),
        option("E", "Play is not a form of fitness training for the future."),
        option("F", "Some species of larger-brained birds engage in play."),
        option("G", "A wide range of activities are combined during play."),
        option("H", "Play is a method of teaching survival techniques."),
      ],
    },
  ],
  "mock-test-03:reading": [
    { start: 1, end: 4, style: "choice-list", options: abcd },
    { start: 9, end: 12, style: "choice-list", options: yesNoNotGiven },
    { start: 13, end: 13, style: "choice-list", options: abcd },
    {
      start: 14,
      end: 17,
      style: "option-bank",
      options: [
        option("i", "Causes of volcanic eruption"),
        option("ii", "Efforts to predict volcanic eruption"),
        option("iii", "Volcanoes and the features of our planet"),
        option("iv", "Different types of volcanic eruption"),
        option("v", "International relief efforts"),
        option("vi", "The unpredictability of volcanic eruptions"),
      ],
    },
    { start: 27, end: 31, style: "letter-row", options: ag },
  ],
  "mock-test-04:reading": [
    { start: 1, end: 6, style: "choice-list", options: trueFalseNotGiven },
    { start: 11, end: 13, style: "choice-list", options: abcd },
    { start: 14, end: 19, style: "choice-list", options: yesNoNotGiven },
    { start: 20, end: 21, style: "option-bank", options: ae },
    { start: 22, end: 23, style: "option-bank", options: ae },
    {
      start: 28,
      end: 31,
      style: "option-bank",
      options: [
        option("i", "The connection between health-care and other human rights"),
        option("ii", "The development of market-based health systems"),
        option("iii", "The role of the state in health-care"),
        option("iv", "A problem shared by every economically developed country"),
        option("v", "The impact of recent change"),
        option("vi", "The views of the medical establishment"),
        option("vii", "The end of an illusion"),
        option("viii", "Sustainable economic development"),
      ],
    },
    { start: 32, end: 35, style: "choice-list", options: abc },
    { start: 36, end: 40, style: "choice-list", options: yesNoNotGiven },
  ],
};

function getManualChoicePlan(
  testId: string,
  module: ExamModule,
  number: number,
) {
  return manualChoicePlans[`${testId}:${module}`]?.find(
    (plan) => number >= plan.start && number <= plan.end,
  );
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
    const match =
      line.match(optionStartPattern) ?? line.match(removableOptionLinePattern);

    if (optionBankHeadingPattern.test(line)) {
      continue;
    }

    if (!match) {
      filteredLines.push(lines[index]);
      continue;
    }

    const hasInlineText = Boolean(match[2]?.trim());

    while (index + 1 < lines.length) {
      const nextLine = lines[index + 1].trim();
      const nextLineIsContinuation =
        nextLine &&
        !optionStartPattern.test(nextLine) &&
        !removableOptionLinePattern.test(nextLine) &&
        !optionBankHeadingPattern.test(nextLine) &&
        !sectionHeadingPattern.test(nextLine) &&
        getLineQuestionNumber(nextLine) === null;

      if (!nextLineIsContinuation || (!hasInlineText && index + 1 >= lines.length)) {
        break;
      }

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
  testId,
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
    const manualPlan = getManualChoicePlan(testId, module, item.number);
    const choices = manualPlan?.options ?? optionChoices(item.bodyLines);
    const bodyHasBlank = hasBlank(item.bodyLines);
    const usesSharedChoices =
      manualPlan?.style === "option-bank" ||
      (item.sharedChoices.length >= 2 && bodyHasBlank);
    const usesLetterRow = manualPlan?.style === "letter-row";
    const shouldShowChoices =
      manualPlan?.style === "choice-list" || (choices.length >= 2 && !bodyHasBlank);
    const shouldShowFallbackInput =
      !usesSharedChoices && !usesLetterRow && !shouldShowChoices && !bodyHasBlank;
    const visibleIntroLines = item.showSharedChoices
      ? withoutOptionLines(item.introLines)
      : item.introLines;
    const visibleBodyLines = shouldShowChoices || usesSharedChoices
      ? withoutOptionLines(item.bodyLines)
      : item.bodyLines;
    const bankChoices = manualPlan?.options ?? item.sharedChoices;
    const showOptionBank =
      manualPlan?.style === "option-bank"
        ? item.number === manualPlan.start
        : item.showSharedChoices;

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
        {showOptionBank ? (
          <div className={styles.optionBank}>
            {bankChoices.map((choice) => (
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
          {usesSharedChoices || usesLetterRow ? (
            <div className={styles.letterChoiceGroup}>
              {(usesLetterRow ? choices : bankChoices).map((choice) => (
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
