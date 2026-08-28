import { useCallback, useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router";
import { ExamHeader } from "../components/exam/ExamHeader";
import { AssetImage } from "../components/exam/AssetImage";
import { MaterialMissingPanel } from "../components/exam/MaterialMissingPanel";
import { SubmitConfirmationDialog } from "../components/exam/SubmitConfirmationDialog";
import { countWords } from "../domain/wordCount";
import { useExamStore } from "../store/examStore";
import { useMockTest } from "./pageUtils";
import { useActiveExamLeaveWarning } from "./useActiveExamLeaveWarning";
import styles from "./WritingExamPage.module.css";

export function WritingExamPage() {
  const params = useParams();
  const navigate = useNavigate();
  const [activeTask, setActiveTask] = useState<"task1" | "task2">("task1");
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const { test, isLoading } = useMockTest(params.testId);
  const restoreSession = useExamStore((state) => state.restoreSession);
  const setWriting = useExamStore((state) => state.setWriting);
  const setFontSize = useExamStore((state) => state.setFontSize);
  const submitModule = useExamStore((state) => state.submitModule);
  const session = useExamStore((state) =>
    params.testId ? state.sessions[`${params.testId}:writing`] : undefined,
  );
  useActiveExamLeaveWarning(session?.status === "IN_PROGRESS");

  useEffect(() => {
    if (params.testId) {
      restoreSession(params.testId, "writing");
    }
  }, [params.testId, restoreSession]);

  const handleSubmit = useCallback(
    (status: "SUBMITTED" | "TIME_EXPIRED" = "SUBMITTED") => {
      if (!test) {
        return;
      }

      submitModule(test, "writing", status);
      navigate("/");
    },
    [navigate, submitModule, test],
  );

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
      return <Navigate to="/" replace />;
    }

    return <Navigate to={`/test/${loadedTest.metadata.id}/writing`} replace />;
  }

  if (
    !loadedTest.materials.writing.available ||
    !loadedTest.writing.task1 ||
    !loadedTest.writing.task2
  ) {
    return (
      <main className={styles.examPage}>
        <ExamHeader
          test={loadedTest}
          module="writing"
          expiresAt={activeSession.expiresAt}
          fontSize={activeSession.fontSize}
          onTimeExpired={() => handleSubmit("TIME_EXPIRED")}
          onSubmit={requestManualSubmit}
          onFontSizeChange={(fontSize) =>
            setFontSize(loadedTest.metadata.id, "writing", fontSize)
          }
        />
        <MaterialMissingPanel
          title="Writing material is missing"
          status={loadedTest.materials.writing}
        />
        {isSubmitDialogOpen ? (
          <SubmitConfirmationDialog
            moduleLabel="Writing"
            onCancel={() => setIsSubmitDialogOpen(false)}
            onConfirm={() => handleSubmit("SUBMITTED")}
          />
        ) : null}
      </main>
    );
  }

  const task =
    activeTask === "task1" ? loadedTest.writing.task1 : loadedTest.writing.task2;
  const response = activeSession.writing[activeTask];

  return (
    <main className={styles.examPage}>
      <ExamHeader
        test={loadedTest}
        module="writing"
        expiresAt={activeSession.expiresAt}
        fontSize={activeSession.fontSize}
        onTimeExpired={() => handleSubmit("TIME_EXPIRED")}
        onSubmit={requestManualSubmit}
        onFontSizeChange={(fontSize) =>
          setFontSize(loadedTest.metadata.id, "writing", fontSize)
        }
      />
      <div className={styles.tabs}>
        <button
          className={activeTask === "task1" ? styles.activeTab : ""}
          type="button"
          onClick={() => setActiveTask("task1")}
        >
          Task 1
        </button>
        <button
          className={activeTask === "task2" ? styles.activeTab : ""}
          type="button"
          onClick={() => setActiveTask("task2")}
        >
          Task 2
        </button>
      </div>
      <div
        className={`${styles.workspace} ${styles[`font-${activeSession.fontSize}`]}`}
      >
        <section className={styles.promptPane}>
          <h1>{task.title}</h1>
          <p>{task.prompt}</p>
          {task.imageAssetIds
            ?.map((assetId) =>
              loadedTest.assets.find((asset) => asset.id === assetId),
            )
            .filter((asset): asset is NonNullable<typeof asset> =>
              Boolean(asset),
            )
            .map((asset) => <AssetImage asset={asset} key={asset.id} />)}
          {task.table ? (
            <table className={styles.taskTable}>
              {task.table.caption ? <caption>{task.table.caption}</caption> : null}
              <thead>
                <tr>
                  {task.table.columns.map((column) => (
                    <th key={column}>{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {task.table.rows.map((row) => (
                  <tr key={row.join(":")}>
                    {row.map((cell, index) =>
                      index === 0 ? (
                        <th key={cell} scope="row">
                          {cell}
                        </th>
                      ) : (
                        <td key={cell}>{cell}</td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </section>
        <section className={styles.editorPane}>
          <textarea
            value={response}
            autoCapitalize="sentences"
            autoComplete="off"
            autoCorrect="off"
            aria-label={`${task.title} response`}
            spellCheck={false}
            onChange={(event) =>
              setWriting(
                loadedTest.metadata.id,
                "writing",
                activeTask,
                event.target.value,
              )
            }
          />
          <div className={styles.wordCount}>Words: {countWords(response)}</div>
        </section>
      </div>
      {isSubmitDialogOpen ? (
        <SubmitConfirmationDialog
          moduleLabel="Writing"
          onCancel={() => setIsSubmitDialogOpen(false)}
          onConfirm={() => handleSubmit("SUBMITTED")}
        />
      ) : null}
    </main>
  );
}
