import { useCallback, useEffect, useRef, useState } from 'react';
import type { Editor, JSONContent } from '@tiptap/core';
import type { SaveStatus } from '../types/editor';

export interface UsePersistenceOptions {
  /** Document ID for API calls */
  documentId?: string;
  /** API base URL */
  apiBaseUrl?: string;
  /** Auto-save interval in milliseconds */
  autoSaveInterval?: number;
  /** Debounce delay before saving draft */
  draftDebounceMs?: number;
  /** Callback when save succeeds */
  onSaveSuccess?: () => void;
  /** Callback when save fails */
  onSaveError?: (error: Error) => void;
  /** Callback when document is loaded */
  onLoad?: (content: JSONContent) => void;
  /** Skip initial load from server */
  skipInitialLoad?: boolean;
}

/**
 * Hook for persisting editor content to a backend
 */
export function usePersistence(editor: Editor | null, options: UsePersistenceOptions = {}) {
  const {
    documentId,
    apiBaseUrl = '/api',
    autoSaveInterval = 30000, // 30 seconds
    draftDebounceMs = 2000, // 2 seconds
    onSaveSuccess,
    onSaveError,
    onLoad,
    skipInitialLoad = false,
  } = options;

  const [status, setStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const autoSaveRef = useRef<ReturnType<typeof setInterval>>();
  const lastContentRef = useRef<string>('');

  /**
   * Save document to server
   */
  const saveDocument = useCallback(async () => {
    if (!editor || !documentId) return;

    const content = editor.getJSON();
    const contentStr = JSON.stringify(content);

    // Skip if content hasn't changed
    if (contentStr === lastContentRef.current) {
      return;
    }

    setStatus('saving');

    try {
      const response = await fetch(`${apiBaseUrl}/documents/${documentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: contentStr,
      });

      if (!response.ok) {
        throw new Error(`Failed to save: ${response.statusText}`);
      }

      lastContentRef.current = contentStr;
      setStatus('saved');
      setLastSaved(new Date());
      onSaveSuccess?.();
    } catch (error) {
      setStatus('error');
      onSaveError?.(error instanceof Error ? error : new Error('Unknown error'));
    }
  }, [editor, documentId, apiBaseUrl, onSaveSuccess, onSaveError]);

  /**
   * Save draft (debounced)
   */
  const saveDraft = useCallback(async () => {
    if (!editor || !documentId) return;

    const content = editor.getJSON();
    const contentStr = JSON.stringify(content);

    // Skip if content hasn't changed
    if (contentStr === lastContentRef.current) {
      return;
    }

    setStatus('saving');

    try {
      const response = await fetch(`${apiBaseUrl}/documents/${documentId}/draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: contentStr,
      });

      if (!response.ok) {
        throw new Error(`Failed to save draft: ${response.statusText}`);
      }

      lastContentRef.current = contentStr;
      setStatus('saved');
      setLastSaved(new Date());
    } catch (error) {
      setStatus('error');
      console.error('Draft save failed:', error);
    }
  }, [editor, documentId, apiBaseUrl]);

  /**
   * Load document from server
   */
  const loadDocument = useCallback(async () => {
    if (!documentId) return;

    setIsLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/documents/${documentId}`);

      if (!response.ok) {
        if (response.status === 404) {
          // Document doesn't exist yet, that's okay
          setIsLoading(false);
          return;
        }
        throw new Error(`Failed to load: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.content as JSONContent;

      if (editor && content) {
        editor.commands.setContent(content);
        lastContentRef.current = JSON.stringify(content);
      }

      onLoad?.(content);
    } catch (error) {
      console.error('Failed to load document:', error);
    } finally {
      setIsLoading(false);
    }
  }, [editor, documentId, apiBaseUrl, onLoad]);

  // Load document on mount
  useEffect(() => {
    if (!skipInitialLoad && documentId && editor) {
      loadDocument();
    }
  }, [skipInitialLoad, documentId, editor, loadDocument]);

  // Set up debounced draft save on content change
  useEffect(() => {
    if (!editor || !documentId) return;

    const handleUpdate = () => {
      // Clear previous debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Set up new debounce
      debounceRef.current = setTimeout(() => {
        saveDraft();
      }, draftDebounceMs);
    };

    editor.on('update', handleUpdate);

    return () => {
      editor.off('update', handleUpdate);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [editor, documentId, draftDebounceMs, saveDraft]);

  // Set up auto-save interval
  useEffect(() => {
    if (!editor || !documentId || autoSaveInterval <= 0) return;

    autoSaveRef.current = setInterval(() => {
      saveDocument();
    }, autoSaveInterval);

    return () => {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
    };
  }, [editor, documentId, autoSaveInterval, saveDocument]);

  // Save on unmount
  useEffect(() => {
    return () => {
      if (editor && documentId) {
        const content = editor.getJSON();
        const contentStr = JSON.stringify(content);

        if (contentStr !== lastContentRef.current) {
          // Sync save on unmount
          const xhr = new XMLHttpRequest();
          xhr.open('PUT', `${apiBaseUrl}/documents/${documentId}`, false); // Synchronous
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.send(contentStr);
        }
      }
    };
  }, [editor, documentId, apiBaseUrl]);

  return {
    status,
    lastSaved,
    isLoading,
    saveDocument,
    saveDraft,
    loadDocument,
  };
}
