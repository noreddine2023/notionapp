import React, { useState, useCallback } from 'react';
import type { JSONContent } from '@tiptap/core';
import { EditorLayout } from './editor/components/EditorLayout';
import { sampleDocument } from './editor/types/content';
import type { MentionItem } from './editor/types/editor';

/**
 * Main application component
 */
const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [content, setContent] = useState<JSONContent>(sampleDocument);

  // Toggle theme
  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    document.documentElement.setAttribute('data-theme', theme === 'light' ? 'dark' : 'light');
  }, [theme]);

  // Handle content change
  const handleChange = useCallback((newContent: JSONContent) => {
    setContent(newContent);
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
      { id: '1', label: 'John Doe', email: 'john@example.com' },
      { id: '2', label: 'Jane Smith', email: 'jane@example.com' },
      { id: '3', label: 'Bob Wilson', email: 'bob@example.com' },
      { id: '4', label: 'Alice Johnson', email: 'alice@example.com' },
      { id: '5', label: 'Charlie Brown', email: 'charlie@example.com' },
    ];

    return users.filter((user) =>
      user.label.toLowerCase().includes(query.toLowerCase())
    );
  }, []);

  return (
    <div className="app" data-theme={theme}>
      {/* Header */}
      <header className="app-header">
        <h1 className="app-title">Notion-Style Editor</h1>
        <div className="app-actions">
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      {/* Editor */}
      <main className="app-main">
        <EditorLayout
          initialValue={content}
          onChange={handleChange}
          onImageUpload={handleImageUpload}
          onMentionSearch={handleMentionSearch}
          showToc={true}
          showComments={true}
          placeholder="Start writing or type '/' for commands..."
          autoFocus
        />
      </main>

      <style>{`
        .app {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: var(--editor-bg);
          color: var(--editor-text);
        }

        .app-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1.5rem;
          border-bottom: 1px solid var(--editor-border);
          background: var(--editor-toolbar-bg);
        }

        .app-title {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0;
        }

        .app-actions {
          display: flex;
          gap: 0.5rem;
        }

        .theme-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          padding: 0;
          border: 1px solid var(--editor-border);
          border-radius: 8px;
          background: var(--editor-bg);
          font-size: 18px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .theme-toggle:hover {
          background: var(--editor-code-bg);
          border-color: var(--editor-border-hover);
        }

        .app-main {
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }

        /* Global styles */
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: var(--editor-font-family);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>
    </div>
  );
};

export default App;
