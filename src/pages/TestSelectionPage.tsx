import { useEffect, useState } from "react";
import { Link } from "react-router";
import type { MockTest } from "../domain/examTypes";
import {
  examModules,
  getAvailableModules,
  isSubmittedSession,
} from "../domain/testCompletion";
import { testRepository } from "../services/testRepository";
import { useExamStore } from "../store/examStore";
import styles from "./TestSelectionPage.module.css";

export function TestSelectionPage() {
  const [tests, setTests] = useState<MockTest[]>([]);
  const restoreSession = useExamStore((state) => state.restoreSession);
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
        <div>
          <h1>IELTS Academic Mock Tests</h1>
          <p>
            Choose a mock test first. Listening, Reading and Writing appear after
            you enter that test.
          </p>
        </div>
        <Link to="/admin/tests">Test Management</Link>
      </section>

      {tests.map((test) => {
        const availableModules = getAvailableModules(test);
        const completedModules = availableModules.filter((module) =>
          isSubmittedSession(sessions[`${test.metadata.id}:${module}`]),
        );

        return (
          <section className={styles.testPanel} key={test.metadata.id}>
            <div className={styles.testHeader}>
              <div>
                <h2>{test.metadata.title}</h2>
                <p>
                  {test.metadata.testType === "academic" ||
                  test.metadata.testType === "Academic"
                    ? "Academic"
                    : "General Training"}{" "}
                  Reading, Listening and Writing
                </p>
              </div>
              <strong>
                {completedModules.length} / {availableModules.length} available
                modules completed
              </strong>
            </div>
            <div className={styles.testActions}>
              <Link to={`/test/${test.metadata.id}`}>Enter test</Link>
            </div>
          </section>
        );
      })}
    </main>
  );
}
