export type ExamModule = "listening" | "reading" | "writing";

export type ObjectiveModule = "listening" | "reading";

export type ExamStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "TIME_EXPIRED"
  | "REVIEW";

export type QuestionType =
  | "text"
  | "single-choice"
  | "true-false-not-given"
  | "yes-no-not-given"
  | "matching"
  | "table-completion"
  | "note-completion"
  | "sentence-completion"
  | "short-answer";

export interface MaterialStatus {
  available: boolean;
  notes: string[];
  missing: string[];
}

export interface MockTestMetadata {
  id: string;
  slug: string;
  title: string;
  testType: "academic" | "general-training" | "Academic" | "General Training";
  description?: string;
  status: "draft" | "published" | "archived";
  modules: {
    listening: boolean;
    reading: boolean;
    writing: boolean;
  };
  version: number;
  createdAt: string;
  updatedAt: string;
  sourceNotes: string[];
}

export interface AnswerConstraints {
  wordLimit?: number;
  numberLimit?: number;
  instructionText?: string;
}

export interface ChoiceOption {
  id: string;
  label: string;
  text: string;
}

export interface BaseQuestion {
  id: string;
  number: number;
  type: QuestionType;
  prompt: string;
  instruction?: string;
  constraints?: AnswerConstraints;
  imageAssetIds?: string[];
}

export interface TextQuestion extends BaseQuestion {
  type:
    | "text"
    | "matching"
    | "table-completion"
    | "note-completion"
    | "sentence-completion"
    | "short-answer";
}

export interface ChoiceQuestion extends BaseQuestion {
  type: "single-choice" | "true-false-not-given" | "yes-no-not-given";
  options: ChoiceOption[];
}

export type Question = TextQuestion | ChoiceQuestion;

export interface AnswerKeyEntry {
  questionId: string;
  number: number;
  acceptedAnswers: string[];
  displayAnswer: string;
}

export interface QuestionGroup {
  id: string;
  title?: string;
  instruction?: string;
  questionIds: string[];
  sharedOptionIds?: string[];
  sharedAssetIds?: string[];
}

export interface ReadingPassage {
  id: string;
  title: string;
  subtitle?: string;
  body: string[];
  contentBlocks?: ContentBlock[];
  questionIds: string[];
  imageAssetIds?: string[];
}

export interface ReadingModule {
  durationSeconds: number;
  passages: ReadingPassage[];
  questionGroups?: QuestionGroup[];
  questions: Question[];
  answerKey: AnswerKeyEntry[];
}

export interface ListeningPart {
  id: string;
  title: string;
  instruction?: string;
  audioAssetId?: string;
  imageAssetIds?: string[];
  questionIds: string[];
}

export interface ListeningModule {
  durationSeconds: number;
  parts: ListeningPart[];
  questionGroups?: QuestionGroup[];
  questions: Question[];
  answerKey: AnswerKeyEntry[];
}

export interface DataTable {
  caption?: string;
  columns: string[];
  rows: string[][];
}

export interface TextBlock {
  id: string;
  type: "text";
  content: string;
}

export interface ImageBlock {
  id: string;
  type: "image";
  assetId: string;
  alt?: string;
  caption?: string;
}

export interface TableBlock {
  id: string;
  type: "table";
  rows: string[][];
  caption?: string;
}

export type ContentBlock = TextBlock | ImageBlock | TableBlock;

export interface WritingTask {
  id: "task1" | "task2";
  title: string;
  prompt: string;
  imageAssetIds?: string[];
  table?: DataTable;
  recommendedMinutes: number;
}

export interface WritingModule {
  durationSeconds: number;
  task1?: WritingTask;
  task2?: WritingTask;
}

export interface TestAsset {
  id: string;
  type: "audio" | "image" | "pdf" | "document";
  path: string;
  assetUrl?: string;
  fileName?: string;
  mimeType?: string;
  storageKey?: string;
  size?: number;
  description: string;
}

export interface ModuleMaterialStatus {
  listening: MaterialStatus;
  reading: MaterialStatus;
  writing: MaterialStatus;
}

export interface MockTest {
  metadata: MockTestMetadata;
  materials: ModuleMaterialStatus;
  assets: TestAsset[];
  listening: ListeningModule;
  reading: ReadingModule;
  writing: WritingModule;
}

export type AnswerValue = string;

export interface ObjectiveResultItem {
  questionId: string;
  number: number;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  status: "correct" | "incorrect" | "unanswered";
}

export interface ObjectiveResult {
  module: ObjectiveModule;
  correctCount: number;
  totalQuestions: number;
  bandScore: number | null;
  items: ObjectiveResultItem[];
}

export interface WritingResult {
  task1WordCount: number;
  task2WordCount: number;
  submittedAt: number;
}

export interface TextHighlight {
  id: string;
  passageId: string;
  blockId: string;
  startOffset: number;
  endOffset: number;
}

export interface TextNote {
  id: string;
  passageId: string;
  blockId: string;
  startOffset: number;
  endOffset: number;
  text: string;
}

export interface ListeningPlaybackState {
  started: boolean;
  startedAt?: number;
  completed: boolean;
  activePartId?: string;
  completedPartIds: string[];
}

export type ExamFontSize = "standard" | "large" | "extra-large";

export interface ExamSession {
  testId: string;
  module: ExamModule;
  status: ExamStatus;
  startedAt?: number;
  expiresAt?: number;
  submittedAt?: number;
  currentQuestionId?: string;
  answers: Record<string, AnswerValue>;
  flaggedQuestionIds: string[];
  highlights: TextHighlight[];
  notes: TextNote[];
  fontSize: ExamFontSize;
  listeningPlayback: ListeningPlaybackState;
  writing: {
    task1: string;
    task2: string;
  };
  objectiveResult?: ObjectiveResult;
  writingResult?: WritingResult;
}
