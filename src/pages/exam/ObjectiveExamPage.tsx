import { Fragment, useCallback, useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router";
import { ExamHeader } from "../../components/exam/ExamHeader";
import { AssetImage } from "../../components/exam/AssetImage";
import { HighlightablePassage } from "../../components/exam/HighlightablePassage";
import { MaterialMissingPanel } from "../../components/exam/MaterialMissingPanel";
import { QuestionNavigator } from "../../components/exam/QuestionNavigator";
import { RestrictedAudioPlayer } from "../../components/exam/RestrictedAudioPlayer";
import { SubmitConfirmationDialog } from "../../components/exam/SubmitConfirmationDialog";
import { EmbeddedQuestionSheet } from "../../components/questions/EmbeddedQuestionSheet";
import { QuestionRenderer } from "../../components/questions/QuestionRenderer";
import type { ObjectiveModule, Question } from "../../domain/examTypes";
import { useExamStore } from "../../store/examStore";
import { moduleTitle, useMockTest } from "../pageUtils";
import { useActiveExamLeaveWarning } from "../useActiveExamLeaveWarning";
import styles from "./ObjectiveExamPage.module.css";

interface ObjectiveExamPageProps {
  module: ObjectiveModule;
}

export function ObjectiveExamPage({ module }: ObjectiveExamPageProps) {
  const params = useParams();
  const navigate = useNavigate();
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const { test, isLoading } = useMockTest(params.testId);
  const restoreSession = useExamStore((state) => state.restoreSession);
  const submitModule = useExamStore((state) => state.submitModule);
  const setAnswer = useExamStore((state) => state.setAnswer);
  const setCurrentQuestion = useExamStore((state) => state.setCurrentQuestion);
  const toggleFlag = useExamStore((state) => state.toggleFlag);
  const addReadingHighlight = useExamStore((state) => state.addReadingHighlight);
  const addReadingNote = useExamStore((state) => state.addReadingNote);
  const updateReadingNote = useExamStore((state) => state.updateReadingNote);
  const removeReadingNote = useExamStore((state) => state.removeReadingNote);
  const removeReadingNotesInRange = useExamStore(
    (state) => state.removeReadingNotesInRange,
  );
  const clearReadingMarks = useExamStore((state) => state.clearReadingMarks);
  const setFontSize = useExamStore((state) => state.setFontSize);
  const removeReadingHighlight = useExamStore(
    (state) => state.removeReadingHighlight,
  );
  const removeReadingHighlightsInRange = useExamStore(
    (state) => state.removeReadingHighlightsInRange,
  );
  const markListeningPlaybackStarted = useExamStore(
    (state) => state.markListeningPlaybackStarted,
  );
  const markListeningPlaybackStopped = useExamStore(
    (state) => state.markListeningPlaybackStopped,
  );
  const markListeningPlaybackCompleted = useExamStore(
    (state) => state.markListeningPlaybackCompleted,
  );
  const session = useExamStore((state) =>
    params.testId ? state.sessions[`${params.testId}:${module}`] : undefined,
  );
  useActiveExamLeaveWarning(session?.status === "IN_PROGRESS");

  useEffect(() => {
    if (params.testId) {
      restoreSession(params.testId, module);
    }
  }, [module, params.testId, restoreSession]);

  const handleSubmit = useCallback(
    (status: "SUBMITTED" | "TIME_EXPIRED" = "SUBMITTED") => {
      if (!test) {
        return;
      }

      submitModule(test, module, status);
      navigate(`/test/${test.metadata.id}`);
    },
    [module, navigate, submitModule, test],
  );

  useEffect(() => {
    function handleQuestionTab(event: KeyboardEvent) {
      if (
        event.key !== "Tab" ||
        !test ||
        !session ||
        session.status !== "IN_PROGRESS"
      ) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (target?.tagName === "TEXTAREA") {
        return;
      }

      const moduleData =
        module === "reading" ? test.reading : test.listening;
      const questions = moduleData.questions;
      const selectedQuestionId =
        session.currentQuestionId ?? questions[0]?.id ?? "";
      const currentIndex = questions.findIndex(
        (question) => question.id === selectedQuestionId,
      );

      if (currentIndex < 0 || questions.length === 0) {
        return;
      }

      event.preventDefault();
      const direction = event.shiftKey ? -1 : 1;
      const nextIndex =
        (currentIndex + direction + questions.length) % questions.length;
      const nextQuestionId = questions[nextIndex].id;
      setCurrentQuestion(test.metadata.id, module, nextQuestionId);
      document
        .getElementById(nextQuestionId)
        ?.scrollIntoView({ block: "center" });
    }

    window.addEventListener("keydown", handleQuestionTab);
    return () => window.removeEventListener("keydown", handleQuestionTab);
  }, [module, session, setCurrentQuestion, test]);

  function requestManualSubmit() {
    setIsSubmitDialogOpen(true);
  }

  if (isLoading) {
    return <main className={styles.loading}>Loading test...</main>;
  }

  if (!test || !params.testId) {
    return <Navigate to="/" replace />;
  }

  const loadedTest = test;
  const materialStatus = loadedTest.materials[module];
  const moduleData =
    module === "reading" ? loadedTest.reading : loadedTest.listening;

  if (!session) {
    return <main className={styles.loading}>Restoring session...</main>;
  }

  const activeSession = session;

  if (activeSession.status !== "IN_PROGRESS") {
    if (
      activeSession.status === "SUBMITTED" ||
      activeSession.status === "TIME_EXPIRED" ||
      activeSession.status === "REVIEW"
    ) {
      return <Navigate to={`/test/${loadedTest.metadata.id}`} replace />;
    }

    return <Navigate to={`/test/${loadedTest.metadata.id}/${module}`} replace />;
  }

  const questions = moduleData.questions;

  if (!materialStatus.available || questions.length === 0) {
    return (
      <main className={styles.examPage}>
        <ExamHeader
          test={loadedTest}
          module={module}
          expiresAt={activeSession.expiresAt}
          fontSize={activeSession.fontSize}
          onTimeExpired={() => handleSubmit("TIME_EXPIRED")}
          onSubmit={requestManualSubmit}
          onFontSizeChange={(fontSize) =>
            setFontSize(loadedTest.metadata.id, module, fontSize)
          }
        />
        <MaterialMissingPanel
          title={`${module} material is missing`}
          status={materialStatus}
        />
        {isSubmitDialogOpen ? (
          <SubmitConfirmationDialog
            moduleLabel={moduleTitle(module)}
            onCancel={() => setIsSubmitDialogOpen(false)}
            onConfirm={() => handleSubmit("SUBMITTED")}
          />
        ) : null}
      </main>
    );
  }

  const selectedQuestionId =
    activeSession.currentQuestionId ?? questions[0]?.id ?? "";

  function handleSelectQuestion(questionId: string) {
    setCurrentQuestion(loadedTest.metadata.id, module, questionId);
    document.getElementById(questionId)?.scrollIntoView({ block: "center" });
  }

  function renderQuestions(questionList: Question[]) {
    return questionList.map((question) => (
      <QuestionRenderer
        key={question.id}
        question={question}
        value={activeSession.answers[question.id] ?? ""}
        isFlagged={activeSession.flaggedQuestionIds.includes(question.id)}
        onChange={(value) =>
          setAnswer(loadedTest.metadata.id, module, question.id, value)
        }
        onFlag={() => toggleFlag(loadedTest.metadata.id, module, question.id)}
        assets={loadedTest.assets}
      />
    ));
  }

  const usesEmbeddedReadingSheet =
    module === "reading" && questions.every((question) => !question.prompt.trim());

  function renderEmbeddedReadingQuestions() {
    return loadedTest.reading.passages.map((passage) => {
      const firstQuestion = questions.find(
        (question) => question.id === passage.questionIds[0],
      );

      if (!firstQuestion?.instruction) {
        return null;
      }

      return (
        <EmbeddedQuestionSheet
          assets={loadedTest.assets}
          answers={activeSession.answers}
          key={passage.id}
          testId={loadedTest.metadata.id}
          module="reading"
          questionIds={passage.questionIds}
          questions={questions}
          text={firstQuestion.instruction}
          onAnswer={(questionId, value) =>
            setAnswer(loadedTest.metadata.id, module, questionId, value)
          }
          onFocusQuestion={(questionId) =>
            setCurrentQuestion(loadedTest.metadata.id, module, questionId)
          }
        />
      );
    });
  }

  return (
    <main className={styles.examPage}>
      <ExamHeader
        test={loadedTest}
          module={module}
          expiresAt={activeSession.expiresAt}
          fontSize={activeSession.fontSize}
          onTimeExpired={() => handleSubmit("TIME_EXPIRED")}
          onSubmit={requestManualSubmit}
          onFontSizeChange={(fontSize) =>
            setFontSize(loadedTest.metadata.id, module, fontSize)
          }
        />
      <div
        className={`${styles.workspace} ${styles[`font-${activeSession.fontSize}`]}`}
      >
        <div className={styles.screenWarning}>
          This window is too narrow for the IELTS split-screen layout.
        </div>
        {module === "reading" ? (
          <section className={styles.passagePane}>
            {loadedTest.reading.passages.map((passage) => (
              <Fragment key={passage.id}>
                <HighlightablePassage
                  highlights={activeSession.highlights}
                  notes={activeSession.notes}
                  passage={passage}
                  onAddHighlight={(highlight) =>
                    addReadingHighlight(loadedTest.metadata.id, highlight)
                  }
                  onAddNote={(note) =>
                    addReadingNote(loadedTest.metadata.id, note)
                  }
                  onUpdateNote={(noteId, text) =>
                    updateReadingNote(loadedTest.metadata.id, noteId, text)
                  }
                  onRemoveNote={(noteId) =>
                    removeReadingNote(loadedTest.metadata.id, noteId)
                  }
                  onRemoveHighlight={(highlightId) =>
                    removeReadingHighlight(loadedTest.metadata.id, highlightId)
                  }
                  onRemoveHighlightsInRange={(range) =>
                    removeReadingHighlightsInRange(loadedTest.metadata.id, range)
                  }
                  onRemoveNotesInRange={(range) =>
                    removeReadingNotesInRange(loadedTest.metadata.id, range)
                  }
                  onClearAll={() => clearReadingMarks(loadedTest.metadata.id)}
                />
                {passage.imageAssetIds
                  ?.map((assetId) =>
                    loadedTest.assets.find((asset) => asset.id === assetId),
                  )
                  .filter((asset): asset is NonNullable<typeof asset> =>
                    Boolean(asset),
                  )
                  .map((asset) => <AssetImage asset={asset} key={asset.id} />)}
              </Fragment>
            ))}
          </section>
        ) : (
          <section className={styles.passagePane}>
            {loadedTest.listening.parts.map((part) => (
              <article key={part.id} className={styles.passage}>
                <h2>{part.title}</h2>
                {part.instruction ? <p>{part.instruction}</p> : null}
                {part.imageAssetIds
                  ?.map((assetId) =>
                    loadedTest.assets.find((asset) => asset.id === assetId),
                  )
                  .filter((asset): asset is NonNullable<typeof asset> =>
                    Boolean(asset),
                  )
                  .map((asset) => <AssetImage asset={asset} key={asset.id} />)}
                <RestrictedAudioPlayer
                  partId={part.id}
                  playbackState={activeSession.listeningPlayback}
                  src={
                    loadedTest.assets.find(
                      (asset) => asset.id === part.audioAssetId,
                    )
                      ?.path
                  }
                  onStarted={() =>
                    markListeningPlaybackStarted(loadedTest.metadata.id, part.id)
                  }
                  onStopped={() =>
                    markListeningPlaybackStopped(loadedTest.metadata.id, part.id)
                  }
                  onCompleted={() =>
                    markListeningPlaybackCompleted(loadedTest.metadata.id, part.id)
                  }
                />
              </article>
            ))}
          </section>
        )}
        <section className={styles.questionPane}>
          {usesEmbeddedReadingSheet
            ? renderEmbeddedReadingQuestions()
            : renderQuestions(questions)}
        </section>
      </div>
      <QuestionNavigator
        module={module}
        questions={questions}
        session={{ ...activeSession, currentQuestionId: selectedQuestionId }}
        onSelect={handleSelectQuestion}
      />
      {isSubmitDialogOpen ? (
        <SubmitConfirmationDialog
          moduleLabel={moduleTitle(module)}
          onCancel={() => setIsSubmitDialogOpen(false)}
          onConfirm={() => handleSubmit("SUBMITTED")}
        />
      ) : null}
    </main>
  );
}
