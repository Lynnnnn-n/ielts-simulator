import type { ExamModule, ExamSession, Question } from "../../domain/examTypes";
import styles from "./QuestionNavigator.module.css";

interface QuestionNavigatorProps {
  module: ExamModule;
  questions: Question[];
  session: ExamSession;
  onSelect: (questionId: string) => void;
}

export function QuestionNavigator({
  module,
  questions,
  session,
  onSelect,
}: QuestionNavigatorProps) {
  if (module === "writing") {
    return null;
  }

  return (
    <nav className={styles.navigator} aria-label="Question navigator">
      <div className={styles.label}>Questions</div>
      <div className={styles.grid}>
        {questions.map((question) => {
          const answered = Boolean(session.answers[question.id]?.trim());
          const flagged = session.flaggedQuestionIds.includes(question.id);
          const current = session.currentQuestionId === question.id;
          const className = [
            styles.item,
            answered ? styles.answered : "",
            flagged ? styles.flagged : "",
            current ? styles.current : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              className={className}
              key={question.id}
              type="button"
              onClick={() => onSelect(question.id)}
              aria-label={`Question ${question.number}`}
            >
              {question.number}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
