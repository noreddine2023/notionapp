import { useEffect, useRef } from 'react';
import type { Editor, JSONContent } from '@tiptap/core';

/**
 * Hook to sync editor content with an external value
 * Useful for syncing with external state management or server data
 */
export function useEditorSync(
  editor: Editor | null,
  externalValue: JSONContent | undefined,
  options: {
    /** Callback when editor content changes */
    onEditorChange?: (content: JSONContent) => void;
    /** Whether to sync from external value to editor */
    syncToEditor?: boolean;
    /** Whether to sync from editor to external */
    syncFromEditor?: boolean;
    /** Debounce delay for syncing from editor */
    debounceMs?: number;
  } = {}
) {
  const {
    onEditorChange,
    syncToEditor = true,
    syncFromEditor = true,
    debounceMs = 300,
  } = options;

  const lastContentRef = useRef<string>('');
  const isExternalUpdateRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Sync external value to editor
  useEffect(() => {
    if (!editor || !syncToEditor || !externalValue) return;

    const currentContentStr = JSON.stringify(editor.getJSON());
    const externalContentStr = JSON.stringify(externalValue);

    // Only update if content is different
    if (currentContentStr !== externalContentStr && externalContentStr !== lastContentRef.current) {
      isExternalUpdateRef.current = true;
      editor.commands.setContent(externalValue, false);
      lastContentRef.current = externalContentStr;
      isExternalUpdateRef.current = false;
    }
  }, [editor, externalValue, syncToEditor]);

  // Sync editor changes to external
  useEffect(() => {
    if (!editor || !syncFromEditor || !onEditorChange) return;

    const handleUpdate = () => {
      // Skip if this update was triggered by external sync
      if (isExternalUpdateRef.current) return;

      // Clear previous debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Debounce the sync
      debounceRef.current = setTimeout(() => {
        const content = editor.getJSON();
        const contentStr = JSON.stringify(content);

        // Only sync if content changed
        if (contentStr !== lastContentRef.current) {
          lastContentRef.current = contentStr;
          onEditorChange(content);
        }
      }, debounceMs);
    };

    editor.on('update', handleUpdate);

    return () => {
      editor.off('update', handleUpdate);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [editor, syncFromEditor, onEditorChange, debounceMs]);

  return {
    /** Force sync from external value to editor */
    forceSync: () => {
      if (editor && externalValue) {
        isExternalUpdateRef.current = true;
        editor.commands.setContent(externalValue, false);
        lastContentRef.current = JSON.stringify(externalValue);
        isExternalUpdateRef.current = false;
      }
    },
    /** Get current sync status */
    getLastSyncedContent: () => lastContentRef.current,
  };
}
