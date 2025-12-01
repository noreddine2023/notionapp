/**
 * Block-based editor types
 */

export type BlockType = 'text' | 'h1' | 'h2' | 'h3' | 'bullet' | 'numbered' | 'todo' | 'quote' | 'divider' | 'code' | 'image';

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  props?: {
    checked?: boolean;      // for todo blocks
    language?: string;      // for code blocks
    level?: number;         // for nested lists
    placeholder?: string;   // custom placeholder text
    src?: string;           // for image blocks
    alt?: string;           // for image blocks
    caption?: string;       // for image blocks
    width?: number;         // for image blocks
    alignment?: 'left' | 'center' | 'right'; // for image blocks
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface EditorState {
  blocks: Block[];
  activeBlockId: string | null;
  isSlashMenuOpen: boolean;
  slashMenuPosition: { x: number; y: number } | null;
}

/**
 * Slash menu item interface
 */
export interface SlashMenuItem {
  type: BlockType;
  label: string;
  description: string;
  keywords: string[];
}
