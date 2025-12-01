import type { EditorOptions, JSONContent } from '@tiptap/core';
import { getExtensions, getMinimalExtensions } from './extensions';
import type { MentionItem } from '../types/editor';

export interface EditorConfig {
  /** Initial content in JSON format */
  content?: JSONContent;
  /** Make editor read-only */
  editable?: boolean;
  /** Auto-focus on mount */
  autofocus?: boolean | 'start' | 'end' | 'all' | number;
  /** Placeholder text */
  placeholder?: string;
  /** Mention search handler */
  onMentionSearch?: (query: string) => Promise<MentionItem[]>;
  /** Use minimal extensions only */
  minimal?: boolean;
  /** Enable collaboration features */
  enableCollaboration?: boolean;
  /** Update callback */
  onUpdate?: EditorOptions['onUpdate'];
  /** Selection update callback */
  onSelectionUpdate?: EditorOptions['onSelectionUpdate'];
  /** Focus callback */
  onFocus?: EditorOptions['onFocus'];
  /** Blur callback */
  onBlur?: EditorOptions['onBlur'];
  /** Transaction callback */
  onTransaction?: EditorOptions['onTransaction'];
}

/**
 * Create editor configuration object for Tiptap
 */
export function createEditorConfig(config: EditorConfig): Partial<EditorOptions> {
  const {
    content,
    editable = true,
    autofocus = false,
    placeholder,
    onMentionSearch,
    minimal = false,
    enableCollaboration = false,
    onUpdate,
    onSelectionUpdate,
    onFocus,
    onBlur,
    onTransaction,
  } = config;

  const extensions = minimal
    ? getMinimalExtensions(placeholder)
    : getExtensions({
        placeholder,
        onMentionSearch,
        enableCollaboration,
      });

  return {
    extensions,
    content,
    editable,
    autofocus,
    onUpdate,
    onSelectionUpdate,
    onFocus,
    onBlur,
    onTransaction,
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
        spellcheck: 'true',
      },
    },
  };
}

/**
 * Default editor configuration
 */
export const defaultEditorConfig: EditorConfig = {
  editable: true,
  autofocus: false,
  placeholder: 'Type \'/\' for commands...',
  minimal: false,
  enableCollaboration: false,
};
