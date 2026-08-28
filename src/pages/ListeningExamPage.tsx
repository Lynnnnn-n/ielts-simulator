import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router";
import { ExamHeader } from "../components/exam/ExamHeader";
import { MaterialMissingPanel } from "../components/exam/MaterialMissingPanel";
import { QuestionNavigator } from "../components/exam/QuestionNavigator";
import { RestrictedAudioPlayer } from "../components/exam/RestrictedAudioPlayer";
import { SubmitConfirmationDialog } from "../components/exam/SubmitConfirmationDialog";
import { useExamStore } from "../store/examStore";
import { useMockTest } from "./pageUtils";
import { useActiveExamLeaveWarning } from "./useActiveExamLeaveWarning";
import styles from "./ListeningExamPage.module.css";

const partQuestionRanges = [
  { partIndex: 0, start: 1, end: 10 },
  { partIndex: 1, start: 11, end: 20 },
  { partIndex: 2, start: 21, end: 30 },
  { partIndex: 3, start: 31, end: 40 },
];

function getQuestionId(number: number): string {
  return `lq${number}`;
}

function getPartIndexForQuestion(questionId: string | undefined): number {
  const number = Number(questionId?.replace("lq", ""));
  const range = partQuestionRanges.find(
    (item) => number >= item.start && number <= item.end,
  );
  return range?.partIndex ?? 0;
}

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

  const activePartIndex = useMemo(
    () => getPartIndexForQuestion(session?.currentQuestionId),
    [session?.currentQuestionId],
  );

  const handleSubmit = useCallback(
    (status: "SUBMITTED" | "TIME_EXPIRED" = "SUBMITTED") => {
      if (!test) {
        return;
      }

      submitModule(test, "listening", status);
      navigate("/");
    },
    [navigate, submitModule, test],
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

      event.preventDefault();
      const questions = test.listening.questions;
      const selectedQuestionId =
        session.currentQuestionId ?? questions[0]?.id ?? "";
      const currentIndex = questions.findIndex(
        (question) => question.id === selectedQuestionId,
      );

      if (currentIndex < 0 || questions.length === 0) {
        return;
      }

      const direction = event.shiftKey ? -1 : 1;
      const nextIndex =
        (currentIndex + direction + questions.length) % questions.length;
      const nextQuestionId = questions[nextIndex].id;
      setCurrentQuestion(test.metadata.id, "listening", nextQuestionId);
      document
        .getElementById(nextQuestionId)
        ?.scrollIntoView({ block: "center" });
    }

    window.addEventListener("keydown", handleQuestionTab);
    return () => window.removeEventListener("keydown", handleQuestionTab);
  }, [session, setCurrentQuestion, test]);

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

    return <Navigate to={`/test/${loadedTest.metadata.id}/listening`} replace />;
  }

  if (!loadedTest.materials.listening.available) {
    return (
      <main className={styles.examPage}>
        <ExamHeader
          test={loadedTest}
          module="listening"
          expiresAt={activeSession.expiresAt}
          fontSize={activeSession.fontSize}
          onTimeExpired={() => handleSubmit("TIME_EXPIRED")}
          onSubmit={() => setIsSubmitDialogOpen(true)}
          onFontSizeChange={(fontSize) =>
            setFontSize(loadedTest.metadata.id, "listening", fontSize)
          }
        />
        <MaterialMissingPanel
          title="Listening material is missing"
          status={loadedTest.materials.listening}
        />
      </main>
    );
  }

  const part = loadedTest.listening.parts[activePartIndex];
  const audioAsset = loadedTest.assets.find(
    (asset) => asset.id === part.audioAssetId,
  );

  function updateAnswer(questionNumber: number, value: string) {
    setAnswer(loadedTest.metadata.id, "listening", getQuestionId(questionNumber), value);
  }

  function answerInput(questionNumber: number, width = 150) {
    const questionId = getQuestionId(questionNumber);
    return (
      <input
        aria-label={`Answer for question ${questionNumber}`}
        className={styles.answerInput}
        id={questionId}
        style={{ minWidth: width }}
        value={activeSession.answers[questionId] ?? ""}
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        onChange={(event) => updateAnswer(questionNumber, event.target.value)}
        onFocus={() =>
          setCurrentQuestion(loadedTest.metadata.id, "listening", questionId)
        }
      />
    );
  }

  function renderChoice(
    questionNumber: number,
    prompt: string,
    options: Array<[string, string]>,
  ) {
    const questionId = getQuestionId(questionNumber);
    const value = activeSession.answers[questionId] ?? "";
    return (
      <section className={styles.choiceQuestion} id={questionId}>
        <p>
          <span className={styles.number}>{questionNumber}</span> {prompt}
        </p>
        {options.map(([optionId, text]) => (
          <label className={styles.option} key={optionId}>
            <input
              checked={value === optionId}
              name={questionId}
              type="radio"
              value={optionId}
              onChange={() => updateAnswer(questionNumber, optionId)}
              onFocus={() =>
                setCurrentQuestion(loadedTest.metadata.id, "listening", questionId)
              }
            />
            <span>{optionId}</span>
            <span>{text}</span>
          </label>
        ))}
      </section>
    );
  }

  function renderCurrentSection() {
    if (activePartIndex === 0) {
      return (
        <>
          <h2>SECTION 1 Questions 1-10</h2>
          <h3>Questions 1-4</h3>
          <p className={styles.instruction}>
            Complete the notes below. Write NO MORE THAN THREE WORDS AND/OR A
            NUMBER for each answer.
          </p>
          <div className={styles.notesBlock}>
            <strong>NOTES ON SOCIAL PROGRAMME</strong>
            <div className={styles.inlineQuestion}>
              <span>Visit places which have:</span>
              <span>historical interest</span>
            </div>
            <div className={styles.inlineQuestion}>
              <span>good</span>
              <span className={styles.number}>1</span>
              {answerInput(1)}
            </div>
            <div className={styles.inlineQuestion}>
              <span className={styles.number}>2</span>
              {answerInput(2)}
            </div>
            <div className={styles.inlineQuestion}>
              <span>special trips organised for groups of</span>
              <span className={styles.number}>3</span>
              {answerInput(3, 90)}
              <span>people</span>
            </div>
            <div className={styles.inlineQuestion}>
              <span>To reserve a seat: sign name on the</span>
              <span className={styles.number}>4</span>
              {answerInput(4)}
              <span>3 days in advance</span>
            </div>
          </div>
          <h3>Questions 5-10</h3>
          <p className={styles.instruction}>
            Complete the table below. Write NO MORE THAN THREE WORDS AND/OR A
            NUMBER for each answer.
          </p>
          <table className={styles.tripTable}>
            <thead>
              <tr>
                <th>Place</th>
                <th>Date</th>
                <th>Number of seats</th>
                <th>Optional extra</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>St Ives</td>
                <td>{answerInput(5)}</td>
                <td>16</td>
                <td>Hepworth Museum</td>
              </tr>
              <tr>
                <td>London</td>
                <td>16th February</td>
                <td>45</td>
                <td>{answerInput(6)}</td>
              </tr>
              <tr>
                <td>{answerInput(7)}</td>
                <td>3rd March</td>
                <td>18</td>
                <td>S.S. Great Britain</td>
              </tr>
              <tr>
                <td>Salisbury</td>
                <td>18th March</td>
                <td>50</td>
                <td>Stonehenge</td>
              </tr>
              <tr>
                <td>Bath</td>
                <td>23rd March</td>
                <td>16</td>
                <td>{answerInput(8)}</td>
              </tr>
            </tbody>
          </table>
          <div className={styles.inlineQuestion}>
            <span>For further information: Read the</span>
            <span className={styles.number}>9</span>
            {answerInput(9)}
            <span>or see Social Assistant: Jane</span>
            <span className={styles.number}>10</span>
            {answerInput(10)}
          </div>
        </>
      );
    }

    if (activePartIndex === 1) {
      return (
        <>
          <h2>SECTION 2 Questions 11-20</h2>
          <h3>Questions 11-13</h3>
          <p className={styles.instruction}>
            Complete the sentences below. Write NO MORE THAN THREE WORDS AND/OR
            A NUMBER for each answer.
          </p>
          <div className={styles.questionList}>
            <div className={styles.inlineQuestion}>
              <span className={styles.number}>11</span>
              <span>
                Riverside Village was a good place to start an industry because
                it had water, raw materials and fuels such as
              </span>
              {answerInput(11, 220)}
            </div>
            <div className={styles.inlineQuestion}>
              <span className={styles.number}>12</span>
              <span>
                The metal industry was established at Riverside Village by
              </span>
              {answerInput(12, 220)}
              <span>who lived in the area.</span>
            </div>
            <div className={styles.inlineQuestion}>
              <span className={styles.number}>13</span>
              <span>There were over</span>
              {answerInput(13, 90)}
              <span>
                water-powered mills in the area in the eighteenth century.
              </span>
            </div>
          </div>
          <h3>Questions 14-20</h3>
          <p className={styles.instruction}>
            Label the plan below. Write NO MORE THAN TWO WORDS for each answer.
          </p>
          <table className={styles.planTable}>
            <tbody>
              <tr>
                <th>14</th>
                <td>{answerInput(14)}</td>
                <td>Road</td>
              </tr>
              <tr>
                <th>15</th>
                <td>{answerInput(15)}</td>
                <td>Entrance area</td>
              </tr>
              <tr>
                <th>16</th>
                <td>{answerInput(16)}</td>
                <td>Next to the river</td>
              </tr>
              <tr>
                <th>17</th>
                <td>{answerInput(17)}</td>
                <td>Main works area</td>
              </tr>
              <tr>
                <th>18</th>
                <td>{answerInput(18)}</td>
                <td>The Stables / The Works Office area</td>
              </tr>
              <tr>
                <th>19</th>
                <td>{answerInput(19)}</td>
                <td>Visitor area</td>
              </tr>
              <tr>
                <th>20</th>
                <td>{answerInput(20)}</td>
                <td>For the workers</td>
              </tr>
            </tbody>
          </table>
        </>
      );
    }

    if (activePartIndex === 2) {
      return (
        <>
          <h2>SECTION 3 Questions 21-30</h2>
          <h3>Questions 21 and 22</h3>
          <p className={styles.instruction}>
            Choose the correct letter, A, B or C.
          </p>
          {renderChoice(21, "Melanie says she has not started the assignment because", [
            ["A", "she was doing work for another course."],
            ["B", "it was a really big assignment."],
            ["C", "she hasn't spent time in the library."],
          ])}
          {renderChoice(22, "The lecturer says that reasonable excuses for extensions are", [
            ["A", "planning problems."],
            ["B", "problems with assignment deadlines."],
            ["C", "personal illness or accident."],
          ])}
          <h3>Questions 23-27</h3>
          <p className={styles.instruction}>
            What recommendations does Dr Johnson make about the journal
            articles? Choose your answers from the box and write the letters A-G
            next to questions 23-27.
          </p>
          <div className={styles.wordBox}>
            <span>A must read</span>
            <span>B useful</span>
            <span>C limited value</span>
            <span>D read first section</span>
            <span>E read research methods</span>
            <span>F read conclusion</span>
            <span>G don't read</span>
          </div>
          {["Jackson", "Roberts", "Morris", "Cooper", "Forster"].map(
            (name, index) => (
              <div className={styles.inlineQuestion} key={name}>
                <span>{name}:</span>
                <span className={styles.number}>{index + 23}</span>
                {answerInput(index + 23, 80)}
              </div>
            ),
          )}
          <h3>Questions 28-30</h3>
          <p className={styles.instruction}>
            Label the chart below. Choose your answers from the box below and
            write the letters A-H next to questions 28-30.
          </p>
          <div className={styles.wordBox}>
            <span>A uncooperative landlord</span>
            <span>B environment</span>
            <span>C space</span>
            <span>D noisy neighbours</span>
            <span>E near city</span>
            <span>F work location</span>
            <span>G transport</span>
            <span>H rent</span>
          </div>
          {[28, 29, 30].map((number) => (
            <div className={styles.inlineQuestion} key={number}>
              <span className={styles.number}>{number}</span>
              {answerInput(number, 80)}
            </div>
          ))}
        </>
      );
    }

    return (
      <>
        <h2>SECTION 4 Questions 31-40</h2>
        <p className={styles.instruction}>
          Complete the notes below. Write NO MORE THAN TWO WORDS for each
          answer.
        </p>
        <div className={styles.notesBlock}>
          <strong>THE URBAN LANDSCAPE</strong>
          <div className={styles.inlineQuestion}>
            <span>ways of planning our</span>
            <span className={styles.number}>31</span>
            {answerInput(31)}
            <span>better</span>
          </div>
          <div className={styles.inlineQuestion}>
            <span>they can make cities more or less</span>
            <span className={styles.number}>32</span>
            {answerInput(32)}
          </div>
          <div className={styles.inlineQuestion}>
            <span>they can make inland cities more</span>
            <span className={styles.number}>33</span>
            {answerInput(33)}
          </div>
          <div className={styles.inlineQuestion}>
            <span>they can make local areas more</span>
            <span className={styles.number}>34</span>
            {answerInput(34)}
            <span>cooler, more humid, less windy and less</span>
            <span className={styles.number}>35</span>
            {answerInput(35)}
          </div>
          <div className={styles.inlineQuestion}>
            <span>trees evaporate water through their</span>
            <span className={styles.number}>36</span>
            {answerInput(36)}
          </div>
          <div className={styles.inlineQuestion}>
            <span>tall buildings cause more wind at</span>
            <span className={styles.number}>37</span>
            {answerInput(37)}
            <span>level</span>
          </div>
          <div className={styles.inlineQuestion}>
            <span>trees</span>
            <span className={styles.number}>38</span>
            {answerInput(38)}
            <span>the wind force</span>
          </div>
          <div className={styles.inlineQuestion}>
            <span>traffic noise:</span>
            <span className={styles.number}>39</span>
            {answerInput(39)}
            <span>frequency noise passes through trees</span>
          </div>
          <div className={styles.inlineQuestion}>
            <span>trees require a lot of sunlight, water and</span>
            <span className={styles.number}>40</span>
            {answerInput(40)}
            <span>to grow</span>
          </div>
        </div>
      </>
    );
  }

  function handleSelectQuestion(questionId: string) {
    setCurrentQuestion(loadedTest.metadata.id, "listening", questionId);
    document.getElementById(questionId)?.scrollIntoView({ block: "center" });
  }

  return (
    <main className={styles.examPage}>
      <ExamHeader
        test={loadedTest}
        module="listening"
        expiresAt={activeSession.expiresAt}
        fontSize={activeSession.fontSize}
        onTimeExpired={() => handleSubmit("TIME_EXPIRED")}
        onSubmit={() => setIsSubmitDialogOpen(true)}
        onFontSizeChange={(fontSize) =>
          setFontSize(loadedTest.metadata.id, "listening", fontSize)
        }
      />
      <div
        className={`${styles.workspace} ${styles[`font-${activeSession.fontSize}`]}`}
      >
        <div className={styles.sectionBar}>
          {loadedTest.listening.parts.map((item, index) => (
            <button
              className={index === activePartIndex ? styles.activeSection : ""}
              key={item.id}
              type="button"
              onClick={() =>
                setCurrentQuestion(
                  loadedTest.metadata.id,
                  "listening",
                  getQuestionId(partQuestionRanges[index].start),
                )
              }
            >
              Section {index + 1}
            </button>
          ))}
        </div>
        <section className={styles.audioPanel}>
          <div>
            <h2>{part.title}</h2>
            <p>Use the audio once in exam mode. Volume can be adjusted.</p>
          </div>
          <RestrictedAudioPlayer
            partId={part.id}
            playbackState={activeSession.listeningPlayback}
            src={audioAsset?.path}
            onStarted={() =>
              markListeningPlaybackStarted(loadedTest.metadata.id, part.id)
            }
            onCompleted={() =>
              markListeningPlaybackCompleted(loadedTest.metadata.id, part.id)
            }
          />
        </section>
        <section className={styles.questionSheet}>
          {renderCurrentSection()}
        </section>
      </div>
      <QuestionNavigator
        module="listening"
        questions={loadedTest.listening.questions}
        session={activeSession}
        onSelect={handleSelectQuestion}
      />
      {isSubmitDialogOpen ? (
        <SubmitConfirmationDialog
          moduleLabel="Listening"
          onCancel={() => setIsSubmitDialogOpen(false)}
          onConfirm={() => handleSubmit("SUBMITTED")}
        />
      ) : null}
    </main>
  );
}
