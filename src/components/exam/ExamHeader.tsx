import type {
  ExamFontSize,
  ExamModule,
  MockTest,
} from "../../domain/examTypes";
import { CountdownTimer } from "./CountdownTimer";
import styles from "./ExamHeader.module.css";

interface ExamHeaderProps {
  test: MockTest;
  module: ExamModule;
  expiresAt?: number;
  fontSize: ExamFontSize;
  onTimeExpired: () => void;
  onSubmit: () => void;
  onFontSizeChange: (fontSize: ExamFontSize) => void;
}

const moduleLabels: Record<ExamModule, string> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
};

export function ExamHeader({
  test,
  module,
  expiresAt,
  fontSize,
  onTimeExpired,
  onSubmit,
  onFontSizeChange,
}: ExamHeaderProps) {
  return (
    <header className={styles.header}>
      <div>
        <div className={styles.brand}>IELTS</div>
        <div className={styles.context}>
          {test.metadata.title} | {moduleLabels[module]}
        </div>
      </div>
      <div className={styles.actions}>
        <label className={styles.fontControl}>
          <span>Font size</span>
          <select
            value={fontSize}
            onChange={(event) =>
              onFontSizeChange(event.target.value as ExamFontSize)
            }
          >
            <option value="standard">Standard</option>
            <option value="large">Large</option>
            <option value="extra-large">Extra large</option>
          </select>
        </label>
        <CountdownTimer expiresAt={expiresAt} onExpired={onTimeExpired} />
        <button className={styles.submitButton} type="button" onClick={onSubmit}>
          Submit
        </button>
      </div>
    </header>
  );
}
