import type {
  ExamSession,
  MockTest,
  ObjectiveResult,
  ObjectiveResultItem,
} from "./examTypes";
import { countWords } from "./wordCount";

export interface FinalResultModuleSummary {
  module: "reading" | "listening" | "writing";
  status: string;
  objectiveResult?: ObjectiveResult;
  task1WordCount?: number;
  task2WordCount?: number;
}

export interface FinalResultSummary {
  testTitle: string;
  modules: FinalResultModuleSummary[];
  copyText: string;
}

function formatObjectiveResult(label: string, result: ObjectiveResult | undefined): string {
  if (!result) {
    return `${label}\nNo objective result available.`;
  }

  return [
    label,
    `Score: ${result.correctCount} / ${result.totalQuestions}`,
    `Band: ${result.bandScore ?? "N/A"}`,
    "",
    "Question Review:",
    ...result.items.map(formatObjectiveResultItem),
  ].join("\n");
}

function formatObjectiveResultItem(item: ObjectiveResultItem): string {
  const userAnswer = item.userAnswer.trim().length > 0 ? item.userAnswer : "[Unanswered]";
  const correctAnswer =
    item.correctAnswer.trim().length > 0 ? item.correctAnswer : "[No answer key]";

  return `Q${item.number}: User Answer: ${userAnswer} | Correct Answer: ${correctAnswer} | Status: ${item.status}`;
}

export function createFinalResultSummary(
  test: MockTest,
  sessions: Record<string, ExamSession>,
): FinalResultSummary {
  const reading = sessions[`${test.metadata.id}:reading`];
  const listening = sessions[`${test.metadata.id}:listening`];
  const writing = sessions[`${test.metadata.id}:writing`];
  const task1 = writing?.writing.task1 ?? "";
  const task2 = writing?.writing.task2 ?? "";
  const task1WordCount =
    writing?.writingResult?.task1WordCount ?? countWords(task1);
  const task2WordCount =
    writing?.writingResult?.task2WordCount ?? countWords(task2);

  const copyText = [
    test.metadata.title,
    "",
    formatObjectiveResult("Reading", reading?.objectiveResult),
    "",
    formatObjectiveResult("Listening", listening?.objectiveResult),
    "",
    "Writing",
    `Task 1 Word Count: ${task1WordCount}`,
    "Task 1 Response:",
    task1,
    "",
    `Task 2 Word Count: ${task2WordCount}`,
    "Task 2 Response:",
    task2,
  ].join("\n");

  return {
    testTitle: test.metadata.title,
    modules: [
      {
        module: "reading",
        status: reading?.status ?? "NOT_STARTED",
        objectiveResult: reading?.objectiveResult,
      },
      {
        module: "listening",
        status: listening?.status ?? "NOT_STARTED",
        objectiveResult: listening?.objectiveResult,
      },
      {
        module: "writing",
        status: writing?.status ?? "NOT_STARTED",
        task1WordCount,
        task2WordCount,
      },
    ],
    copyText,
  };
}
