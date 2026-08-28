import type { Question } from "../../domain/examTypes";
import { AssetImage } from "../exam/AssetImage";
import styles from "./QuestionRenderer.module.css";

interface QuestionRendererProps {
  question: Question;
  value: string;
  isFlagged: boolean;
  onChange: (value: string) => void;
  onFlag: () => void;
  isReviewMode?: boolean;
  assets?: import("../../domain/examTypes").TestAsset[];
  reviewAnswer?: {
    correctAnswer: string;
    status: "correct" | "incorrect" | "unanswered";
  };
}

export function QuestionRenderer({
  question,
  value,
  isFlagged,
  onChange,
  onFlag,
  isReviewMode = false,
  assets = [],
  reviewAnswer,
}: QuestionRendererProps) {
  const imageAssets =
    question.imageAssetIds
      ?.map((assetId) => assets.find((asset) => asset.id === assetId))
      .filter((asset): asset is NonNullable<typeof asset> => Boolean(asset)) ??
    [];

  return (
    <article className={styles.question} id={question.id}>
      <div className={styles.topLine}>
        <div className={styles.number}>{question.number}</div>
        <button
          className={styles.flagButton}
          disabled={isReviewMode}
          type="button"
          onClick={onFlag}
        >
          {isFlagged ? "Reviewed" : "Review"}
        </button>
      </div>
      {question.instruction ? (
        <p className={styles.instruction}>{question.instruction}</p>
      ) : null}
      <p className={styles.prompt}>{question.prompt}</p>
      {imageAssets.map((asset) => (
        <AssetImage asset={asset} key={asset.id} />
      ))}
      {"options" in question && Array.isArray(question.options) ? (
        <div className={styles.options}>
          {question.options.map((option) => (
            <label className={styles.option} key={option.id}>
              <input
                checked={value === option.id}
                disabled={isReviewMode}
                name={question.id}
                type="radio"
                value={option.id}
                onChange={() => onChange(option.id)}
              />
              <span>{option.label}</span>
              {option.text !== option.label ? <span>{option.text}</span> : null}
            </label>
          ))}
        </div>
      ) : (
        <input
          className={styles.textInput}
          value={value}
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          aria-label={`Answer for question ${question.number}`}
          readOnly={isReviewMode}
          spellCheck={false}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {reviewAnswer ? (
        <div className={`${styles.review} ${styles[reviewAnswer.status]}`}>
          <span>{reviewAnswer.status}</span>
          <span>Correct answer: {reviewAnswer.correctAnswer}</span>
        </div>
      ) : null}
    </article>
  );
}
