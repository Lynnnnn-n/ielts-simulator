import type { ObjectiveModule } from "./examTypes";

export interface BandScalePoint {
  minCorrect: number;
  band: number;
}

export type BandScale = BandScalePoint[];

const listeningScale: BandScale = [
  { minCorrect: 39, band: 9 },
  { minCorrect: 37, band: 8.5 },
  { minCorrect: 35, band: 8 },
  { minCorrect: 32, band: 7.5 },
  { minCorrect: 30, band: 7 },
  { minCorrect: 26, band: 6.5 },
  { minCorrect: 23, band: 6 },
  { minCorrect: 18, band: 5.5 },
  { minCorrect: 16, band: 5 },
  { minCorrect: 13, band: 4.5 },
  { minCorrect: 10, band: 4 },
  { minCorrect: 0, band: 0 },
];

const academicReadingScale: BandScale = [
  { minCorrect: 39, band: 9 },
  { minCorrect: 37, band: 8.5 },
  { minCorrect: 35, band: 8 },
  { minCorrect: 33, band: 7.5 },
  { minCorrect: 30, band: 7 },
  { minCorrect: 27, band: 6.5 },
  { minCorrect: 23, band: 6 },
  { minCorrect: 19, band: 5.5 },
  { minCorrect: 15, band: 5 },
  { minCorrect: 13, band: 4.5 },
  { minCorrect: 10, band: 4 },
  { minCorrect: 0, band: 0 },
];

export function convertRawScoreToBand(
  module: ObjectiveModule,
  correctCount: number,
): number | null {
  const scale = module === "listening" ? listeningScale : academicReadingScale;
  return scale.find((point) => correctCount >= point.minCorrect)?.band ?? null;
}
