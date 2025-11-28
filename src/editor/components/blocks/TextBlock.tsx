import React, { useRef, useEffect, KeyboardEvent, FormEvent } from 'react';
import type { Block } from '../../types/blocks';
import { getBlockPlaceholder } from '../../utils/blockUtils';

interface TextBlockProps {
  block: Block;
  isActive: boolean;
  onUpdate: (content: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void;
  onFocus: () => void;
  registerRef: (el: HTMLDivElement | null) => void;
}

export const TextBlock: React.FC<TextBlockProps> = ({
  block,
  isActive,
  onUpdate,
  onKeyDown,
  onFocus,
  registerRef,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);

  // Focus the element when isActive changes
  useEffect(() => {
    if (isActive && contentRef.current && document.activeElement !== contentRef.current) {
      contentRef.current.focus();
      // Move cursor to end
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(contentRef.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isActive]);

  // Sync content with block.content - use innerHTML to preserve formatting
  useEffect(() => {
    if (contentRef.current && !isInternalUpdate.current) {
      // Only update if content actually differs (to preserve cursor position)
      if (contentRef.current.innerHTML !== block.content) {
        contentRef.current.innerHTML = block.content;
      }
    }
    isInternalUpdate.current = false;
  }, [block.content]);

  const handleInput = (e: FormEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    isInternalUpdate.current = true;
    // Use innerHTML to preserve formatting like bold, italic, etc.
    onUpdate(target.innerHTML || '');
  };

  const handleRef = (el: HTMLDivElement | null) => {
    (contentRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    registerRef(el);
  };

  return (
    <div
      ref={handleRef}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      data-placeholder={getBlockPlaceholder(block.type)}
      className="outline-none min-h-[1.5em] text-base leading-relaxed break-words overflow-wrap-anywhere"
      style={{
        maxWidth: '100%',
        overflowWrap: 'break-word',
        wordWrap: 'break-word',
        wordBreak: 'break-word',
        whiteSpace: 'pre-wrap',
      }}
    />
  );
};
