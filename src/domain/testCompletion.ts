import type { ExamModule, ExamSession, MockTest } from "./examTypes";

export const examModules: ExamModule[] = ["reading", "listening", "writing"];

export function isSubmittedSession(session: ExamSession | undefined): boolean {
  return (
    session?.status === "SUBMITTED" ||
    session?.status === "TIME_EXPIRED" ||
    session?.status === "REVIEW"
  );
}

export function getAvailableModules(test: MockTest): ExamModule[] {
  return examModules.filter((module) => test.materials[module].available);
}

export function isTestComplete(
  test: MockTest,
  sessions: Record<string, ExamSession>,
): boolean {
  const availableModules = getAvailableModules(test);

  return (
    availableModules.length > 0 &&
    availableModules.every((module) =>
      isSubmittedSession(sessions[`${test.metadata.id}:${module}`]),
    )
  );
}
