import { gradeObjectiveModule } from "../domain/grading";
import { countWords } from "../domain/wordCount";
import type {
  ExamModule,
  ExamSession,
  MockTest,
  ObjectiveModule,
} from "../domain/examTypes";

export function getModuleDuration(test: MockTest, module: ExamModule): number {
  if (module === "reading") {
    return test.reading.durationSeconds;
  }

  if (module === "listening") {
    return test.listening.durationSeconds;
  }

  return test.writing.durationSeconds;
}

export function submitExam(
  test: MockTest,
  session: ExamSession,
  status: "SUBMITTED" | "TIME_EXPIRED" = "SUBMITTED",
): ExamSession {
  const submittedAt = Date.now();

  if (session.module === "reading" || session.module === "listening") {
    const objectiveModule = session.module as ObjectiveModule;
    const moduleData =
      objectiveModule === "reading" ? test.reading : test.listening;

    return {
      ...session,
      status,
      submittedAt,
      objectiveResult: gradeObjectiveModule({
        module: objectiveModule,
        questions: moduleData.questions,
        answerKey: moduleData.answerKey,
        answers: session.answers,
      }),
    };
  }

  return {
    ...session,
    status,
    submittedAt,
    writingResult: {
      task1WordCount: countWords(session.writing.task1),
      task2WordCount: countWords(session.writing.task2),
      submittedAt,
    },
  };
}
