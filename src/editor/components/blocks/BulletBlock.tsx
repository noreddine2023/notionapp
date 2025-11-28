import React, { useRef, useEffect, KeyboardEvent, FormEvent } from 'react';
import type { Block } from '../../types/blocks';
import { getBlockPlaceholder } from '../../utils/blockUtils';

interface BulletBlockProps {
  block: Block;
  isActive: boolean;
  onUpdate: (content: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void;
  onFocus: () => void;
  registerRef: (el: HTMLDivElement | null) => void;
  listIndex?: number; // For numbered lists
}

export const BulletBlock: React.FC<BulletBlockProps> = ({
  block,
  isActive,
  onUpdate,
  onKeyDown,
  onFocus,
  registerRef,
  listIndex = 1,
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
      if (contentRef.current.innerHTML !== block.content) {
        contentRef.current.innerHTML = block.content;
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

  const isBullet = block.type === 'bullet';

  return (
    <div className="flex items-start gap-2">
      <span className="select-none text-gray-400 leading-relaxed min-w-[1.5em] text-center flex-shrink-0">
        {isBullet ? '•' : `${listIndex}.`}
      </span>
      <div
        ref={handleRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        data-placeholder={getBlockPlaceholder(block.type)}
        className="outline-none min-h-[1.5em] flex-1 text-base leading-relaxed break-words"
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
