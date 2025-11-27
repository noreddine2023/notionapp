import React, { useCallback } from 'react';
import type { JSONContent } from '@tiptap/core';
import { EditorLayout } from './editor/components/EditorLayout';
import { sampleDocument } from './editor/types/content';
import type { MentionItem } from './editor/types/editor';

/**
 * Main application component - Modern Document Editor
 */
const App: React.FC = () => {
  // Handle content change (just log, no state update to prevent re-render loops)
  const handleChange = useCallback((newContent: JSONContent) => {
    console.log('Content updated:', newContent);
  }, []);

  // Handle image upload
  const handleImageUpload = useCallback(async (file: File): Promise<string> => {
    // In a real app, upload to server
    // For demo, create a local blob URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  // Handle mention search
  const handleMentionSearch = useCallback(async (query: string): Promise<MentionItem[]> => {
    // Demo users
    const users: MentionItem[] = [
      { id: '1', label: 'X_AE_A-13', email: 'x@example.com' },
      { id: '2', label: 'Saylor Twift', email: 'saylor@example.com' },
      { id: '3', label: 'Oarack Babama', email: 'oarack@example.com' },
      { id: '4', label: 'Alice Johnson', email: 'alice@example.com' },
      { id: '5', label: 'Charlie Brown', email: 'charlie@example.com' },
    ];

    return users.filter((user) =>
      user.label.toLowerCase().includes(query.toLowerCase())
    );
  }, []);

  return (
    <div className="app">
      {/* Editor - Full Screen Layout */}
      <EditorLayout
        initialValue={sampleDocument}
        onChange={handleChange}
        onImageUpload={handleImageUpload}
        onMentionSearch={handleMentionSearch}
        showToc={true}
        showComments={true}
        placeholder="Start writing or type '/' for commands..."
        autoFocus
      />

      <style>{`
        .app {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: #ffffff;
          color: #1e293b;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        /* Global styles */
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* Custom scrollbar - minimal style */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }

        /* Hide scrollbar for no-scrollbar class */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default App;
