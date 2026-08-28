import type { ExamModule, ExamSession } from "./examTypes";

export function createInitialSession(
  testId: string,
  module: ExamModule,
): ExamSession {
  return {
    testId,
    module,
    status: "NOT_STARTED",
    answers: {},
    flaggedQuestionIds: [],
    highlights: [],
    notes: [],
    fontSize: "standard",
    listeningPlayback: {
      started: false,
      completed: false,
      completedPartIds: [],
    },
    writing: {
      task1: "",
      task2: "",
    },
  };
}
