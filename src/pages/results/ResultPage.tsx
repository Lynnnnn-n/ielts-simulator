import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router";
import {
  examModules,
  isSubmittedSession,
  isTestComplete,
} from "../../domain/testCompletion";
import { isExamModule, moduleTitle, useMockTest } from "../pageUtils";
import { useExamStore } from "../../store/examStore";
import styles from "./ResultPage.module.css";

export function ResultPage() {
  const params = useParams();
  const module = isExamModule(params.module) ? params.module : null;
  const { test, isLoading } = useMockTest(params.testId);
  const restoreSession = useExamStore((state) => state.restoreSession);
  const sessions = useExamStore((state) => state.sessions);
  const [hasRestoredSessions, setHasRestoredSessions] = useState(false);
  const session = useExamStore((state) =>
    params.testId && module
      ? state.sessions[`${params.testId}:${module}`]
      : undefined,
  );

  useEffect(() => {
    if (params.testId && module) {
      examModules.forEach((item) => restoreSession(params.testId ?? "", item));
      setHasRestoredSessions(true);
    }
  }, [module, params.testId, restoreSession]);

  if (!module) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return <main className={styles.page}>Loading result...</main>;
  }

  if (!test || !params.testId) {
    return <Navigate to="/" replace />;
  }

  const loadedTest = test;

  if (!hasRestoredSessions || !session) {
    return <main className={styles.page}>Restoring result...</main>;
  }

  const activeSession = session;
  const testComplete = isTestComplete(loadedTest, sessions);

  if (
    !isSubmittedSession(activeSession)
  ) {
    return <Navigate to={`/test/${loadedTest.metadata.id}/${module}`} replace />;
  }

  if (!testComplete) {
    return <Navigate to={`/test/${loadedTest.metadata.id}`} replace />;
  }

  const result = activeSession.objectiveResult;
  const writingResult = activeSession.writingResult;

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <h1>{moduleTitle(module)} Result</h1>
        {result ? (
          <>
            <div className={styles.score}>
              {result.correctCount} / {result.totalQuestions}
            </div>
            <div className={styles.band}>
              Band {result.bandScore === null ? "N/A" : result.bandScore}
            </div>
            <Link to={`/test/${loadedTest.metadata.id}/${module}/review`}>
              Review answers
            </Link>
          </>
        ) : null}
        {module === "writing" && writingResult ? (
          <div className={styles.writingResults}>
            <section>
              <h2>Task 1</h2>
              <p>Word Count: {writingResult.task1WordCount}</p>
              <button
                type="button"
                onClick={() =>
                  void navigator.clipboard.writeText(activeSession.writing.task1)
                }
              >
                Copy Task 1
              </button>
            </section>
            <section>
              <h2>Task 2</h2>
              <p>Word Count: {writingResult.task2WordCount}</p>
              <button
                type="button"
                onClick={() =>
                  void navigator.clipboard.writeText(activeSession.writing.task2)
                }
              >
                Copy Task 2
              </button>
            </section>
            <Link to={`/test/${loadedTest.metadata.id}/writing/review`}>
              Review writing
            </Link>
          </div>
        ) : null}
        <Link className={styles.backLink} to={`/test/${loadedTest.metadata.id}`}>
          Back to test
        </Link>
      </section>
    </main>
  );
}
