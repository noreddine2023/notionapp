import { useEditor, Editor } from '@tiptap/react';
import { useCallback, useEffect, useRef } from 'react';
import type { JSONContent } from '@tiptap/core';
import { createEditorConfig } from '../core/config';
import type { MentionItem } from '../types/editor';

export interface UseTextEditorOptions {
  /** Initial content */
  initialValue?: JSONContent;
  /** Controlled value */
  value?: JSONContent;
  /** Callback when content changes */
  onChange?: (content: JSONContent) => void;
  /** Read-only mode */
  readOnly?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Auto-focus on mount */
  autoFocus?: boolean;
  /** Debounce delay for onChange */
  debounceMs?: number;
  /** Mention search handler */
  onMentionSearch?: (query: string) => Promise<MentionItem[]>;
  /** Minimal extensions mode */
  minimal?: boolean;
  /** Callback when editor is ready */
  onReady?: (editor: Editor) => void;
  /** Callback on focus */
  onFocus?: () => void;
  /** Callback on blur */
  onBlur?: () => void;
}

/**
 * Main hook for using the Tiptap editor
 */
export function useTextEditor(options: UseTextEditorOptions = {}) {
  const {
    initialValue,
    value,
    onChange,
    readOnly = false,
    placeholder,
    autoFocus = false,
    debounceMs = 300,
    onMentionSearch,
    minimal = false,
    onReady,
    onFocus,
    onBlur,
  } = options;

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const isControlled = value !== undefined;
  const isUpdatingRef = useRef(false);

  // Create editor configuration
  const editorConfig = createEditorConfig({
    content: isControlled ? value : initialValue,
    editable: !readOnly,
    autofocus: autoFocus,
    placeholder,
    onMentionSearch,
    minimal,
    onUpdate: ({ editor }) => {
      if (isUpdatingRef.current) return;

      if (onChange) {
        // Clear previous debounce
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }

        // Debounce the onChange callback
        debounceRef.current = setTimeout(() => {
          onChange(editor.getJSON());
        }, debounceMs);
      }
    },
    onFocus: () => {
      onFocus?.();
    },
    onBlur: () => {
      onBlur?.();
    },
  });

  const editor = useEditor(editorConfig);

  // Handle controlled value changes
  useEffect(() => {
    if (!editor || !isControlled || !value) return;

    const currentContent = editor.getJSON();
    const isSameContent = JSON.stringify(currentContent) === JSON.stringify(value);

    if (!isSameContent) {
      isUpdatingRef.current = true;
      editor.commands.setContent(value, false);
      isUpdatingRef.current = false;
    }
  }, [editor, value, isControlled]);

  // Handle readOnly changes
  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!readOnly);
  }, [editor, readOnly]);

  // Notify when editor is ready
  useEffect(() => {
    if (editor && onReady) {
      onReady(editor);
    }
  }, [editor, onReady]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Helper methods
  const getJSON = useCallback(() => {
    return editor?.getJSON();
  }, [editor]);

  const getHTML = useCallback(() => {
    return editor?.getHTML() ?? '';
  }, [editor]);

  const getText = useCallback(() => {
    return editor?.getText() ?? '';
  }, [editor]);

  const focus = useCallback(() => {
    editor?.commands.focus();
  }, [editor]);

  const clear = useCallback(() => {
    editor?.commands.clearContent();
  }, [editor]);

  const isEmpty = useCallback(() => {
    return editor?.isEmpty ?? true;
  }, [editor]);

  const setContent = useCallback(
    (content: JSONContent) => {
      editor?.commands.setContent(content);
    },
    [editor]
  );

  return {
    editor,
    getJSON,
    getHTML,
    getText,
    focus,
    clear,
    isEmpty,
    setContent,
  };
}
