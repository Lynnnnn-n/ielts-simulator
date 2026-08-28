export function countWords(text: string): number {
  const matches = text.trim().match(/\b[\w'-]+\b/g);
  return matches?.length ?? 0;
}
