import type { Editor, JSONContent } from '@tiptap/core';

/**
 * Props for the TextEditor component
 */
export interface TextEditorProps {
  /** Current value in JSON format (controlled) */
  value?: JSONContent;
  /** Initial value in JSON format (uncontrolled) */
  initialValue?: JSONContent;
  /** Callback when content changes */
  onChange?: (content: JSONContent) => void;
  /** Make editor read-only */
  readOnly?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Placeholder text when editor is empty */
  placeholder?: string;
  /** Auto-focus on mount */
  autoFocus?: boolean;
  /** Debounce delay for onChange in milliseconds */
  debounceMs?: number;
  /** Custom image upload handler */
  onImageUpload?: (file: File) => Promise<string>;
  /** Custom mention search handler */
  onMentionSearch?: (query: string) => Promise<MentionItem[]>;
  /** Hide the top toolbar */
  hideToolbar?: boolean;
  /** Minimum height of the editor */
  minHeight?: string;
  /** Maximum height of the editor */
  maxHeight?: string;
}

/**
 * Ref methods exposed by TextEditor
 */
export interface TextEditorRef {
  /** Get the Tiptap editor instance */
  getEditor: () => Editor | null;
  /** Get content as JSON */
  getJSON: () => JSONContent | undefined;
  /** Get content as HTML string */
  getHTML: () => string;
  /** Get content as plain text */
  getText: () => string;
  /** Focus the editor */
  focus: () => void;
  /** Clear editor content */
  clear: () => void;
  /** Check if editor is empty */
  isEmpty: () => boolean;
}

/**
 * Props for the EditorLayout component
 */
export interface EditorLayoutProps extends TextEditorProps {
  /** Show table of contents sidebar */
  showToc?: boolean;
  /** Show comments sidebar */
  showComments?: boolean;
  /** Document ID for persistence */
  documentId?: string;
}

/**
 * Mention item for autocomplete
 */
export interface MentionItem {
  id: string;
  label: string;
  avatar?: string;
  email?: string;
}

/**
 * Comment data structure
 */
export interface Comment {
  id: string;
  text: string;
  author: CommentAuthor;
  createdAt: Date;
  resolved: boolean;
  replies: CommentReply[];
  /** Position information for the comment in the document */
  from: number;
  to: number;
}

/**
 * Comment author information
 */
export interface CommentAuthor {
  id: string;
  name: string;
  avatar?: string;
}

/**
 * Reply to a comment
 */
export interface CommentReply {
  id: string;
  text: string;
  author: CommentAuthor;
  createdAt: Date;
}

/**
 * Heading item for Table of Contents
 */
export interface TocHeading {
  id: string;
  text: string;
  level: number;
  pos: number;
}

/**
 * Save status for persistence
 */
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

/**
 * Document data structure
 */
export interface Document {
  id: string;
  title: string;
  content: JSONContent;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Block handle state
 */
export interface BlockHandleState {
  visible: boolean;
  position: { top: number; left: number };
  nodePos: number;
}

/**
 * Text alignment options
 */
export type TextAlignment = 'left' | 'center' | 'right' | 'justify';

/**
 * Color picker color
 */
export interface ColorOption {
  name: string;
  value: string;
}

/**
 * Page data structure for pages navigation
 */
export interface Page {
  id: string;
  title: string;
  icon?: string;
  children?: Page[];
  createdAt: Date;
  updatedAt: Date;
}
