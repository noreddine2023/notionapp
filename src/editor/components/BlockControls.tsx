import React, { useCallback } from 'react';
import type { Editor } from '@tiptap/core';
import type { BlockHandleState } from '../core/block-handle';

interface BlockControlsProps {
  editor: Editor;
  state: BlockHandleState;
}

/**
 * Block controls component showing drag handle and plus button
 * Appears on the left side of blocks on hover
 */
export const BlockControls: React.FC<BlockControlsProps> = ({ editor, state }) => {
  // Handle plus button click - insert new paragraph after current block
  const handleAddBlock = useCallback(() => {
    if (!editor || state.nodePos === undefined) return;

    const node = editor.state.doc.nodeAt(state.nodePos);
    if (!node) return;

    // Insert a new paragraph after the current block
    const insertPos = state.nodePos + node.nodeSize;
    editor
      .chain()
      .focus()
      .insertContentAt(insertPos, { type: 'paragraph' })
      .setTextSelection(insertPos + 1)
      .run();
  }, [editor, state.nodePos]);

  // Handle drag start
  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      if (!editor || state.nodePos === undefined) return;

      const node = editor.state.doc.nodeAt(state.nodePos);
      if (!node) return;

      // Set drag data
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', '');
      e.dataTransfer.setData(
        'application/prosemirror-node',
        JSON.stringify({
          pos: state.nodePos,
          nodeSize: node.nodeSize,
        })
      );

      // Add dragging class
      document.body.classList.add('dragging-block');
    },
    [editor, state.nodePos]
  );

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    document.body.classList.remove('dragging-block');
  }, []);

  if (!state.visible) {
    return null;
  }

  return (
    <div
      className="block-controls visible"
      style={{
        top: state.position.top,
        left: state.position.left,
      }}
    >
      {/* Plus Button */}
      <button
        type="button"
        className="block-control-button add-block"
        onClick={handleAddBlock}
        title="Add block"
        aria-label="Add block"
      >
        +
      </button>

      {/* Drag Handle */}
      <button
        type="button"
        className="block-control-button drag-handle"
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        title="Drag to move"
        aria-label="Drag to move block"
      >
        ⋮⋮
      </button>

      <style>{blockControlsStyles}</style>
    </div>
  );
};

const blockControlsStyles = `
  .block-controls {
    position: absolute;
    display: flex;
    align-items: center;
    gap: 2px;
    z-index: 10;
    opacity: 0;
    transition: opacity 0.15s ease;
    pointer-events: none;
  }

  .block-controls.visible {
    opacity: 1;
    pointer-events: auto;
  }

  .block-control-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 0;
    border: none;
    border-radius: 4px;
    background: var(--editor-bg);
    color: var(--editor-text-muted);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .block-control-button:hover {
    background: var(--editor-code-bg);
    color: var(--editor-text);
  }

  .drag-handle {
    cursor: grab;
    font-size: 10px;
    letter-spacing: -2px;
  }

  .drag-handle:active {
    cursor: grabbing;
  }

  .add-block {
    font-size: 18px;
    font-weight: 300;
  }

  /* Dragging state */
  body.dragging-block {
    cursor: grabbing !important;
  }

  body.dragging-block * {
    cursor: grabbing !important;
  }

  body.dragging-block .tiptap-editor {
    user-select: none;
  }
`;
