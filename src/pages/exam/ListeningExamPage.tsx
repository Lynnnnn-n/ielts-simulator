import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router";
import { ExamHeader } from "../../components/exam/ExamHeader";
import { MaterialMissingPanel } from "../../components/exam/MaterialMissingPanel";
import { QuestionNavigator } from "../../components/exam/QuestionNavigator";
import { RestrictedAudioPlayer } from "../../components/exam/RestrictedAudioPlayer";
import { SubmitConfirmationDialog } from "../../components/exam/SubmitConfirmationDialog";
import { EmbeddedQuestionSheet } from "../../components/questions/EmbeddedQuestionSheet";
import { useExamStore } from "../../store/examStore";
import { moduleTitle, useMockTest } from "../pageUtils";
import { useActiveExamLeaveWarning } from "../useActiveExamLeaveWarning";
import styles from "./ListeningExamPage.module.css";

export function ListeningExamPage() {
  const params = useParams();
  const navigate = useNavigate();
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const { test, isLoading } = useMockTest(params.testId);
  const restoreSession = useExamStore((state) => state.restoreSession);
  const submitModule = useExamStore((state) => state.submitModule);
  const setAnswer = useExamStore((state) => state.setAnswer);
  const setCurrentQuestion = useExamStore((state) => state.setCurrentQuestion);
  const setFontSize = useExamStore((state) => state.setFontSize);
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
    params.testId ? state.sessions[`${params.testId}:listening`] : undefined,
  );

  useActiveExamLeaveWarning(session?.status === "IN_PROGRESS");

  useEffect(() => {
    if (params.testId) {
      restoreSession(params.testId, "listening");
    }
  }, [params.testId, restoreSession]);

  const handleSubmit = useCallback(
    (status: "SUBMITTED" | "TIME_EXPIRED" = "SUBMITTED") => {
      if (!test) {
        return;
      }

      submitModule(test, "listening", status);
      navigate(`/test/${test.metadata.id}`);
    },
    [navigate, submitModule, test],
  );

  const questions = test?.listening.questions ?? [];
  const activePartIndex = useMemo(() => {
    if (!test || !session?.currentQuestionId) {
      return 0;
    }

    const index = test.listening.parts.findIndex((part) =>
      part.questionIds.includes(session.currentQuestionId ?? ""),
    );

    return index >= 0 ? index : 0;
  }, [session?.currentQuestionId, test]);
  const [selectedPartIndex, setSelectedPartIndex] = useState(0);

  useEffect(() => {
    setSelectedPartIndex(activePartIndex);
  }, [activePartIndex]);

  if (isLoading) {
    return <main className={styles.loading}>Loading test...</main>;
  }

  if (!test || !params.testId) {
    return <Navigate to="/" replace />;
  }

  const loadedTest = test;

  if (!session) {
    return <main className={styles.loading}>Restoring session...</main>;
  }

  if (session.status !== "IN_PROGRESS") {
    if (
      session.status === "SUBMITTED" ||
      session.status === "TIME_EXPIRED" ||
      session.status === "REVIEW"
    ) {
      return <Navigate to={`/test/${loadedTest.metadata.id}`} replace />;
    }

    return <Navigate to={`/test/${loadedTest.metadata.id}/listening`} replace />;
  }

  const materialStatus = loadedTest.materials.listening;
  const selectedPart =
    loadedTest.listening.parts[selectedPartIndex] ?? loadedTest.listening.parts[0];
  const selectedPartText =
    selectedPart.instruction ??
    questions.find((question) => question.id === selectedPart.questionIds[0])
      ?.instruction ??
    "";

  function selectQuestion(questionId: string) {
    setCurrentQuestion(loadedTest.metadata.id, "listening", questionId);
    const partIndex = loadedTest.listening.parts.findIndex((part) =>
      part.questionIds.includes(questionId),
    );

    if (partIndex >= 0) {
      setSelectedPartIndex(partIndex);
    }
  }

  return (
    <main className={styles.examPage}>
      <ExamHeader
        test={loadedTest}
        module="listening"
        expiresAt={session.expiresAt}
        fontSize={session.fontSize}
        onTimeExpired={() => handleSubmit("TIME_EXPIRED")}
        onSubmit={() => setIsSubmitDialogOpen(true)}
        onFontSizeChange={(fontSize) =>
          setFontSize(loadedTest.metadata.id, "listening", fontSize)
        }
      />
      <div className={styles.tabs}>
        {loadedTest.listening.parts.map((part, index) => (
          <button
            className={index === selectedPartIndex ? styles.activeTab : ""}
            key={part.id}
            type="button"
            onClick={() => {
              setSelectedPartIndex(index);
              selectQuestion(part.questionIds[0]);
            }}
          >
            Section {index + 1}
          </button>
        ))}
      </div>
      <section className={`${styles.workspace} ${styles[`font-${session.fontSize}`]}`}>
        {!materialStatus.available || !selectedPart ? (
          <MaterialMissingPanel
            title="Listening material is missing"
            status={materialStatus}
          />
        ) : (
          <>
            <div className={styles.audioPanel}>
              <h2>{selectedPart.title}</h2>
              <RestrictedAudioPlayer
                partId={selectedPart.id}
                playbackState={session.listeningPlayback}
                src={
                  loadedTest.assets.find((asset) => asset.id === selectedPart.audioAssetId)
                    ?.path
                }
                onStarted={() =>
                  markListeningPlaybackStarted(loadedTest.metadata.id, selectedPart.id)
                }
                onStopped={() =>
                  markListeningPlaybackStopped(loadedTest.metadata.id, selectedPart.id)
                }
                onCompleted={() =>
                  markListeningPlaybackCompleted(loadedTest.metadata.id, selectedPart.id)
                }
              />
            </div>
            <EmbeddedQuestionSheet
              answers={session.answers}
              testId={loadedTest.metadata.id}
              module="listening"
              questionIds={selectedPart.questionIds}
              questions={questions}
              text={selectedPartText}
              onAnswer={(questionId: string, value: string) =>
                setAnswer(loadedTest.metadata.id, "listening", questionId, value)
              }
              onFocusQuestion={(questionId: string) =>
                setCurrentQuestion(loadedTest.metadata.id, "listening", questionId)
              }
            />
          </>
        )}
      </section>
      <QuestionNavigator
        module="listening"
        questions={questions}
        session={session}
        onSelect={selectQuestion}
      />
      {isSubmitDialogOpen ? (
        <SubmitConfirmationDialog
          moduleLabel={moduleTitle("listening")}
          onCancel={() => setIsSubmitDialogOpen(false)}
          onConfirm={() => handleSubmit("SUBMITTED")}
        />
      ) : null}
    </main>
  );
}
