import { create } from "zustand";
import { createInitialSession } from "../domain/sessionFactory";
import type {
  AnswerValue,
  ExamModule,
  ExamFontSize,
  ExamSession,
  MockTest,
  TextHighlight,
  TextNote,
} from "../domain/examTypes";
import { normalizeHighlights, rangesOverlap } from "../domain/highlights";
import { getModuleDuration, submitExam } from "../services/examService";
import { sessionRepository } from "../services/sessionRepository";

interface ExamStoreState {
  sessions: Record<string, ExamSession>;
  restoreSession: (testId: string, module: ExamModule) => ExamSession;
  startModule: (test: MockTest, module: ExamModule) => ExamSession;
  resetModule: (testId: string, module: ExamModule) => ExamSession;
  setAnswer: (
    testId: string,
    module: ExamModule,
    questionId: string,
    value: AnswerValue,
  ) => void;
  setCurrentQuestion: (
    testId: string,
    module: ExamModule,
    questionId: string,
  ) => void;
  toggleFlag: (testId: string, module: ExamModule, questionId: string) => void;
  addReadingHighlight: (
    testId: string,
    highlight: Omit<TextHighlight, "id">,
  ) => void;
  removeReadingHighlight: (testId: string, highlightId: string) => void;
  removeReadingHighlightsInRange: (
    testId: string,
    range: Omit<TextHighlight, "id">,
  ) => void;
  addReadingNote: (
    testId: string,
    note: Omit<TextNote, "id">,
  ) => void;
  updateReadingNote: (testId: string, noteId: string, text: string) => void;
  removeReadingNote: (testId: string, noteId: string) => void;
  removeReadingNotesInRange: (
    testId: string,
    range: Omit<TextHighlight, "id">,
  ) => void;
  clearReadingMarks: (testId: string) => void;
  setFontSize: (testId: string, module: ExamModule, fontSize: ExamFontSize) => void;
  markListeningPlaybackStarted: (testId: string, partId: string) => void;
  markListeningPlaybackCompleted: (testId: string, partId: string) => void;
  setWriting: (
    testId: string,
    module: "writing",
    taskId: "task1" | "task2",
    value: string,
  ) => void;
  submitModule: (
    test: MockTest,
    module: ExamModule,
    status?: "SUBMITTED" | "TIME_EXPIRED",
  ) => ExamSession;
  enterReview: (testId: string, module: ExamModule) => void;
}

function sessionKey(testId: string, module: ExamModule): string {
  return `${testId}:${module}`;
}

function persist(session: ExamSession): ExamSession {
  sessionRepository.saveExamState(session);
  return session;
}

function updateSession(
  state: ExamStoreState,
  testId: string,
  module: ExamModule,
  updater: (session: ExamSession) => ExamSession,
): Partial<ExamStoreState> {
  const key = sessionKey(testId, module);
  const current =
    state.sessions[key] ??
    sessionRepository.restoreExamState(testId, module) ??
    createInitialSession(testId, module);
  const next = persist(updater(current));

  return {
    sessions: {
      ...state.sessions,
      [key]: next,
    },
  };
}

