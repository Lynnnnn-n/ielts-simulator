import { useEffect, useRef, useState } from "react";
import type {
  ReadingPassage,
  TextHighlight,
  TextNote,
} from "../../domain/examTypes";
import { blockHighlights, rangesOverlap } from "../../domain/highlights";
import styles from "./HighlightablePassage.module.css";

interface SelectionRange {
  passageId: string;
  blockId: string;
  startOffset: number;
  endOffset: number;
}

interface ContextMenuState {
  x: number;
  y: number;
  range?: SelectionRange;
  highlightId?: string;
  noteId?: string;
}

interface NoteEditorState {
  x: number;
  y: number;
  range?: SelectionRange;
  noteId?: string;
  text: string;
}

interface HighlightablePassageProps {
  passage: ReadingPassage;
  highlights: TextHighlight[];
  notes: TextNote[];
  onAddHighlight: (highlight: Omit<TextHighlight, "id">) => void;
  onRemoveHighlight: (highlightId: string) => void;
  onRemoveHighlightsInRange: (range: Omit<TextHighlight, "id">) => void;
  onAddNote: (note: Omit<TextNote, "id">) => void;
  onUpdateNote: (noteId: string, text: string) => void;
  onRemoveNote: (noteId: string) => void;
  onRemoveNotesInRange: (range: Omit<TextHighlight, "id">) => void;
  onClearAll: () => void;
}

function getBlockElement(node: Node | null): HTMLElement | null {
  const element =
    node instanceof HTMLElement ? node : node?.parentElement ?? null;
  return element?.closest<HTMLElement>("[data-highlight-block-id]") ?? null;
}

function getOffsetInBlock(
  blockElement: HTMLElement,
  node: Node,
  offset: number,
): number | null {
  try {
    const range = document.createRange();
    range.selectNodeContents(blockElement);
    range.setEnd(node, offset);
    return range.toString().length;
  } catch {
    return null;
  }
}

function getSelectionRange(): SelectionRange | null {
  const selection = window.getSelection();
  if (
    !selection ||
    selection.rangeCount === 0 ||
    selection.toString().trim() === ""
  ) {
    return null;
  }

  const range = selection.getRangeAt(0);
  const startBlock = getBlockElement(range.startContainer);
  const endBlock = getBlockElement(range.endContainer);

  if (!startBlock || !endBlock || startBlock !== endBlock) {
    return null;
  }

  const startOffset = getOffsetInBlock(
    startBlock,
    range.startContainer,
    range.startOffset,
  );
  const endOffset = getOffsetInBlock(
    startBlock,
    range.endContainer,
    range.endOffset,
  );

  if (startOffset === null || endOffset === null) {
    return null;
  }

  return {
    passageId: startBlock.dataset.passageId ?? "",
    blockId: startBlock.dataset.highlightBlockId ?? "",
    startOffset: Math.min(startOffset, endOffset),
    endOffset: Math.max(startOffset, endOffset),
  };
}

function rangeContains(
  start: number,
  end: number,
  mark: Pick<TextHighlight, "startOffset" | "endOffset">,
): boolean {
  return start >= mark.startOffset && end <= mark.endOffset;
}

function renderMarkedText(
  text: string,
  highlights: TextHighlight[],
  notes: TextNote[],
  onContextMark: (
    event: React.MouseEvent,
    mark: { highlightId?: string; noteId?: string },
  ) => void,
  onOpenNote: (event: React.MouseEvent, noteId: string) => void,
) {
  const cutPoints = new Set<number>([0, text.length]);

  for (const mark of [...highlights, ...notes]) {
    cutPoints.add(Math.max(0, Math.min(mark.startOffset, text.length)));
    cutPoints.add(Math.max(0, Math.min(mark.endOffset, text.length)));
  }

  const sortedCuts = [...cutPoints].sort((a, b) => a - b);

  return sortedCuts.slice(0, -1).map((start, index) => {
    const end = sortedCuts[index + 1];
    const value = text.slice(start, end);
    const activeHighlight = highlights.find((highlight) =>
      rangeContains(start, end, highlight),
    );
    const activeNote = notes.find((note) => rangeContains(start, end, note));

    if (!activeHighlight && !activeNote) {
      return value;
    }

    const className = [
      activeHighlight ? styles.highlight : "",
      activeNote ? styles.noteRange : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <span
        className={className}
        data-highlight-id={activeHighlight?.id}
        data-note-id={activeNote?.id}
        key={`${start}:${end}`}
        onContextMenu={(event) =>
          onContextMark(event, {
            highlightId: activeHighlight?.id,
            noteId: activeNote?.id,
          })
        }
      >
        {value}
        {activeNote && end === activeNote.endOffset ? (
          <button
            aria-label="Open note"
            className={styles.noteMarker}
            type="button"
            onClick={(event) => onOpenNote(event, activeNote.id)}
          >
            Note
          </button>
        ) : null}
      </span>
    );
  });
}

