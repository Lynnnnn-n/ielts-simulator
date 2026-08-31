import type {
  AnswerKeyEntry,
  ListeningPart,
  MockTest,
  Question,
  ReadingPassage,
  TestAsset,
  WritingTask,
} from "../../domain/examTypes";

export type AnswerSpec = [number, string[]] | [number, string[], string];

interface ImportedMockTestConfig {
  testNumber: 2 | 3 | 4;
  title: string;
  pageRange: {
    start: number;
    end: number;
  };
  listeningPageGroups: number[][];
  readingPageGroups: number[][];
  writingPages: {
    task1: number[];
    task2: number[];
  };
  listeningAnswers: AnswerSpec[];
  readingAnswers: AnswerSpec[];
  sourceNotes?: string[];
}

function answerKey(prefix: string, spec: AnswerSpec): AnswerKeyEntry {
  const [number, acceptedAnswers, displayAnswer] = spec;

  return {
    questionId: `${prefix}q${number}`,
    number,
    acceptedAnswers,
    displayAnswer: displayAnswer ?? acceptedAnswers.join(" / "),
  };
}

function makeQuestions(prefix: string): Question[] {
  return Array.from({ length: 40 }, (_, index) => {
    const number = index + 1;

    return {
      id: `${prefix}q${number}`,
      number,
      type: "text" as const,
      prompt: `Question ${number} - refer to the source page images.`,
    };
  });
}

function pageAsset(testNumber: number, page: number): TestAsset {
  return {
    id: `test${testNumber}-page-${page}`,
    type: "image",
    path: `/assets/mock-test-${String(testNumber).padStart(2, "0")}/pages/page-${String(
      page,
    ).padStart(3, "0")}.png`,
    description: `Cambridge IELTS 4 Test ${testNumber} source page ${page}`,
  };
}

function audioAsset(testNumber: number, section: number): TestAsset {
  return {
    id: `test${testNumber}-section-${section}-audio`,
    type: "audio",
    path: `/assets/mock-test-${String(testNumber).padStart(
      2,
      "0",
    )}/audio/test${testNumber}_section${section}.mp3`,
    description: `Listening Test ${testNumber} Section ${section} audio`,
  };
}

function makeListeningParts(config: ImportedMockTestConfig): ListeningPart[] {
  return config.listeningPageGroups.map((pages, index) => {
    const start = index * 10 + 1;
    const end = start + 9;

    return {
      id: `listening-part-${index + 1}`,
      title: `SECTION ${index + 1} Questions ${start}-${end}`,
      instruction: "Use the source page image for the original IELTS question text.",
      audioAssetId: `test${config.testNumber}-section-${index + 1}-audio`,
      imageAssetIds: pages.map((page) => `test${config.testNumber}-page-${page}`),
      questionIds: Array.from({ length: 10 }, (_, questionIndex) => {
        return `lq${start + questionIndex}`;
      }),
    };
  });
}

function makeReadingPassages(config: ImportedMockTestConfig): ReadingPassage[] {
  return config.readingPageGroups.map((pages, index) => {
    const ranges = [
      [1, 13],
      [14, 26],
      [27, 40],
    ];
    const [start, end] = ranges[index] ?? [1, 40];

    return {
      id: `reading-passage-${index + 1}`,
      title: `READING PASSAGE ${index + 1}`,
      subtitle: `Questions ${start}-${end}`,
      body: [
        "The original IELTS reading passage and question pages are displayed below as source images.",
      ],
      imageAssetIds: pages.map((page) => `test${config.testNumber}-page-${page}`),
      questionIds: Array.from({ length: end - start + 1 }, (_, questionIndex) => {
        return `rq${start + questionIndex}`;
      }),
    };
  });
}

function makeWritingTask(
  taskId: "task1" | "task2",
  config: ImportedMockTestConfig,
): WritingTask {
  return {
    id: taskId,
    title: taskId === "task1" ? "WRITING TASK 1" : "WRITING TASK 2",
    prompt:
      "Refer to the source page image for the original IELTS writing task prompt.",
    imageAssetIds: config.writingPages[taskId].map(
      (page) => `test${config.testNumber}-page-${page}`,
    ),
    recommendedMinutes: taskId === "task1" ? 20 : 40,
  };
}

export function makeImportedMockTest(config: ImportedMockTestConfig): MockTest {
  const pages = Array.from(
    { length: config.pageRange.end - config.pageRange.start + 1 },
    (_, index) => config.pageRange.start + index,
  );
  const assets = [
    ...pages.map((page) => pageAsset(config.testNumber, page)),
    ...[1, 2, 3, 4].map((section) => audioAsset(config.testNumber, section)),
  ];
  const testId = `mock-test-${String(config.testNumber).padStart(2, "0")}`;

  return {
    metadata: {
      id: testId,
      slug: `cambridge-ielts-4-test-${config.testNumber}`,
      title: config.title,
      testType: "academic",
      description: `Academic IELTS computer-delivered mock test using Cambridge IELTS 4 Test ${config.testNumber} material.`,
      status: "published",
      modules: {
        listening: true,
        reading: true,
        writing: true,
      },
      version: 1,
      createdAt: "2026-08-31T00:00:00.000Z",
      updatedAt: "2026-08-31T00:00:00.000Z",
      sourceNotes: [
        "Source: Cambridge IELTS 4 PDF supplied by the user.",
        "This V2 seed keeps original pages as image assets and uses answer keys for deterministic local grading.",
        "Listening audio is linked by supplied file name only; the audio contents were not parsed.",
        ...(config.sourceNotes ?? []),
      ],
    },
    materials: {
      listening: {
        available: true,
        notes: [
          "Listening questions are shown through source page images.",
          "Audio files are linked by section file name.",
        ],
        missing: [],
      },
      reading: {
        available: true,
        notes: [
          "Reading passages and questions are shown through source page images.",
          "Question inputs and answer keys are structured for grading.",
        ],
        missing: [],
      },
      writing: {
        available: true,
        notes: ["Writing prompts and visuals are shown through source page images."],
        missing: [],
      },
    },
    assets,
    listening: {
      durationSeconds: 40 * 60,
      parts: makeListeningParts(config),
      questions: makeQuestions("l"),
      answerKey: config.listeningAnswers.map((spec) => answerKey("l", spec)),
    },
    reading: {
      durationSeconds: 60 * 60,
      passages: makeReadingPassages(config),
      questions: makeQuestions("r"),
      answerKey: config.readingAnswers.map((spec) => answerKey("r", spec)),
    },
    writing: {
      durationSeconds: 60 * 60,
      task1: makeWritingTask("task1", config),
      task2: makeWritingTask("task2", config),
    },
  };
}
