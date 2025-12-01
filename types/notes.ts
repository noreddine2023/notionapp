/**
 * Note Types
 * 
 * Core types for the Notes feature.
 */

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  isFavorite: boolean;
  authorId: string;
}

export interface NoteBlock {
  id: string;
  type: "text" | "heading" | "list" | "code" | "image" | "divider";
  content: string;
  properties?: Record<string, unknown>;
  children?: NoteBlock[];
}

export interface CreateNoteInput {
  title: string;
  content?: string;
  tags?: string[];
}

export interface UpdateNoteInput {
  id: string;
  title?: string;
  content?: string;
  tags?: string[];
  isFavorite?: boolean;
}
