import type { MaterialStatus } from "../../domain/examTypes";
import styles from "./MaterialMissingPanel.module.css";

interface MaterialMissingPanelProps {
  title: string;
  status: MaterialStatus;
}

export function MaterialMissingPanel({
  title,
  status,
}: MaterialMissingPanelProps) {
  return (
    <section className={styles.panel}>
      <h2>{title}</h2>
      <p>
        Mock Test 01 is missing required original material for this module, so
        the simulator will not invent IELTS content.
      </p>
      {status.notes.length > 0 ? (
        <div className={styles.block}>
          <h3>Notes</h3>
          <ul>
            {status.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {status.missing.length > 0 ? (
        <div className={styles.block}>
          <h3>Missing</h3>
          <ul>
            {status.missing.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
