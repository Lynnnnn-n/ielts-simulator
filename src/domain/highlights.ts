import type { TextHighlight } from "./examTypes";

export function rangesOverlap(
  first: Pick<TextHighlight, "startOffset" | "endOffset">,
  second: Pick<TextHighlight, "startOffset" | "endOffset">,
): boolean {
  return first.startOffset < second.endOffset && second.startOffset < first.endOffset;
}

export function normalizeHighlights(highlights: TextHighlight[]): TextHighlight[] {
  const sorted = [...highlights].sort((first, second) => {
    if (first.passageId !== second.passageId) {
      return first.passageId.localeCompare(second.passageId);
    }

    if (first.blockId !== second.blockId) {
      return first.blockId.localeCompare(second.blockId);
    }

    return first.startOffset - second.startOffset;
  });

  return sorted.reduce<TextHighlight[]>((normalized, highlight) => {
    const previous = normalized.at(-1);

    if (
      previous &&
      previous.passageId === highlight.passageId &&
      previous.blockId === highlight.blockId &&
      previous.endOffset >= highlight.startOffset
    ) {
      previous.endOffset = Math.max(previous.endOffset, highlight.endOffset);
      return normalized;
    }

    normalized.push({ ...highlight });
    return normalized;
  }, []);
}

export function blockHighlights(
  highlights: TextHighlight[],
  passageId: string,
  blockId: string,
): TextHighlight[] {
  return normalizeHighlights(
    highlights.filter(
      (highlight) =>
        highlight.passageId === passageId && highlight.blockId === blockId,
    ),
  );
}
