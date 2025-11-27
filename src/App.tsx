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

  // Toggle theme
  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    document.documentElement.setAttribute('data-theme', theme === 'light' ? 'dark' : 'light');
  }, [theme]);

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
          initialValue={sampleDocument}
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
          padding: 0.875rem 1.5rem;
          background: var(--editor-header-gradient);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .app-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0;
          color: white;
          letter-spacing: -0.02em;
        }

        .app-actions {
          display: flex;
          gap: 0.75rem;
        }

        .theme-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          padding: 0;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.1);
          font-size: 18px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(8px);
        }

        .theme-toggle:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.3);
          transform: scale(1.05);
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

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: var(--editor-border);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: var(--editor-border-hover);
        }
      `}</style>
    </div>
  );
};

export default App;
