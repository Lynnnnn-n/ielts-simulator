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

interface ManualTablePlan {
  start: number;
  end: number;
  title: string;
  headers: string[];
  rows: string[][];
}

const blankPattern = /(?:\. ?){4,}|_{4,}|…+/g;
const blankCapturePattern = /((?:\. ?){4,}|_{4,}|…+)/;
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
  "mock-test-01:listening": [
    { start: 21, end: 22, style: "choice-list", options: abc },
    { start: 23, end: 27, style: "option-bank", options: ag },
    {
      start: 28,
      end: 30,
      style: "option-bank",
      options: [
        option("A", "uncooperative landlord"),
        option("B", "environment"),
        option("C", "space"),
        option("D", "noisy neighbours"),
        option("E", "near city"),
        option("F", "work location"),
        option("G", "transport"),
        option("H", "rent"),
      ],
    },
  ],
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
    { start: 39, end: 40, style: "option-bank", options: ag },
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

const manualTablePlans: Record<string, ManualTablePlan[]> = {
  "mock-test-01:listening": [
    {
      start: 5,
      end: 10,
      title: "WEEKEND TRIPS",
      headers: ["Place", "Date", "Number of seats", "Optional extra"],
      rows: [
        ["St Ives", "{5}", "16", "Hepworth Museum"],
        ["London", "16th February", "45", "{6}"],
        ["{7}", "3rd March", "18", "S.S. Great Britain"],
        ["Salisbury", "18th March", "50", "Stonehenge"],
        ["Bath", "23rd March", "16", "{8}"],
        ["For further information", "Read the {9}", "or see Social Assistant", "Jane {10}"],
      ],
    },
  ],
  "mock-test-02:listening": [
    {
      start: 6,
      end: 8,
      title: "Tourist attractions",
      headers: ["Category", "Attractions"],
      rows: [
        ["Open all day", "{6} and Gardens"],
        ["NOT open on Mondays", "{7} and Castle"],
        ["Free entry", "{8} and Markets"],
      ],
    },
    {
      start: 27,
      end: 30,
      title: "AUTHOR DETAILS",
      headers: ["Author", "Title", "Publisher", "Year of publication"],
      rows: [
        ["{27}", "'Sample Surveys in Social Science Research'", "", ""],
        ["Bell", "{28}", "{29}", ""],
        ["Wilson", "'Interviews That Work'", "Oxford University Press", "{30}"],
      ],
    },
  ],
  "mock-test-03:listening": [
    {
      start: 1,
      end: 4,
      title: "Accommodation Request Form",
      headers: ["Field", "Details"],
      rows: [
        ["Name", "Sara Lim"],
        ["Age", "23"],
        ["Length of time in Australia", "{1}"],
        ["Present address", "Flat 1, 539, {2} Road, Canterbury 2036"],
        ["Present course", "{3} English"],
        ["Accommodation required from", "{4}, 7th September"],
      ],
    },
    {
      start: 15,
      end: 20,
      title: "Festival performances",
      headers: ["", "Where", "Type of performance", "Highlights", "Type of audience"],
      rows: [
        ["Circus Romano", "", "Clowns and acrobats", "Music and {15}", "{16}"],
        ["Circus Electrica", "{17}", "Dancers and magicians", "Aerial displays", "{18}"],
        ["Mekong Water Puppets", "{19}", "Puppets", "Seeing the puppeteers at the end", "{20}"],
      ],
    },
    {
      start: 33,
      end: 37,
      title: "CHOICE OF SITE",
      headers: ["", "Site One", "Site Two", "Site Three"],
      rows: [
        ["Location", "City centre near Faculty of {33}", "Outskirts near park", "Out of town near the {34}"],
        ["Advantages and/or disadvantages", "Problems with {35} and traffic", "Close to halls of residence, so more {36}", "Access to living quarters. Larger site. {37}"],
      ],
    },
  ],
  "mock-test-04:listening": [
    {
      start: 16,
      end: 20,
      title: "Walking holidays",
      headers: ["Length of holiday", "Cost per person", "Special offers included in price"],
      rows: [
        ["3 days", "$ {16}", "Pick up from the {17}"],
        ["7 days", "$350", "As above plus book of {18} and maps"],
        ["14 days", "$ {19}", "As above plus membership of a {20}"],
      ],
    },
    {
      start: 21,
      end: 26,
      title: "Science experiments",
      headers: ["Experiment number", "Equipment", "Purpose"],
      rows: [
        ["Experiment 1", "{21} and a table", "To show how things move on a cushion of air"],
        ["Experiment 2", "Lots of paperclips", "To show why we need standard {22}"],
        ["Experiment 3", "{23} and a jar of water", "To show how {24} grow"],
        ["Experiment 4", "Cardboard, coloured pens and a {25}", "To teach children about how {26} is made up"],
        ["Experiment 5", "A drill, an old record, a pin/needle, paper, a bolt", "To make a record player in order to learn about recording sound"],
      ],
    },
  ],
  "mock-test-03:reading": [
    {
      start: 5,
      end: 8,
      title: "Organisations",
      headers: ["Country", "Organisations involved", "Type of project", "Support provided"],
      rows: [
        ["{5}", "S.K.I.", "Courier service and {6}", "Provision of training"],
        ["Dominican Republic", "S.K.I.; Y.W.C.A.", "{7}", "Loans, storage facilities, savings plans"],
        ["Zambia", "S.K.I.; The Red Cross; {8}; Y.W.C.A.", "Setting up small businesses", "Business training and access to credit"],
      ],
    },
    {
      start: 32,
      end: 36,
      title: "METHODS OF OBTAINING LINGUISTIC DATA",
      headers: ["Method", "Advantages", "Disadvantages"],
      rows: [
        ["{32} as informant", "Convenient method of enquiry", "Not objective enough"],
        ["Non-linguist as informant", "Necessary with {33} and child speech", "The number of factors to be considered"],
        ["Recording an informant", "Allows linguists' claims to be checked", "{34} of sound"],
        ["Videoing an informant", "Allows speakers' {35} to be observed", "{36} might miss certain things"],
      ],
    },
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

function getManualTablePlan(testId: string, module: ExamModule, number: number) {
  return manualTablePlans[`${testId}:${module}`]?.find(
    (plan) => number >= plan.start && number <= plan.end,
  );
}

function optionsAreOnlyLabels(options: ChoiceOption[]) {
  return options.every((choice) => choice.text === choice.label);
}

function dedupeChoices(options: ChoiceOption[]) {
  const seen = new Set<string>();

  return options.filter((choice) => {
    if (seen.has(choice.label)) {
      return false;
    }

    seen.add(choice.label);
    return true;
  });
}

function choicesMatchingPlan(options: ChoiceOption[], plan?: ManualChoicePlan) {
  if (!plan) {
    return options;
  }

  const allowedLabels = new Set(plan.options.map((choice) => choice.label));
  return options.filter((choice) => allowedLabels.has(choice.label));
}

function getLineQuestionNumber(line: string) {
  const trimmed = line.trim();
  const groupedHeadingMatch = trimmed.match(
    /^Questions?\s+(\d{1,2})(?:\s*(?:-|to|and)\s*(\d{1,2}))?/i,
  );
  if (groupedHeadingMatch) {
    return Number(groupedHeadingMatch[1]);
  }

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

function hasDirectQuestionNumber(line: string, expectedNumber: number) {
  const trimmed = line.trim();
  const escapedNumber = String(expectedNumber);

  return (
    new RegExp(`^${escapedNumber}(?:\\s+|$)`).test(trimmed) ||
    new RegExp(`\\b${escapedNumber}\\s*(?:\\. ?){4,}`).test(trimmed) ||
    new RegExp(`^Question\\s+${escapedNumber}\\b`, "i").test(trimmed)
  );
}

function getGroupedQuestionRange(line: string) {
  const groupedHeadingMatch = line.trim().match(
    /^Questions?\s+(\d{1,2})(?:\s*(?:-|to|and)\s*(\d{1,2}))?/i,
  );

  if (!groupedHeadingMatch) {
    return null;
  }

  return {
    start: Number(groupedHeadingMatch[1]),
    end: Number(groupedHeadingMatch[2] ?? groupedHeadingMatch[1]),
  };
}

function isGroupedQuestionStart(line: string, expectedNumber: number) {
  const range = getGroupedQuestionRange(line);

  if (range) {
    const { start, end } = range;
    return expectedNumber >= start && expectedNumber <= end;
  }

  return false;
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
    index: (() => {
      const directIndex = lines.findIndex((line) =>
        hasDirectQuestionNumber(line, number),
      );

      if (directIndex >= 0) {
        return directIndex;
      }

      return lines.findIndex((line) => isGroupedQuestionStart(line, number));
    })(),
  }));
}

