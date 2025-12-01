import { create } from 'zustand';
import type { Block, BlockType } from '../types/blocks';
import { createBlock } from '../utils/blockUtils';

interface EditorStore {
  blocks: Block[];
  activeBlockId: string | null;
  
  // Block operations
  setBlocks: (blocks: Block[]) => void;
  addBlock: (afterId: string | null, type?: BlockType) => string;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  deleteBlock: (id: string) => void;
  moveBlock: (fromIndex: number, toIndex: number) => void;
  
  // Focus management
  setActiveBlock: (id: string | null) => void;
  getBlockIndex: (id: string) => number;
  getPreviousBlockId: (currentId: string) => string | null;
  getNextBlockId: (currentId: string) => string | null;
  
  // Slash menu
  isSlashMenuOpen: boolean;
  slashMenuPosition: { x: number; y: number } | null;
  slashMenuQuery: string;
  openSlashMenu: (position: { x: number; y: number }) => void;
  closeSlashMenu: () => void;
  setSlashMenuQuery: (query: string) => void;
  
  // Convert block type
  convertBlockType: (id: string, newType: BlockType) => void;
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  blocks: [createBlock('text', '')],
  activeBlockId: null,
  
  // Slash menu state
  isSlashMenuOpen: false,
  slashMenuPosition: null,
  slashMenuQuery: '',
  
  setBlocks: (blocks) => set({ blocks }),
  
  addBlock: (afterId, type = 'text') => {
    const newBlock = createBlock(type);
    
    set((state) => {
      if (afterId === null) {
        return { blocks: [newBlock, ...state.blocks] };
      }
      
      const index = state.blocks.findIndex((b) => b.id === afterId);
      if (index === -1) {
        return { blocks: [...state.blocks, newBlock] };
      }
      
      const newBlocks = [...state.blocks];
      newBlocks.splice(index + 1, 0, newBlock);
      return { blocks: newBlocks };
    });
    
    return newBlock.id;
  },
  
  updateBlock: (id, updates) => {
    set((state) => ({
      blocks: state.blocks.map((block) =>
        block.id === id
          ? { ...block, ...updates, updatedAt: new Date() }
          : block
      ),
    }));
  },
  
  deleteBlock: (id) => {
    set((state) => {
      // Don't delete the last block
      if (state.blocks.length <= 1) {
        return state;
      }
      return {
        blocks: state.blocks.filter((block) => block.id !== id),
      };
    });
  },
  
  moveBlock: (fromIndex, toIndex) => {
    set((state) => {
      const newBlocks = [...state.blocks];
      const [removed] = newBlocks.splice(fromIndex, 1);
      newBlocks.splice(toIndex, 0, removed);
      return { blocks: newBlocks };
    });
  },
  
  setActiveBlock: (id) => set({ activeBlockId: id }),
  
  getBlockIndex: (id) => {
    return get().blocks.findIndex((b) => b.id === id);
  },
  
  getPreviousBlockId: (currentId) => {
    const { blocks } = get();
    const index = blocks.findIndex((b) => b.id === currentId);
    if (index > 0) {
      return blocks[index - 1].id;
    }
    return null;
  },
  
  getNextBlockId: (currentId) => {
    const { blocks } = get();
    const index = blocks.findIndex((b) => b.id === currentId);
    if (index >= 0 && index < blocks.length - 1) {
      return blocks[index + 1].id;
    }
    return null;
  },
  
  openSlashMenu: (position) => {
    set({ isSlashMenuOpen: true, slashMenuPosition: position, slashMenuQuery: '' });
  },
  
  closeSlashMenu: () => {
    set({ isSlashMenuOpen: false, slashMenuPosition: null, slashMenuQuery: '' });
  },
  
  setSlashMenuQuery: (query) => {
    set({ slashMenuQuery: query });
  },
  
  convertBlockType: (id, newType) => {
    set((state) => ({
      blocks: state.blocks.map((block) =>
        block.id === id
          ? {
              ...block,
              type: newType,
              props: newType === 'todo' ? { checked: false } : block.props,
              updatedAt: new Date(),
            }
          : block
      ),
    }));
  },
}));
