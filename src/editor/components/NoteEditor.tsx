import React, { useEffect, useCallback, useMemo, useState } from 'react';
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
import { Clock } from 'lucide-react';
import { useEditorStore } from '../store/editorStore';
import { useNotesStore } from '../store/notesStore';
import { SortableBlock } from './SortableBlock';
import { SlashMenu } from './SlashMenuBlock';
import { EditorToolbar } from './EditorToolbar';
import type { Block, BlockType } from '../types/blocks';
import { createBlock } from '../utils/blockUtils';

interface NoteEditorProps {
  noteId: string | null;
  onChange?: (blocks: Block[]) => void;
  autoFocus?: boolean;
}

// Debounce helper
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  noteId,
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
    addBlock,
  } = useEditorStore();

  const { getActiveNote, updateNoteContent } = useNotesStore();
  const activeNote = getActiveNote();

  // Auto-save state
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Track blocks for auto-save with debounce
  const debouncedBlocks = useDebounce(blocks, 1500);

  // Load note content when noteId changes
  useEffect(() => {
    if (activeNote) {
      setBlocks(activeNote.content);
      setHasUnsavedChanges(false);
    } else if (!noteId) {
      // No note selected - show empty state or create new
      setBlocks([createBlock('text', '')]);
    }
  }, [noteId, activeNote?.id, setBlocks]); // Only reload when note ID changes

  // Save function
  const handleSave = useCallback(() => {
    if (!noteId) return;

    setIsSaving(true);
    
    // Simulate a small delay to show saving state
    setTimeout(() => {
      updateNoteContent(noteId, blocks);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      setIsSaving(false);
    }, 200);
  }, [noteId, blocks, updateNoteContent]);

  // Auto-save when debounced blocks change
  useEffect(() => {
    if (noteId && hasUnsavedChanges) {
      handleSave();
    }
  }, [debouncedBlocks, noteId, hasUnsavedChanges, handleSave]);

  // Mark as having unsaved changes when blocks change
  useEffect(() => {
    if (noteId) {
      setHasUnsavedChanges(true);
    }
    onChange?.(blocks);
  }, [blocks, onChange, noteId]);

  // Auto-focus first block on mount
  useEffect(() => {
    if (autoFocus && blocks.length > 0 && !activeBlockId) {
      setActiveBlock(blocks[0].id);
    }
  }, [autoFocus, blocks, activeBlockId, setActiveBlock]);

  // Manual save
  const handleManualSave = useCallback(() => {
    handleSave();
  }, [handleSave]);

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

  // Handle toolbar format
  const handleFormatText = useCallback((format: string, value?: string) => {
    // For block-based editor, these actions create/convert blocks
    switch (format) {
      case 'heading':
        if (activeBlockId) {
          const level = value as '1' | '2' | '3';
          convertBlockType(activeBlockId, `h${level}` as BlockType);
        }
        break;
      case 'paragraph':
        if (activeBlockId) {
          convertBlockType(activeBlockId, 'text');
        }
        break;
      case 'bulletList':
        if (activeBlockId) {
          convertBlockType(activeBlockId, 'bullet');
        }
        break;
      case 'numberedList':
        if (activeBlockId) {
          convertBlockType(activeBlockId, 'numbered');
        }
        break;
      case 'quote':
        if (activeBlockId) {
          convertBlockType(activeBlockId, 'quote');
        }
        break;
      case 'code':
        if (activeBlockId) {
          convertBlockType(activeBlockId, 'code');
        }
        break;
      case 'divider':
        addBlock(activeBlockId, 'divider');
        break;
      default:
        // Other formatting would need rich text support in blocks
        console.log('Format:', format, value);
    }
  }, [activeBlockId, convertBlockType, addBlock]);

  // Handle image insertion
  const handleInsertImage = useCallback(() => {
    const newBlockId = addBlock(activeBlockId, 'image');
    setActiveBlock(newBlockId);
  }, [activeBlockId, addBlock, setActiveBlock]);

  // Get block IDs for sortable context
  const blockIds = useMemo(() => blocks.map((b) => b.id), [blocks]);

  // Calculate list indices for numbered lists
  const getListIndex = useCallback((blockIndex: number): number => {
    const block = blocks[blockIndex];
    if (block.type !== 'numbered') return 1;
    
    let count = 1;
    for (let i = blockIndex - 1; i >= 0; i--) {
      if (blocks[i].type === 'numbered') {
        count++;
      } else {
        break;
      }
    }
    return count;
  }, [blocks]);

  // Empty state when no note is selected
  if (!noteId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No note selected</h3>
          <p className="text-sm text-gray-500">Select a note from the sidebar or create a new one</p>
        </div>
      </div>
    );
  }

  return (
    <div className="note-editor flex flex-col h-full bg-gray-100">
      {/* Toolbar */}
      <EditorToolbar
        onFormatText={handleFormatText}
        onInsertImage={handleInsertImage}
        onSave={handleManualSave}
        isSaving={isSaving}
        lastSaved={lastSaved}
      />

      {/* Paper-style editor container */}
      <div className="flex-1 overflow-y-auto py-8 px-4">
        <div className="paper-container mx-auto">
          {/* Paper document */}
          <div className="paper bg-white rounded-lg shadow-lg min-h-[800px] max-w-[850px] mx-auto">
            {/* Paper content */}
            <div className="paper-content px-16 py-12">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
                  {blocks.map((block, index) => (
                    <SortableBlock
                      key={block.id}
                      block={block}
                      isActive={activeBlockId === block.id}
                      onFocus={() => handleBlockFocus(block.id)}
                      listIndex={block.type === 'numbered' ? getListIndex(index) : undefined}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          </div>
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

      {/* Auto-save indicator */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          Unsaved changes
        </div>
      )}

      <style>{`
        .paper-container {
          max-width: 900px;
        }

        .paper {
          box-shadow: 
            0 1px 3px rgba(0, 0, 0, 0.12),
            0 4px 6px rgba(0, 0, 0, 0.08),
            0 10px 20px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .paper-content {
          min-height: calc(800px - 6rem);
        }

        /* Paper texture (subtle) */
        .paper::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.01) 50%, transparent 100%);
          pointer-events: none;
          border-radius: inherit;
        }

        @media (max-width: 768px) {
          .paper-content {
            padding: 2rem 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default NoteEditor;
