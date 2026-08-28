import { convertRawScoreToBand } from "./bandConversion";
import type {
  AnswerKeyEntry,
  ObjectiveModule,
  ObjectiveResult,
  ObjectiveResultItem,
  Question,
} from "./examTypes";

export function normalizeObjectiveAnswer(answer: string): string {
  return answer.trim().replace(/\s+/g, " ").toLowerCase();
}

export function gradeObjectiveModule(params: {
  module: ObjectiveModule;
  questions: Question[];
  answerKey: AnswerKeyEntry[];
  answers: Record<string, string>;
}): ObjectiveResult {
  const keyByQuestionId = new Map(
    params.answerKey.map((entry) => [entry.questionId, entry]),
  );

  const items = params.questions.map((question) => {
    const key = keyByQuestionId.get(question.id);
    const rawAnswer = params.answers[question.id] ?? "";
    const normalizedUserAnswer = normalizeObjectiveAnswer(rawAnswer);
    const isUnanswered = normalizedUserAnswer.length === 0;
    const accepted = key?.acceptedAnswers.map(normalizeObjectiveAnswer) ?? [];
    const isCorrect =
      !isUnanswered && accepted.includes(normalizedUserAnswer);
    const status: ObjectiveResultItem["status"] = isUnanswered
      ? "unanswered"
      : isCorrect
        ? "correct"
        : "incorrect";

    return {
      questionId: question.id,
      number: question.number,
      userAnswer: rawAnswer,
      correctAnswer: key?.displayAnswer ?? "",
      isCorrect,
      status,
    };
  });

  const correctCount = items.filter((item) => item.isCorrect).length;

  return {
    module: params.module,
    correctCount,
    totalQuestions: params.questions.length,
    bandScore: convertRawScoreToBand(params.module, correctCount),
    items,
  };
}
