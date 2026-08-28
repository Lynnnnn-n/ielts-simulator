import type { ExamModule, ExamSession } from "../domain/examTypes";

export interface ExamSessionRepository {
  restoreExamState(testId: string, module: ExamModule): ExamSession | null;
  saveExamState(session: ExamSession): void;
  clearExamState(testId: string, module: ExamModule): void;
}

const storagePrefix = "ielts-simulator:v1:session";
const persistenceVersion = 1;

interface PersistedExamState {
  version: 1;
  session: ExamSession;
}

function getStorageKey(testId: string, module: ExamModule): string {
  return `${storagePrefix}:${testId}:${module}`;
}

function isPersistedExamState(value: unknown): value is PersistedExamState {
  return (
    typeof value === "object" &&
    value !== null &&
    "version" in value &&
    "session" in value
  );
}

function normalizeSession(session: ExamSession): ExamSession {
  return {
    ...session,
    answers: session.answers ?? {},
    flaggedQuestionIds: session.flaggedQuestionIds ?? [],
    highlights: session.highlights ?? [],
    notes: session.notes ?? [],
    fontSize: session.fontSize ?? "standard",
    listeningPlayback: {
      started: session.listeningPlayback?.started ?? false,
      startedAt: session.listeningPlayback?.startedAt,
      completed: session.listeningPlayback?.completed ?? false,
      activePartId: session.listeningPlayback?.activePartId,
      completedPartIds: session.listeningPlayback?.completedPartIds ?? [],
    },
    writing: session.writing ?? {
      task1: "",
      task2: "",
    },
  };
}

export class LocalExamSessionRepository implements ExamSessionRepository {
  restoreExamState(testId: string, module: ExamModule): ExamSession | null {
    const raw = window.localStorage.getItem(getStorageKey(testId, module));
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as unknown;
      const session = isPersistedExamState(parsed)
        ? parsed.session
        : (parsed as ExamSession);

      return normalizeSession(session);
    } catch {
      return null;
    }
  }

  saveExamState(session: ExamSession): void {
    const persisted: PersistedExamState = {
      version: persistenceVersion,
      session: normalizeSession(session),
    };

    window.localStorage.setItem(
      getStorageKey(session.testId, session.module),
      JSON.stringify(persisted),
    );
  }

  clearExamState(testId: string, module: ExamModule): void {
    window.localStorage.removeItem(getStorageKey(testId, module));
  }
}

export const sessionRepository = new LocalExamSessionRepository();