function nextLaterGroupedHeadingIndex(lines: string[], startIndex: number, number: number) {
  return lines.findIndex((line, index) => {
    if (index <= startIndex) {
      return false;
    }

    const range = getGroupedQuestionRange(line);
    return Boolean(range && range.start > number);
  });
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
    const laterHeadingIndex = nextLaterGroupedHeadingIndex(lines, ownStart, number);
    const bodyEndCandidates = [nextStart, laterHeadingIndex]
      .filter((index): index is number => typeof index === "number" && index >= 0)
      .filter((index) => index > ownStart);
    const bodyEnd =
      bodyEndCandidates.length > 0 ? Math.min(...bodyEndCandidates) : lines.length;
    const bodyLines = lines.slice(ownStart, bodyEnd);
    const beginsNewQuestionGroup = introLines.some((line) =>
      /^Questions?\s+\d/i.test(line.trim()),
    );
    const showSharedChoices = false;

    if (beginsNewQuestionGroup) {
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

  const firstStartIndex = foundStarts[0].index;
  const topIntroEnd = lastHeadingBefore(lines, firstStartIndex, 0);

  return {
    introLines: lines.slice(0, topIntroEnd),
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
  questionNumber: number,
  renderInput: () => ReactNode,
) {
  const parts: ReactNode[] = [];
  const numberedBlankPattern = new RegExp(
    `\\b(${questionNumber}\\s*)${blankCapturePattern.source}`,
  );
  const numberedBlankMatch = line.match(numberedBlankPattern);

  if (numberedBlankMatch?.index !== undefined) {
    const inputIndex = numberedBlankMatch.index + numberedBlankMatch[1].length;
    const blankLength = numberedBlankMatch[2].length;

    return [
      <span key={`${questionId}:before`}>{line.slice(0, inputIndex)}</span>,
      <span key={`${questionId}:input`}>{renderInput()}</span>,
      <span key={`${questionId}:after`}>
        {line.slice(inputIndex + blankLength)}
      </span>,
    ];
  }

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

  function questionIdForNumber(number: number) {
    return `${module === "listening" ? "lq" : "rq"}${number}`;
  }

  function renderCellContent(cell: string) {
    const parts: ReactNode[] = [];
    const placeholderPattern = /\{(\d{1,2})\}/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = placeholderPattern.exec(cell)) !== null) {
      const number = Number(match[1]);
      const questionId = questionIdForNumber(number);

      parts.push(cell.slice(lastIndex, match.index));
      parts.push(
        <span className={styles.inlineAnchor} id={questionId} key={`${questionId}:anchor`}>
          {renderInput(questionId, number, true)}
        </span>,
      );
      lastIndex = match.index + match[0].length;
    }

    parts.push(cell.slice(lastIndex));

    return parts.map((part, index) => (
      <span key={`cell-part:${index}`}>{part}</span>
    ));
  }

  function renderTable(plan: ManualTablePlan) {
    return (
      <div className={styles.tableWrap}>
        <h3 className={styles.tableTitle}>{plan.title}</h3>
        <table className={styles.completionTable}>
          <thead>
            <tr>
              {plan.headers.map((header) => (
                <th key={header || "blank"}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {plan.rows.map((row, rowIndex) => (
              <tr key={`${plan.title}:row:${rowIndex}`}>
                {row.map((cell, cellIndex) => (
                  <td key={`${plan.title}:cell:${rowIndex}:${cellIndex}`}>
                    {renderCellContent(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function renderQuestion(item: QuestionItem) {
    const manualPlan = getManualChoicePlan(testId, module, item.number);
    const tablePlan = getManualTablePlan(testId, module, item.number);
    if (tablePlan && item.number !== tablePlan.start) {
      return null;
    }

    const extractedBodyChoices = choicesMatchingPlan(
      optionChoices(item.bodyLines),
      manualPlan,
    );
    const extractedChoices = dedupeChoices(extractedBodyChoices);
    const manualChoices = manualPlan?.options ?? [];
    const choices =
      manualPlan && optionsAreOnlyLabels(manualChoices) && extractedChoices.length >= 2
        ? extractedChoices
        : manualPlan?.options ?? extractedBodyChoices;
    const bodyHasBlank = hasBlank(item.bodyLines);
    const usesSharedChoices = manualPlan?.style === "option-bank";
    const usesLetterRow = manualPlan?.style === "letter-row";
    const shouldShowChoices =
      manualPlan?.style === "choice-list" ||
      (module !== "listening" && choices.length >= 2 && !bodyHasBlank);
    const shouldShowFallbackInput =
      !usesSharedChoices && !usesLetterRow && !shouldShowChoices && !bodyHasBlank;
    const visibleIntroLines = item.showSharedChoices
      ? withoutOptionLines(item.introLines)
      : item.introLines;
    const visibleBodyLines = shouldShowChoices || usesSharedChoices
      ? withoutOptionLines(item.bodyLines)
      : item.bodyLines;
    const bankChoices =
      manualPlan && optionsAreOnlyLabels(manualChoices) && extractedChoices.length >= 2
        ? extractedChoices
        : manualPlan?.options ?? item.sharedChoices;
    const showOptionBank =
      manualPlan?.style === "option-bank" ? item.number === manualPlan.start : false;
    const isTableGroup = Boolean(tablePlan);

    return (
      <article
        className={styles.questionCard}
        id={isTableGroup ? `${item.questionId}-group` : item.questionId}
        key={item.questionId}
      >
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
          {tablePlan ? renderTable(tablePlan) : null}
          {!isTableGroup && item.bodyLines.length > 0 ? (
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
                    : renderLineWithInput(line, item.questionId, item.number, () =>
                        renderInput(item.questionId, item.number, true),
                      )}
                </p>
              );
            })
          ) : !isTableGroup ? (
            <p className={styles.promptLine}>Question {item.number}</p>
          ) : null}
          {!isTableGroup && shouldShowFallbackInput ? (
            <div className={styles.fallbackAnswer}>
              {renderInput(item.questionId, item.number)}
            </div>
          ) : null}
          {!isTableGroup && shouldShowChoices ? (
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
          {!isTableGroup && (usesSharedChoices || usesLetterRow) ? (
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
