import { useEffect } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router";
import { MaterialMissingPanel } from "../components/exam/MaterialMissingPanel";
import { examModules, isSubmittedSession, isTestComplete } from "../domain/testCompletion";
import { useExamStore } from "../store/examStore";
import { isExamModule, moduleTitle, useMockTest } from "./pageUtils";
import styles from "./ModuleIntroPage.module.css";

export function ModuleIntroPage() {
  const params = useParams();
  const navigate = useNavigate();
  const module = isExamModule(params.module) ? params.module : null;
  const { test, isLoading } = useMockTest(params.testId);
  const restoreSession = useExamStore((state) => state.restoreSession);
  const startModule = useExamStore((state) => state.startModule);
  const resetModule = useExamStore((state) => state.resetModule);
  const sessions = useExamStore((state) => state.sessions);
  const session = useExamStore((state) =>
    params.testId && module ? state.sessions[`${params.testId}:${module}`] : undefined,
  );

  useEffect(() => {
    if (params.testId) {
      examModules.forEach((item) => restoreSession(params.testId ?? "", item));
    }
  }, [params.testId, restoreSession]);

  if (!module) {
    return <Navigate to="/" replace />;
  }
  const examModule = module;

  if (isLoading) {
    return <main className={styles.page}>Loading test...</main>;
  }

  if (!test) {
    return <Navigate to="/" replace />;
  }

  const materialStatus = test.materials[examModule];
  const canStart = materialStatus.available;
  const submitted = isSubmittedSession(session);
  const testComplete = isTestComplete(test, sessions);

  function handleStart() {
    if (!test || !canStart) {
      return;
    }

    if (submitted && !testComplete) {
      return;
    }

    const session = startModule(test, examModule);

    if (session.status === "IN_PROGRESS") {
      navigate(`/test/${test.metadata.id}/${examModule}/exam`);
      return;
    }

    if (
      session.status === "SUBMITTED" ||
      session.status === "TIME_EXPIRED" ||
      session.status === "REVIEW"
    ) {
      navigate(`/test/${test.metadata.id}/${examModule}/result`);
    }
  }

  function handleNewAttempt() {
    if (!test) {
      return;
    }

    resetModule(test.metadata.id, examModule);
    const nextSession = startModule(test, examModule);
    if (nextSession.status === "IN_PROGRESS") {
      navigate(`/test/${test.metadata.id}/${examModule}/exam`);
    }
  }

  return (
    <main className={styles.page}>
      <Link className={styles.backLink} to="/">
        Back to tests
      </Link>
      <section className={styles.intro}>
        <h1>
          {test.metadata.title} | {moduleTitle(examModule)}
        </h1>
        <p>
          This module uses the preserved Cambridge IELTS 4 Test 1 source
          material where available.
        </p>
        <button
          disabled={!canStart || (submitted && !testComplete)}
          type="button"
          onClick={handleStart}
        >
          {submitted
            ? testComplete
              ? "View result"
              : "Submitted"
            : `Start ${moduleTitle(examModule)}`}
        </button>
        {canStart && session?.status && session.status !== "NOT_STARTED" ? (
          <button type="button" onClick={handleNewAttempt}>
            Start new attempt
          </button>
        ) : null}
      </section>
      {!canStart ? (
        <MaterialMissingPanel
          title={`${moduleTitle(examModule)} material is missing`}
          status={materialStatus}
        />
      ) : null}
    </main>
  );
}
