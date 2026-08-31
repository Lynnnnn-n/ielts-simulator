import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router";
import { createFinalResultSummary } from "../domain/finalResult";
import {
  examModules,
  getAvailableModules,
  isTestComplete,
} from "../domain/testCompletion";
import { useExamStore } from "../store/examStore";
import { moduleTitle, useMockTest } from "./pageUtils";
import styles from "./FinalResultPage.module.css";

export function FinalResultPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { test, isLoading } = useMockTest(params.testId);
  const restoreSession = useExamStore((state) => state.restoreSession);
  const resetModule = useExamStore((state) => state.resetModule);
  const sessions = useExamStore((state) => state.sessions);
  const [hasRestoredSessions, setHasRestoredSessions] = useState(false);

  useEffect(() => {
    if (params.testId) {
      examModules.forEach((module) => restoreSession(params.testId ?? "", module));
      setHasRestoredSessions(true);
    }
  }, [params.testId, restoreSession]);

  if (isLoading) {
    return <main className={styles.page}>Loading final result...</main>;
  }

  if (!test || !params.testId) {
    return <Navigate to="/" replace />;
  }

  if (!hasRestoredSessions) {
    return <main className={styles.page}>Restoring final result...</main>;
  }

  if (!isTestComplete(test, sessions)) {
    return <Navigate to="/" replace />;
  }

  const summary = createFinalResultSummary(test, sessions);

  function handleResetTest() {
    if (!test) {
      return;
    }

    const shouldReset = window.confirm(
      "Reset this completed mock test and clear all saved answers?",
    );

    if (!shouldReset) {
      return;
    }

    getAvailableModules(test).forEach((module) =>
      resetModule(test.metadata.id, module),
    );
    navigate("/");
  }

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <h1>{summary.testTitle} Final Result</h1>
        <div className={styles.summaryGrid}>
          {summary.modules.map((item) => (
            <section className={styles.summaryCard} key={item.module}>
              <h2>{moduleTitle(item.module)}</h2>
              <p>{item.status}</p>
              {item.objectiveResult ? (
                <>
                  <div className={styles.score}>
                    {item.objectiveResult.correctCount} /{" "}
                    {item.objectiveResult.totalQuestions}
                  </div>
                  <p>Band {item.objectiveResult.bandScore ?? "N/A"}</p>
                </>
              ) : null}
              {item.module === "writing" ? (
                <p>
                  Task 1: {item.task1WordCount} words
                  <br />
                  Task 2: {item.task2WordCount} words
                </p>
              ) : null}
            </section>
          ))}
        </div>
        <div className={styles.copyBlock}>
          <label htmlFor="final-result-copy">Copy-ready result</label>
          <textarea id="final-result-copy" readOnly value={summary.copyText} />
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => void navigator.clipboard.writeText(summary.copyText)}
          >
            Copy full result
          </button>
          <Link to={`/test/${test.metadata.id}/reading/review?from=final`}>
            Review Reading
          </Link>
          <Link to={`/test/${test.metadata.id}/listening/review?from=final`}>
            Review Listening
          </Link>
          <Link to={`/test/${test.metadata.id}/writing/review?from=final`}>
            Review Writing
          </Link>
          <button type="button" onClick={handleResetTest}>
            Reset test
          </button>
          <Link to="/">Back to tests</Link>
        </div>
      </section>
    </main>
  );
}
