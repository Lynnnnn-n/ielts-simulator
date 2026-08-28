import styles from "./SubmitConfirmationDialog.module.css";

interface SubmitConfirmationDialogProps {
  moduleLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function SubmitConfirmationDialog({
  moduleLabel,
  onCancel,
  onConfirm,
}: SubmitConfirmationDialogProps) {
  return (
    <div className={styles.backdrop} role="presentation">
      <section
        aria-labelledby="submit-confirmation-title"
        aria-modal="true"
        className={styles.dialog}
        role="dialog"
      >
        <h2 id="submit-confirmation-title">Submit {moduleLabel}</h2>
        <p>
          You will not be able to continue this module normally after
          submission.
        </p>
        <div className={styles.actions}>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button className={styles.confirmButton} type="button" onClick={onConfirm}>
            Submit
          </button>
        </div>
      </section>
    </div>
  );
}