export const useExamStore = create<ExamStoreState>((set, get) => ({
  sessions: {},

  restoreSession(testId, module) {
    const key = sessionKey(testId, module);
    const existing =
      get().sessions[key] ??
      sessionRepository.restoreExamState(testId, module) ??
      createInitialSession(testId, module);

    set((state) => ({
      sessions: {
        ...state.sessions,
        [key]: existing,
      },
    }));

    return existing;
  },

  startModule(test, module) {
    const key = sessionKey(test.metadata.id, module);
    const restored =
      get().sessions[key] ??
      sessionRepository.restoreExamState(test.metadata.id, module);

    if (restored && restored.status !== "NOT_STARTED") {
      return restored;
    }

    const now = Date.now();
    const session = persist({
      ...createInitialSession(test.metadata.id, module),
      status: "IN_PROGRESS",
      startedAt: now,
      expiresAt: now + getModuleDuration(test, module) * 1000,
    });

    set((state) => ({
      sessions: {
        ...state.sessions,
        [key]: session,
      },
    }));

    return session;
  },

  resetModule(testId, module) {
    const key = sessionKey(testId, module);
    sessionRepository.clearExamState(testId, module);
    const session = createInitialSession(testId, module);

    set((state) => ({
      sessions: {
        ...state.sessions,
        [key]: session,
      },
    }));

    return session;
  },

  setAnswer(testId, module, questionId, value) {
    set((state) =>
      updateSession(state, testId, module, (session) => ({
        ...session,
        answers: {
          ...session.answers,
          [questionId]: value,
        },
        currentQuestionId: questionId,
      })),
    );
  },

  setCurrentQuestion(testId, module, questionId) {
    set((state) =>
      updateSession(state, testId, module, (session) => ({
        ...session,
        currentQuestionId: questionId,
      })),
    );
  },

  toggleFlag(testId, module, questionId) {
    set((state) =>
      updateSession(state, testId, module, (session) => {
        const exists = session.flaggedQuestionIds.includes(questionId);
        return {
          ...session,
          flaggedQuestionIds: exists
            ? session.flaggedQuestionIds.filter((id) => id !== questionId)
            : [...session.flaggedQuestionIds, questionId],
        };
      }),
    );
  },

  addReadingHighlight(testId, highlight) {
    set((state) =>
      updateSession(state, testId, "reading", (session) => {
        const startOffset = Math.min(highlight.startOffset, highlight.endOffset);
        const endOffset = Math.max(highlight.startOffset, highlight.endOffset);

        if (startOffset === endOffset) {
          return session;
        }

        return {
          ...session,
          highlights: normalizeHighlights([
            ...session.highlights,
            {
              ...highlight,
              id: `${highlight.passageId}:${highlight.blockId}:${startOffset}:${endOffset}:${Date.now()}`,
              startOffset,
              endOffset,
            },
          ]),
        };
      }),
    );
  },

  removeReadingHighlight(testId, highlightId) {
    set((state) =>
      updateSession(state, testId, "reading", (session) => ({
        ...session,
        highlights: session.highlights.filter(
          (highlight) => highlight.id !== highlightId,
        ),
      })),
    );
  },

  removeReadingHighlightsInRange(testId, range) {
    set((state) =>
      updateSession(state, testId, "reading", (session) => ({
        ...session,
        highlights: session.highlights.filter((highlight) => {
          if (
            highlight.passageId !== range.passageId ||
            highlight.blockId !== range.blockId
          ) {
            return true;
          }

          return !rangesOverlap(highlight, range);
        }),
      })),
    );
  },

  addReadingNote(testId, note) {
    set((state) =>
      updateSession(state, testId, "reading", (session) => {
        const startOffset = Math.min(note.startOffset, note.endOffset);
        const endOffset = Math.max(note.startOffset, note.endOffset);

        if (startOffset === endOffset) {
          return session;
        }

        return {
          ...session,
          notes: [
            ...session.notes,
            {
              ...note,
              id: `${note.passageId}:${note.blockId}:${startOffset}:${endOffset}:note:${Date.now()}`,
              startOffset,
              endOffset,
            },
          ],
        };
      }),
    );
  },

  updateReadingNote(testId, noteId, text) {
    set((state) =>
      updateSession(state, testId, "reading", (session) => ({
        ...session,
        notes: session.notes.map((note) =>
          note.id === noteId ? { ...note, text } : note,
        ),
      })),
    );
  },

  removeReadingNote(testId, noteId) {
    set((state) =>
      updateSession(state, testId, "reading", (session) => ({
        ...session,
        notes: session.notes.filter((note) => note.id !== noteId),
      })),
    );
  },

  removeReadingNotesInRange(testId, range) {
    set((state) =>
      updateSession(state, testId, "reading", (session) => ({
        ...session,
        notes: session.notes.filter((note) => {
          if (note.passageId !== range.passageId || note.blockId !== range.blockId) {
            return true;
          }

          return !rangesOverlap(note, range);
        }),
      })),
    );
  },

  clearReadingMarks(testId) {
    set((state) =>
      updateSession(state, testId, "reading", (session) => ({
        ...session,
        highlights: [],
        notes: [],
      })),
    );
  },

  setFontSize(testId, module, fontSize) {
    set((state) =>
      updateSession(state, testId, module, (session) => ({
        ...session,
        fontSize,
      })),
    );
  },

  markListeningPlaybackStarted(testId, partId) {
    set((state) =>
      updateSession(state, testId, "listening", (session) => {
        if (session.listeningPlayback.completedPartIds.includes(partId)) {
          return session;
        }

        return {
          ...session,
          listeningPlayback: {
            ...session.listeningPlayback,
            started: true,
            startedAt: Date.now(),
            activePartId: partId,
          },
        };
      }),
    );
  },

  markListeningPlaybackCompleted(testId, partId) {
    set((state) =>
      updateSession(state, testId, "listening", (session) => {
        const completedPartIds = session.listeningPlayback.completedPartIds.includes(
          partId,
        )
          ? session.listeningPlayback.completedPartIds
          : [...session.listeningPlayback.completedPartIds, partId];

        return {
          ...session,
          listeningPlayback: {
            ...session.listeningPlayback,
            activePartId: undefined,
            completed: completedPartIds.length >= 4,
            completedPartIds,
          },
        };
      }),
    );
  },

  setWriting(testId, module, taskId, value) {
    set((state) =>
      updateSession(state, testId, module, (session) => ({
        ...session,
        writing: {
          ...session.writing,
          [taskId]: value,
        },
      })),
    );
  },

  submitModule(test, module, status = "SUBMITTED") {
    const key = sessionKey(test.metadata.id, module);
    const current =
      get().sessions[key] ??
      sessionRepository.restoreExamState(test.metadata.id, module) ??
      createInitialSession(test.metadata.id, module);

    if (
      current.status === "SUBMITTED" ||
      current.status === "TIME_EXPIRED" ||
      current.status === "REVIEW"
    ) {
      return current;
    }

    const submitted = persist(submitExam(test, current, status));
    set((state) => ({
      sessions: {
        ...state.sessions,
        [key]: submitted,
      },
    }));

    return submitted;
  },

  enterReview(testId, module) {
    set((state) =>
      updateSession(state, testId, module, (session) => ({
        ...session,
        status: "REVIEW",
      })),
    );
  },
}));
