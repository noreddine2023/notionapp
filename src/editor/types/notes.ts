/**
 * Note and NoteGroup types for the notes management system
 */

import type { Block } from './blocks';

export interface Note {
  id: string;
  title: string;
  content: Block[];
  groupId: string | null; // null means ungrouped
  createdAt: Date;
  updatedAt: Date;
}

export interface NoteGroup {
  id: string;
  name: string;
  color: string; // Tailwind color class or hex
  createdAt: Date;
  updatedAt: Date;
}

export interface NotesState {
  notes: Note[];
  groups: NoteGroup[];
  activeNoteId: string | null;
  activeGroupId: string | null;
  searchQuery: string;
}

// Default group colors
export const GROUP_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
];

// Get preview snippet from blocks
export function getPreviewSnippet(blocks: Block[], maxLength: number = 100): string {
  const textContent = blocks
    .filter(block => block.type !== 'divider')
    .map(block => block.content)
    .join(' ')
    .trim();
  
  if (textContent.length <= maxLength) return textContent;
  return textContent.slice(0, maxLength).trim() + '...';
}
