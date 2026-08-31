import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router";
import { AssetImage } from "../components/exam/AssetImage";
import { QuestionRenderer } from "../components/questions/QuestionRenderer";
import {
  examModules,
  isSubmittedSession,
  isTestComplete,
} from "../domain/testCompletion";
import { useExamStore } from "../store/examStore";
import { isExamModule, moduleTitle, useMockTest } from "./pageUtils";
import styles from "./ReviewPage.module.css";

export function ReviewPage() {
  const params = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const module = isExamModule(params.module) ? params.module : null;
  const { test, isLoading } = useMockTest(params.testId);
  const restoreSession = useExamStore((state) => state.restoreSession);
  const enterReview = useExamStore((state) => state.enterReview);
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

  useEffect(() => {
    if (
      params.testId &&
      module &&
      session &&
      (session.status === "SUBMITTED" || session.status === "TIME_EXPIRED")
    ) {
      enterReview(params.testId, module);
    }
  }, [enterReview, module, params.testId, session]);

  if (!module) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return <main className={styles.page}>Loading review...</main>;
  }

  if (!test || !params.testId) {
    return <Navigate to="/" replace />;
  }

  const loadedTest = test;

  if (!hasRestoredSessions || !session) {
    return <main className={styles.page}>Restoring review...</main>;
  }

  const activeSession = session;
  const testComplete = isTestComplete(loadedTest, sessions);
  const returnToFinalResult = searchParams.get("from") === "final";
  const testOverviewPath = `/test/${loadedTest.metadata.id}`;
  const returnPath = returnToFinalResult
    ? `/test/${loadedTest.metadata.id}/final-result`
    : `/test/${loadedTest.metadata.id}/${module}/result`;

  function returnToModuleSelection() {
    navigate(testOverviewPath, { replace: true });
  }

  if (
    !isSubmittedSession(activeSession)
  ) {
    return <Navigate to={`/test/${loadedTest.metadata.id}/${module}`} replace />;
  }

  if (!testComplete) {
    return <Navigate to={testOverviewPath} replace />;
  }

  if (module === "writing") {
    return (
      <main className={styles.page}>
        <header className={styles.header}>
          <div>
            <h1>Writing Review</h1>
            <p>Writing submissions are available for review and copying.</p>
          </div>
          <nav className={styles.headerActions}>
            <button type="button" onClick={returnToModuleSelection}>
              Back to module selection
            </button>
            <Link to={returnPath}>
              {returnToFinalResult ? "Final Result" : "Result"}
            </Link>
          </nav>
        </header>
        <section className={styles.writingReview}>
          {(["task1", "task2"] as const).map((taskId) => {
            const task = loadedTest.writing[taskId];
            const response = activeSession.writing[taskId];

            if (!task) {
              return null;
            }

            return (
              <article className={styles.writingTask} key={taskId}>
                <div className={styles.taskPrompt}>
                  <h2>{task.title}</h2>
                  <p>{task.prompt}</p>
                  {task.imageAssetIds
                    ?.map((assetId) =>
                      loadedTest.assets.find((asset) => asset.id === assetId),
                    )
                    .filter((asset): asset is NonNullable<typeof asset> =>
                      Boolean(asset),
                    )
                    .map((asset) => <AssetImage asset={asset} key={asset.id} />)}
                </div>
                <div className={styles.responseBlock}>
                  <div>
                    <h3>Your response</h3>
                    <button
                      type="button"
                      onClick={() =>
                        void navigator.clipboard.writeText(response)
                      }
                    >
                      Copy
                    </button>
                  </div>
                  <textarea readOnly value={response} />
                </div>
              </article>
            );
          })}
        </section>
      </main>
    );
  }

  const moduleData =
    module === "reading" ? loadedTest.reading : loadedTest.listening;
  const resultByQuestionId = new Map(
    activeSession.objectiveResult?.items.map((item) => [item.questionId, item]),
  );

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>{moduleTitle(module)} Review</h1>
          <p>Correct answers are available only in Review Mode.</p>
        </div>
        <nav className={styles.headerActions}>
          <button type="button" onClick={returnToModuleSelection}>
            Back to module selection
          </button>
          <Link to={returnPath}>
            {returnToFinalResult ? "Final Result" : "Result"}
          </Link>
        </nav>
      </header>
      <section className={styles.reviewList}>
        {moduleData.questions.length === 0 ? (
          <p>No questions are available because source material is missing.</p>
        ) : (
          moduleData.questions.map((question) => {
            const reviewAnswer = resultByQuestionId.get(question.id);
            return (
              <QuestionRenderer
                key={question.id}
                question={question}
                value={activeSession.answers[question.id] ?? ""}
                isFlagged={activeSession.flaggedQuestionIds.includes(
                  question.id,
                )}
                onChange={() => undefined}
                onFlag={() => undefined}
                isReviewMode
                reviewAnswer={
                  reviewAnswer
                    ? {
                        correctAnswer: reviewAnswer.correctAnswer,
                        status: reviewAnswer.status,
                      }
                    : undefined
                }
              />
            );
          })
        )}
      </section>
    </main>
  );
}
