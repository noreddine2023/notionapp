import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Block as BlockType } from '../types/blocks';
import { Block } from './Block';

interface SortableBlockProps {
  block: BlockType;
  isActive: boolean;
  onFocus: () => void;
}

export const SortableBlock: React.FC<SortableBlockProps> = ({
  block,
  isActive,
  onFocus,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Block
        block={block}
        isActive={isActive}
        isDragging={isDragging}
        onFocus={onFocus}
        dragHandleProps={listeners}
      />
    </div>
  );
};
