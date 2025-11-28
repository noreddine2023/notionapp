import React, { KeyboardEvent } from 'react';
import type { Block } from '../types/blocks';
import {
  TextBlock,
  HeadingBlock,
  BulletBlock,
  TodoBlock,
  QuoteBlock,
  DividerBlock,
  CodeBlock,
  ImageBlock,
} from './blocks';

interface BlockContentProps {
  block: Block;
  isActive: boolean;
  onUpdate: (content: string) => void;
  onUpdateWithProps?: (content: string, props?: Block['props']) => void;
  onToggleTodo?: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void;
  onFocus: () => void;
  registerRef: (el: HTMLDivElement | null) => void;
  listIndex?: number; // For numbered lists
}

export const BlockContent: React.FC<BlockContentProps> = ({
  block,
  isActive,
  onUpdate,
  onUpdateWithProps,
  onToggleTodo,
  onKeyDown,
  onFocus,
  registerRef,
  listIndex,
}) => {
  switch (block.type) {
    case 'h1':
    case 'h2':
    case 'h3':
      return (
        <HeadingBlock
          block={block}
          isActive={isActive}
          onUpdate={onUpdate}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          registerRef={registerRef}
        />
      );
    case 'bullet':
    case 'numbered':
      return (
        <BulletBlock
          block={block}
          isActive={isActive}
          onUpdate={onUpdate}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          registerRef={registerRef}
          listIndex={listIndex}
        />
      );
    case 'todo':
      return (
        <TodoBlock
          block={block}
          isActive={isActive}
          onUpdate={onUpdate}
          onToggle={onToggleTodo || (() => {})}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          registerRef={registerRef}
        />
      );
    case 'quote':
      return (
        <QuoteBlock
          block={block}
          isActive={isActive}
          onUpdate={onUpdate}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          registerRef={registerRef}
        />
      );
    case 'divider':
      return (
        <DividerBlock
          isActive={isActive}
          onFocus={onFocus}
        />
      );
    case 'code':
      return (
        <CodeBlock
          block={block}
          isActive={isActive}
          onUpdate={onUpdate}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          registerRef={registerRef}
        />
      );
    case 'image':
      return (
        <ImageBlock
          block={block}
          isActive={isActive}
          onUpdate={onUpdateWithProps || ((content, _props) => {
            onUpdate(content);
            // Props update handled separately if no onUpdateWithProps provided
          })}
          onFocus={onFocus}
        />
      );
    case 'text':
    default:
      return (
        <TextBlock
          block={block}
          isActive={isActive}
          onUpdate={onUpdate}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          registerRef={registerRef}
        />
      );
  }
};
