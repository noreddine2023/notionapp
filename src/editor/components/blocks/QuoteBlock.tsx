import React, { useRef, useEffect, KeyboardEvent, FormEvent } from 'react';
import type { Block } from '../../types/blocks';
import { getBlockPlaceholder } from '../../utils/blockUtils';
import { sanitizeHtml } from '../../utils/sanitize';

interface QuoteBlockProps {
  block: Block;
  isActive: boolean;
  onUpdate: (content: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void;
  onFocus: () => void;
  registerRef: (el: HTMLDivElement | null) => void;
}

export const QuoteBlock: React.FC<QuoteBlockProps> = ({
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
      const sanitizedContent = sanitizeHtml(block.content);
      if (contentRef.current.innerHTML !== sanitizedContent) {
        contentRef.current.innerHTML = sanitizedContent;
      }
    }
    isInternalUpdate.current = false;
  }, [block.content]);

  const handleInput = (e: FormEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    isInternalUpdate.current = true;
    onUpdate(target.innerHTML || '');
  };

  const handleRef = (el: HTMLDivElement | null) => {
    (contentRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    registerRef(el);
  };

  return (
    <div className="border-l-4 border-gray-300 pl-4">
      <div
        ref={handleRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        data-placeholder={getBlockPlaceholder(block.type)}
        className="outline-none min-h-[1.5em] text-base leading-relaxed italic text-gray-600 break-words"
        style={{
          maxWidth: '100%',
          overflowWrap: 'break-word',
          wordWrap: 'break-word',
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
        }}
      />
    </div>
  );
};
