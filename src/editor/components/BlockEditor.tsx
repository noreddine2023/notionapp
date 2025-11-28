import React, { useEffect, useCallback, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useEditorStore } from '../store/editorStore';
import { SortableBlock } from './SortableBlock';
import { SlashMenu } from './SlashMenuBlock';
import type { Block, BlockType } from '../types/blocks';
import { convertFromOldFormat } from '../utils/blockUtils';

interface BlockEditorProps {
  initialContent?: Block[] | { type: string; content?: unknown[] };
  onChange?: (blocks: Block[]) => void;
  autoFocus?: boolean;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
  initialContent,
  onChange,
  autoFocus = false,
}) => {
  const {
    blocks,
    setBlocks,
    activeBlockId,
    setActiveBlock,
    moveBlock,
    getBlockIndex,
    isSlashMenuOpen,
    slashMenuPosition,
    slashMenuQuery,
    closeSlashMenu,
    convertBlockType,
  } = useEditorStore();

  // Initialize blocks from initial content
  useEffect(() => {
    if (initialContent) {
      if (Array.isArray(initialContent)) {
        setBlocks(initialContent);
      } else {
        // Convert from old JSON format
        const convertedBlocks = convertFromOldFormat(initialContent as Parameters<typeof convertFromOldFormat>[0]);
        setBlocks(convertedBlocks);
      }
    }
  }, []); // Only run on mount

  // Notify parent of changes
  useEffect(() => {
    onChange?.(blocks);
  }, [blocks, onChange]);

  // Auto-focus first block on mount
  useEffect(() => {
    if (autoFocus && blocks.length > 0 && !activeBlockId) {
      setActiveBlock(blocks[0].id);
    }
  }, [autoFocus, blocks, activeBlockId, setActiveBlock]);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const fromIndex = getBlockIndex(active.id as string);
      const toIndex = getBlockIndex(over.id as string);
      moveBlock(fromIndex, toIndex);
    }
  }, [getBlockIndex, moveBlock]);

  // Handle block focus
  const handleBlockFocus = useCallback((blockId: string) => {
    setActiveBlock(blockId);
  }, [setActiveBlock]);

  // Handle slash menu selection
  const handleSlashMenuSelect = useCallback((type: BlockType) => {
    if (activeBlockId) {
      convertBlockType(activeBlockId, type);
      closeSlashMenu();
    }
  }, [activeBlockId, convertBlockType, closeSlashMenu]);

  // Get block IDs for sortable context
  const blockIds = useMemo(() => blocks.map((b) => b.id), [blocks]);

  return (
    <div className="block-editor flex flex-col h-full bg-white">
      {/* Editor content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[850px] mx-auto px-12 py-12">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
              {blocks.map((block) => (
                <SortableBlock
                  key={block.id}
                  block={block}
                  isActive={activeBlockId === block.id}
                  onFocus={() => handleBlockFocus(block.id)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {/* Slash menu */}
      {isSlashMenuOpen && slashMenuPosition && (
        <SlashMenu
          position={slashMenuPosition}
          query={slashMenuQuery}
          onSelect={handleSlashMenuSelect}
          onClose={closeSlashMenu}
        />
      )}
    </div>
  );
};
