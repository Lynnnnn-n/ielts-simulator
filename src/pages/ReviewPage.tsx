import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router";
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
    if (params.testId && module && module !== "writing") {
      examModules.forEach((item) => restoreSession(params.testId ?? "", item));
      setHasRestoredSessions(true);
    }
  }, [module, params.testId, restoreSession]);

  useEffect(() => {
    if (
      params.testId &&
      module &&
      module !== "writing" &&
      session &&
      (session.status === "SUBMITTED" || session.status === "TIME_EXPIRED")
    ) {
      enterReview(params.testId, module);
    }
  }, [enterReview, module, params.testId, session]);

  if (!module || module === "writing") {
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

  if (
    !isSubmittedSession(activeSession)
  ) {
    return <Navigate to={`/test/${loadedTest.metadata.id}/${module}`} replace />;
  }

  if (!testComplete) {
    return <Navigate to="/" replace />;
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
        <Link to={`/test/${loadedTest.metadata.id}/${module}/result`}>
          Result
        </Link>
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
