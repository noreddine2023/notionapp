import React, { useCallback, KeyboardEvent, useRef } from 'react';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import type { Block as BlockType } from '../types/blocks';
import { BlockContent } from './BlockContent';
import { useEditorStore } from '../store/editorStore';

interface BlockProps {
  block: BlockType;
  isActive: boolean;
  isDragging?: boolean;
  onFocus: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
  listIndex?: number; // For numbered lists
}

export const Block: React.FC<BlockProps> = ({
  block,
  isActive,
  isDragging = false,
  onFocus,
  dragHandleProps,
  listIndex,
}) => {
  const blockRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  
  const {
    updateBlock,
    addBlock,
    deleteBlock,
    setActiveBlock,
    getPreviousBlockId,
    getNextBlockId,
    openSlashMenu,
    closeSlashMenu,
    isSlashMenuOpen,
  } = useEditorStore();

  // Handle content update
  const handleUpdate = useCallback((content: string) => {
    updateBlock(block.id, { content });
  }, [block.id, updateBlock]);

  // Handle content and props update (for image blocks etc.)
  const handleUpdateWithProps = useCallback((content: string, props?: typeof block.props) => {
    updateBlock(block.id, { content, props });
  }, [block.id, updateBlock]);

  // Handle todo toggle
  const handleToggleTodo = useCallback(() => {
    updateBlock(block.id, {
      props: {
        ...block.props,
        checked: !block.props?.checked,
      },
    });
  }, [block.id, block.props, updateBlock]);

  // Focus a specific block at a given position
  const focusBlockAt = useCallback((blockId: string, position: 'start' | 'end' = 'end') => {
    setActiveBlock(blockId);
    // The actual focus will be handled by the block component via useEffect
    setTimeout(() => {
      const targetBlock = document.querySelector(`[data-block-id="${blockId}"] [contenteditable]`) as HTMLElement;
      if (targetBlock) {
        targetBlock.focus();
        const range = document.createRange();
        const sel = window.getSelection();
        if (position === 'end' && targetBlock.textContent) {
          range.selectNodeContents(targetBlock);
          range.collapse(false);
        } else {
          range.selectNodeContents(targetBlock);
          range.collapse(true);
        }
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }, 0);
  }, [setActiveBlock]);

  // Handle keyboard events
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const content = target.textContent || '';
    const selection = window.getSelection();
    const cursorAtStart = selection?.anchorOffset === 0;
    const cursorAtEnd = selection?.anchorOffset === content.length;

    // Handle slash menu trigger
    if (e.key === '/' && (content === '' || cursorAtStart)) {
      e.preventDefault();
      // Get position for the menu
      const rect = target.getBoundingClientRect();
      openSlashMenu({ x: rect.left, y: rect.bottom + 4 });
      return;
    }

    // Close slash menu on Escape
    if (e.key === 'Escape' && isSlashMenuOpen) {
      closeSlashMenu();
      return;
    }

    // Handle Enter key - create new block
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      // If slash menu is open, don't create new block (let the menu handle it)
      if (isSlashMenuOpen) {
        return;
      }
      
      // If cursor is in middle, split the content
      if (!cursorAtEnd && !cursorAtStart) {
        const beforeCursor = content.slice(0, selection?.anchorOffset);
        const afterCursor = content.slice(selection?.anchorOffset);
        
        updateBlock(block.id, { content: beforeCursor });
        const newBlockId = addBlock(block.id, 'text');
        
        // Update the new block with the remaining content
        setTimeout(() => {
          updateBlock(newBlockId, { content: afterCursor });
          focusBlockAt(newBlockId, 'start');
        }, 0);
      } else {
        // Create new block after current
        const newBlockId = addBlock(block.id, 'text');
        focusBlockAt(newBlockId, 'start');
      }
      return;
    }

    // Handle Backspace key
    if (e.key === 'Backspace') {
      // If block is empty and cursor is at start
      if (content === '' || (cursorAtStart && content.length === 0)) {
        const prevBlockId = getPreviousBlockId(block.id);
        if (prevBlockId) {
          e.preventDefault();
          deleteBlock(block.id);
          focusBlockAt(prevBlockId, 'end');
        }
        return;
      }
      
      // If cursor is at start but there's content, merge with previous block
      if (cursorAtStart && content.length > 0) {
        const prevBlockId = getPreviousBlockId(block.id);
        if (prevBlockId) {
          e.preventDefault();
          // Get previous block's content and append current
          const prevBlock = document.querySelector(`[data-block-id="${prevBlockId}"] [contenteditable]`) as HTMLElement;
          if (prevBlock) {
            const prevContent = prevBlock.textContent || '';
            const mergedContent = prevContent + content;
            updateBlock(prevBlockId, { content: mergedContent });
            deleteBlock(block.id);
            
            // Focus at the merge point
            setTimeout(() => {
              const targetBlock = document.querySelector(`[data-block-id="${prevBlockId}"] [contenteditable]`) as HTMLElement;
              if (targetBlock) {
                targetBlock.focus();
                const range = document.createRange();
                const sel = window.getSelection();
                // Position cursor at the end of the previous content
                if (targetBlock.firstChild) {
                  range.setStart(targetBlock.firstChild, prevContent.length);
                  range.collapse(true);
                } else {
                  range.selectNodeContents(targetBlock);
                  range.collapse(false);
                }
                sel?.removeAllRanges();
                sel?.addRange(range);
              }
            }, 0);
          }
        }
        return;
      }
    }

    // Handle ArrowUp key - focus previous block
    if (e.key === 'ArrowUp' && cursorAtStart) {
      const prevBlockId = getPreviousBlockId(block.id);
      if (prevBlockId) {
        e.preventDefault();
        focusBlockAt(prevBlockId, 'end');
      }
      return;
    }

    // Handle ArrowDown key - focus next block
    if (e.key === 'ArrowDown' && cursorAtEnd) {
      const nextBlockId = getNextBlockId(block.id);
      if (nextBlockId) {
        e.preventDefault();
        focusBlockAt(nextBlockId, 'start');
      }
      return;
    }
  }, [
    block.id,
    isSlashMenuOpen,
    openSlashMenu,
    closeSlashMenu,
    updateBlock,
    addBlock,
    deleteBlock,
    getPreviousBlockId,
    getNextBlockId,
    focusBlockAt,
  ]);

  // Handle add button click
  const handleAddBlock = useCallback(() => {
    const newBlockId = addBlock(block.id, 'text');
    focusBlockAt(newBlockId, 'start');
  }, [block.id, addBlock, focusBlockAt]);

  // Handle delete button click
  const handleDeleteBlock = useCallback(() => {
    const prevBlockId = getPreviousBlockId(block.id);
    const nextBlockId = getNextBlockId(block.id);
    deleteBlock(block.id);
    // Focus previous or next block after deletion
    if (prevBlockId) {
      focusBlockAt(prevBlockId, 'end');
    } else if (nextBlockId) {
      focusBlockAt(nextBlockId, 'start');
    }
  }, [block.id, deleteBlock, getPreviousBlockId, getNextBlockId, focusBlockAt]);

  const registerRef = useCallback((el: HTMLDivElement | null) => {
    contentRef.current = el;
  }, []);

  return (
    <div
      ref={blockRef}
      data-block-id={block.id}
      className={`relative group py-1 px-2 -mx-2 rounded-md transition-colors duration-150 ${
        isActive ? 'bg-blue-50/50' : 'hover:bg-gray-50'
      } ${isDragging ? 'opacity-50' : ''}`}
    >
      {/* Block controls - shown on hover */}
      <div className="absolute left-0 -translate-x-full opacity-0 group-hover:opacity-100 flex items-center gap-0.5 pr-2 transition-opacity duration-150">
        {/* Add button */}
        <button
          onClick={handleAddBlock}
          className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
          tabIndex={-1}
          title="Add block below"
        >
          <Plus className="w-4 h-4" />
        </button>
        
        {/* Drag handle */}
        <button
          {...dragHandleProps}
          className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing transition-colors"
          tabIndex={-1}
          title="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Delete button */}
        <button
          onClick={handleDeleteBlock}
          className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
          tabIndex={-1}
          title="Delete block"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Block content */}
      <BlockContent
        block={block}
        isActive={isActive}
        onUpdate={handleUpdate}
        onUpdateWithProps={handleUpdateWithProps}
        onToggleTodo={handleToggleTodo}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        registerRef={registerRef}
        listIndex={listIndex}
      />
    </div>
  );
};
