import { useEffect, useState } from "react";
import { Link } from "react-router";
import { mockTest01MaterialReport } from "../data/mockTest01";
import type { MockTest } from "../domain/examTypes";
import {
  examModules,
  getAvailableModules,
  isSubmittedSession,
  isTestComplete,
} from "../domain/testCompletion";
import { testRepository } from "../services/testRepository";
import { useExamStore } from "../store/examStore";
import { moduleTitle } from "./pageUtils";
import styles from "./TestSelectionPage.module.css";

export function TestSelectionPage() {
  const [tests, setTests] = useState<MockTest[]>([]);
  const restoreSession = useExamStore((state) => state.restoreSession);
  const resetModule = useExamStore((state) => state.resetModule);
  const sessions = useExamStore((state) => state.sessions);

  useEffect(() => {
    void testRepository.listTests().then(setTests);
  }, []);

  useEffect(() => {
    tests.forEach((test) => {
      examModules.forEach((module) => restoreSession(test.metadata.id, module));
    });
  }, [restoreSession, tests]);

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <h1>IELTS Computer-Delivered Mock Test Simulator</h1>
        <p>Mock Test 01 uses the imported Cambridge IELTS 4 Test 1 material.</p>
      </section>

      {tests.map((test) => {
        const availableModules = getAvailableModules(test);
        const completedModules = availableModules.filter((module) =>
          isSubmittedSession(sessions[`${test.metadata.id}:${module}`]),
        );
        const testComplete = isTestComplete(test, sessions);

        function handleResetTest() {
          const shouldReset = window.confirm(
            "Reset this completed mock test and clear all saved answers?",
          );

          if (!shouldReset) {
            return;
          }

          availableModules.forEach((module) => resetModule(test.metadata.id, module));
        }

        return (
          <section className={styles.testPanel} key={test.metadata.id}>
            <div className={styles.testHeader}>
              <div>
                <h2>{test.metadata.title}</h2>
                <p>{test.metadata.testType} Reading, Listening and Writing</p>
              </div>
              <strong>
                {completedModules.length} / {availableModules.length} available
                modules completed
              </strong>
            </div>

            <div className={styles.moduleGrid}>
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
                      <h3>{moduleTitle(module)}</h3>
                      <p>{statusText}</p>
                    </div>
                    <div className={styles.moduleActions}>
                      {material.available ? (
                        submitted && !testComplete ? (
                          <span>Submitted</span>
                        ) : (
                          <Link to={`/test/${test.metadata.id}/${module}`}>
                            {submitted
                              ? "Open"
                              : inProgress
                                ? "Continue"
                                : "Start"}
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
                        Task 1: {session.writingResult.task1WordCount} words ·
                        Task 2: {session.writingResult.task2WordCount} words
                      </p>
                    ) : null}
                  </section>
                );
              })}
            </div>

            {testComplete ? (
              <div className={styles.finalSummary}>
                <h3>Test summary</h3>
                <p>
                  All available modules are submitted. Final results are now
                  available for review and copying.
                </p>
                <Link to={`/test/${test.metadata.id}/final-result`}>
                  View final result
                </Link>
                <button type="button" onClick={handleResetTest}>
                  Reset test
                </button>
              </div>
            ) : null}
          </section>
        );
      })}

      <section className={styles.report}>
        <h2>Source Material Report</h2>
        <div>
          <h3>Test structure identified</h3>
          <p>
            Listening, Academic Reading and Writing Test 1 were identified from
            the source PDF. Reading, Listening and Writing are available for
            testing now.
          </p>
        </div>
        <div>
          <h3>Available assets</h3>
          <p>
            {mockTest01MaterialReport.availableAssets.length > 0
              ? mockTest01MaterialReport.availableAssets.join(", ")
              : "None"}
          </p>
        </div>
        <div>
          <h3>Missing assets</h3>
          <ul>
            {mockTest01MaterialReport.missingAssets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Question types</h3>
          <p>{mockTest01MaterialReport.questionTypes.join(", ")}</p>
        </div>
        <div>
          <h3>Potential problems</h3>
          <ul>
            {mockTest01MaterialReport.potentialProblems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
