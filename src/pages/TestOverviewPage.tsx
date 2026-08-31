import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router";
import { mockTest01MaterialReport } from "../data/mockTest01";
import type { MockTest } from "../domain/examTypes";
import {
  examModules,
  getAvailableModules,
  isSubmittedSession,
  isTestComplete,
} from "../domain/testCompletion";
import { useExamStore } from "../store/examStore";
import { moduleTitle, useMockTest } from "./pageUtils";
import styles from "./TestOverviewPage.module.css";

function formatTestType(testType: string): string {
  return testType === "academic" || testType === "Academic"
    ? "Academic"
    : "General Training";
}

function getMaterialReport(test: MockTest) {
  if (test.metadata.id === "mock-test-01") {
    return mockTest01MaterialReport;
  }

  return {
    availableAssets: test.assets.map((asset) => asset.description),
    missingAssets: [
      ...test.materials.listening.missing,
      ...test.materials.reading.missing,
      ...test.materials.writing.missing,
    ],
    questionTypes: [
      "Source-page-backed Listening questions",
      "Source-page-backed Academic Reading questions",
      "Source-page-backed Writing prompts",
      "Structured answer keys for Reading and Listening",
    ],
    potentialProblems: test.metadata.sourceNotes,
  };
}

export function TestOverviewPage() {
  const params = useParams();
  const { test, isLoading } = useMockTest(params.testId);
  const restoreSession = useExamStore((state) => state.restoreSession);
  const resetModule = useExamStore((state) => state.resetModule);
  const sessions = useExamStore((state) => state.sessions);

  useEffect(() => {
    if (!params.testId) {
      return;
    }

    examModules.forEach((module) => restoreSession(params.testId ?? "", module));
  }, [params.testId, restoreSession]);

  if (isLoading) {
    return <main className={styles.page}>Loading test...</main>;
  }

  if (!test) {
    return <Navigate to="/" replace />;
  }

  const availableModules = getAvailableModules(test);
  const completedModules = availableModules.filter((module) =>
    isSubmittedSession(sessions[`${test.metadata.id}:${module}`]),
  );
  const testComplete = isTestComplete(test, sessions);
  const materialReport = getMaterialReport(test);

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

    availableModules.forEach((module) => resetModule(test.metadata.id, module));
  }

  return (
    <main className={styles.page}>
      <Link className={styles.backLink} to="/">
        Back to Test Library
      </Link>

      <section className={styles.header}>
        <div>
          <h1>IELTS Computer-Delivered Mock Test Simulator</h1>
          <p>
            {test.metadata.title} uses the imported Cambridge IELTS 4 material.
          </p>
        </div>
        <strong>
          {completedModules.length} / {availableModules.length} available
          modules completed
        </strong>
      </section>

      <section className={styles.moduleGrid}>
        {examModules.map((module) => {
          const session = sessions[`${test.metadata.id}:${module}`];
          const material = test.materials[module];
          const submitted = isSubmittedSession(session);
          const inProgress = session?.status === "IN_PROGRESS";
          const statusText = !material.available
            ? "Missing material"
            : submitted
              ? "Submitted"
              : inProgress
                ? "In progress"
                : "Not started";

          return (
            <section className={styles.moduleCard} key={module}>
              <div>
                <h2>{moduleTitle(module)}</h2>
                <p>{statusText}</p>
              </div>
              <div className={styles.moduleActions}>
                {material.available ? (
                  submitted && !testComplete ? (
                    <span>Submitted</span>
                  ) : (
                    <Link to={`/test/${test.metadata.id}/${module}`}>
                      {submitted ? "Open" : inProgress ? "Continue" : "Start"}
                    </Link>
                  )
                ) : (
                  <span>Unavailable</span>
                )}
                {submitted && testComplete ? (
                  <Link to={`/test/${test.metadata.id}/${module}/result`}>
                    Result
                  </Link>
                ) : null}
              </div>
              {testComplete && session?.objectiveResult ? (
                <p className={styles.scoreLine}>
                  {session.objectiveResult.correctCount} /{" "}
                  {session.objectiveResult.totalQuestions} · Band{" "}
                  {session.objectiveResult.bandScore ?? "N/A"}
                </p>
              ) : null}
              {testComplete && session?.writingResult ? (
                <p className={styles.scoreLine}>
                  Task 1: {session.writingResult.task1WordCount} words · Task
                  2: {session.writingResult.task2WordCount} words
                </p>
              ) : null}
            </section>
          );
        })}
      </section>

      {testComplete ? (
        <section className={styles.finalSummary}>
          <h2>Test summary</h2>
          <p>
            All available modules are submitted. Final results are now available
            for review and copying.
          </p>
          <Link to={`/test/${test.metadata.id}/final-result`}>
            View final result
          </Link>
          <button type="button" onClick={handleResetTest}>
            Reset test
          </button>
        </section>
      ) : null}

      <section className={styles.report}>
        <h2>Source Material Report</h2>
        <div>
          <h3>Test structure identified</h3>
          <p>
            Listening, {formatTestType(test.metadata.testType)} Reading and
            Writing were identified from the source PDF. Available modules are
            ready for testing now.
          </p>
        </div>
        <div>
          <h3>Available assets</h3>
          <p>
            {materialReport.availableAssets.length > 0
              ? materialReport.availableAssets.join(", ")
              : "None"}
          </p>
        </div>
        <div>
          <h3>Missing assets</h3>
          {materialReport.missingAssets.length > 0 ? (
            <ul>
              {materialReport.missingAssets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>None</p>
          )}
        </div>
        <div>
          <h3>Question types</h3>
          <p>{materialReport.questionTypes.join(", ")}</p>
        </div>
        <div>
          <h3>Potential problems</h3>
          {materialReport.potentialProblems.length > 0 ? (
            <ul>
              {materialReport.potentialProblems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>None</p>
          )}
        </div>
      </section>
    </main>
  );
}