export function HighlightablePassage({
  passage,
  highlights,
  notes,
  onAddHighlight,
  onRemoveHighlight,
  onRemoveHighlightsInRange,
  onAddNote,
  onUpdateNote,
  onRemoveNote,
  onRemoveNotesInRange,
  onClearAll,
}: HighlightablePassageProps) {
  const [menu, setMenu] = useState<ContextMenuState | null>(null);
  const [noteEditor, setNoteEditor] = useState<NoteEditorState | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const noteEditorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menu && !noteEditor) {
      return;
    }

    function closeFloatingControls(event: PointerEvent) {
      const target = event.target as Node | null;

      if (
        target &&
        (menuRef.current?.contains(target) ||
          noteEditorRef.current?.contains(target))
      ) {
        return;
      }

      setMenu(null);
      window.getSelection()?.removeAllRanges();
    }

    document.addEventListener("pointerdown", closeFloatingControls);
    return () => {
      document.removeEventListener("pointerdown", closeFloatingControls);
    };
  }, [menu, noteEditor]);

  function openSelectionMenu(event: React.MouseEvent) {
    const range = getSelectionRange();
    if (
      !range ||
      range.passageId !== passage.id ||
      range.startOffset === range.endOffset
    ) {
      return;
    }

    setMenu({
      x: event.clientX,
      y: event.clientY,
      range,
    });
  }

  function handleContextMenu(event: React.MouseEvent) {
    const target = event.target as HTMLElement;
    const markElement = target.closest<HTMLElement>(
      "[data-highlight-id], [data-note-id]",
    );
    const highlightId = markElement?.dataset.highlightId;
    const noteId = markElement?.dataset.noteId;

    if (highlightId || noteId) {
      event.preventDefault();
      setMenu({
        x: event.clientX,
        y: event.clientY,
        highlightId,
        noteId,
      });
      return;
    }

    const range = getSelectionRange();
    if (range && range.passageId === passage.id) {
      event.preventDefault();
      setMenu({
        x: event.clientX,
        y: event.clientY,
        range,
      });
    }
  }

  function addHighlight() {
    if (menu?.range) {
      onAddHighlight(menu.range);
      window.getSelection()?.removeAllRanges();
    }

    setMenu(null);
  }

  function openNoteEditor() {
    if (menu?.range) {
      setNoteEditor({
        x: menu.x,
        y: menu.y,
        range: menu.range,
        text: "",
      });
    }

    if (menu?.noteId) {
      const note = notes.find((item) => item.id === menu.noteId);
      if (note) {
        setNoteEditor({
          x: menu.x,
          y: menu.y,
          noteId: note.id,
          text: note.text,
        });
      }
    }

    setMenu(null);
  }

  function openExistingNote(event: React.MouseEvent, noteId: string) {
    const note = notes.find((item) => item.id === noteId);
    if (!note) {
      return;
    }

    setNoteEditor({
      x: event.clientX,
      y: event.clientY,
      noteId,
      text: note.text,
    });
  }

  function saveNote() {
    if (!noteEditor) {
      return;
    }

    const text = noteEditor.text.trim();

    if (noteEditor.noteId) {
      if (text) {
        onUpdateNote(noteEditor.noteId, text);
      } else {
        onRemoveNote(noteEditor.noteId);
      }
    }

    if (noteEditor.range && text) {
      onAddNote({ ...noteEditor.range, text });
      window.getSelection()?.removeAllRanges();
    }

    setNoteEditor(null);
  }

  function clearCurrent() {
    if (menu?.highlightId) {
      onRemoveHighlight(menu.highlightId);
    }

    if (menu?.noteId) {
      onRemoveNote(menu.noteId);
    }

    if (menu?.range) {
      onRemoveHighlightsInRange(menu.range);
      onRemoveNotesInRange(menu.range);
      window.getSelection()?.removeAllRanges();
    }

    setMenu(null);
  }

  const rangeHasMarks =
    menu?.range &&
    (highlights.some(
      (highlight) =>
        highlight.passageId === menu.range?.passageId &&
        highlight.blockId === menu.range.blockId &&
        rangesOverlap(highlight, menu.range),
    ) ||
      notes.some(
        (note) =>
          note.passageId === menu.range?.passageId &&
          note.blockId === menu.range.blockId &&
          rangesOverlap(note, menu.range),
      ));

  return (
    <article
      className={styles.passage}
      onContextMenu={handleContextMenu}
      onMouseUp={openSelectionMenu}
    >
      <h2>{passage.title}</h2>
      {passage.subtitle ? <h3>{passage.subtitle}</h3> : null}
      {passage.body.map((paragraph, index) => {
        const blockId = `${passage.id}:p:${index}`;
        return (
          <p
            data-highlight-block-id={blockId}
            data-passage-id={passage.id}
            key={blockId}
          >
            {renderMarkedText(
              paragraph,
              blockHighlights(highlights, passage.id, blockId),
              notes.filter(
                (note) =>
                  note.passageId === passage.id && note.blockId === blockId,
              ),
              (event, mark) => {
                event.preventDefault();
                setMenu({
                  x: event.clientX,
                  y: event.clientY,
                  highlightId: mark.highlightId,
                  noteId: mark.noteId,
                });
              },
              openExistingNote,
            )}
          </p>
        );
      })}
      {menu ? (
        <div
          className={styles.contextMenu}
          ref={menuRef}
          style={{ left: menu.x, top: menu.y }}
          role="menu"
        >
          {menu.range ? (
            <>
              <button type="button" onClick={addHighlight}>
                Highlight
              </button>
              <button type="button" onClick={openNoteEditor}>
                Note
              </button>
            </>
          ) : null}
          {menu.noteId ? (
            <button type="button" onClick={openNoteEditor}>
              Note
            </button>
          ) : null}
          {menu.highlightId || menu.noteId || rangeHasMarks ? (
            <button type="button" onClick={clearCurrent}>
              Clear
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              onClearAll();
              setMenu(null);
            }}
          >
            Clear all
          </button>
        </div>
      ) : null}
      {noteEditor ? (
        <div
          className={styles.noteEditor}
          ref={noteEditorRef}
          style={{ left: noteEditor.x, top: noteEditor.y }}
        >
          <textarea
            aria-label="Note"
            value={noteEditor.text}
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            onChange={(event) =>
              setNoteEditor({ ...noteEditor, text: event.target.value })
            }
          />
          <div className={styles.noteActions}>
            <button type="button" onClick={() => setNoteEditor(null)}>
              Cancel
            </button>
            <button type="button" onClick={saveNote}>
              Save
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
