import React, { useRef, useEffect, KeyboardEvent, FormEvent } from 'react';
import { Square, CheckSquare } from 'lucide-react';
import type { Block } from '../../types/blocks';
import { getBlockPlaceholder } from '../../utils/blockUtils';

interface TodoBlockProps {
  block: Block;
  isActive: boolean;
  onUpdate: (content: string) => void;
  onToggle: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void;
  onFocus: () => void;
  registerRef: (el: HTMLDivElement | null) => void;
}

export const TodoBlock: React.FC<TodoBlockProps> = ({
  block,
  isActive,
  onUpdate,
  onToggle,
  onKeyDown,
  onFocus,
  registerRef,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const isChecked = block.props?.checked ?? false;

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

  // Sync content with block.content
  useEffect(() => {
    if (contentRef.current && contentRef.current.textContent !== block.content) {
      contentRef.current.textContent = block.content;
    }
  }, [block.content]);

  const handleInput = (e: FormEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    onUpdate(target.textContent || '');
  };

  const handleRef = (el: HTMLDivElement | null) => {
    (contentRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    registerRef(el);
  };

  return (
    <div className="flex items-start gap-2">
      <button
        onClick={onToggle}
        className="p-0.5 rounded hover:bg-gray-100 transition-colors mt-0.5"
        tabIndex={-1}
      >
        {isChecked ? (
          <CheckSquare className="w-4 h-4 text-blue-500" />
        ) : (
          <Square className="w-4 h-4 text-gray-400" />
        )}
      </button>
      <div
        ref={handleRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        data-placeholder={getBlockPlaceholder(block.type)}
        className={`outline-none min-h-[1.5em] flex-1 text-base leading-relaxed ${
          isChecked ? 'line-through text-gray-400' : ''
        }`}
      />
    </div>
  );
};
