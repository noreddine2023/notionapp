import React, { useCallback } from 'react';
import type { Editor } from '@tiptap/core';

interface TopToolbarProps {
  editor: Editor;
  onImageUpload?: () => void;
}

/**
 * Word-like top toolbar with formatting controls
 */
export const TopToolbar: React.FC<TopToolbarProps> = ({ editor, onImageUpload }) => {
  // Block type options
  const blockTypes = [
    { value: 'paragraph', label: 'Paragraph' },
    { value: 'heading-1', label: 'Heading 1' },
    { value: 'heading-2', label: 'Heading 2' },
    { value: 'heading-3', label: 'Heading 3' },
  ];

  // Get current block type
  const getCurrentBlockType = (): string => {
    if (editor.isActive('heading', { level: 1 })) return 'heading-1';
    if (editor.isActive('heading', { level: 2 })) return 'heading-2';
    if (editor.isActive('heading', { level: 3 })) return 'heading-3';
    return 'paragraph';
  };

  // Handle block type change
  const handleBlockTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    
    switch (value) {
      case 'paragraph':
        editor.chain().focus().setParagraph().run();
        break;
      case 'heading-1':
        editor.chain().focus().toggleHeading({ level: 1 }).run();
        break;
      case 'heading-2':
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case 'heading-3':
        editor.chain().focus().toggleHeading({ level: 3 }).run();
        break;
    }
  };

  // Handle link insertion
  const handleLinkInsert = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  // Handle table insertion
  const handleTableInsert = useCallback(() => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  // Text colors
  const textColors = [
    { name: 'Default', value: '' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Gray', value: '#6b7280' },
  ];

  // Highlight colors
  const highlightColors = [
    { name: 'None', value: '' },
    { name: 'Yellow', value: '#fef08a' },
    { name: 'Green', value: '#bbf7d0' },
    { name: 'Blue', value: '#bfdbfe' },
    { name: 'Pink', value: '#fbcfe8' },
    { name: 'Orange', value: '#fed7aa' },
  ];

  return (
    <div className="top-toolbar">
      {/* Block Type Dropdown */}
      <div className="toolbar-group">
        <select 
          className="toolbar-select"
          value={getCurrentBlockType()}
          onChange={handleBlockTypeChange}
          aria-label="Block type"
        >
          {blockTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div className="toolbar-divider" />

      {/* Text Formatting */}
      <div className="toolbar-group">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
          aria-label="Bold"
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
          aria-label="Italic"
        >
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Underline (Ctrl+U)"
          aria-label="Underline"
        >
          <u>U</u>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strikethrough (Ctrl+Shift+S)"
          aria-label="Strikethrough"
        >
          <s>S</s>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title="Inline Code (Ctrl+E)"
          aria-label="Inline Code"
        >
          {'</>'}
        </ToolbarButton>
      </div>

      <div className="toolbar-divider" />

      {/* Text Color */}
      <div className="toolbar-group">
        <select
          className="toolbar-select color-select"
          onChange={(e) => {
            if (e.target.value) {
              editor.chain().focus().setColor(e.target.value).run();
            } else {
              editor.chain().focus().unsetColor().run();
            }
          }}
          title="Text Color"
          aria-label="Text Color"
        >
          {textColors.map((color) => (
            <option key={color.name} value={color.value}>
              {color.name}
            </option>
          ))}
        </select>

        {/* Highlight Color */}
        <select
          className="toolbar-select color-select"
          onChange={(e) => {
            if (e.target.value) {
              editor.chain().focus().toggleHighlight({ color: e.target.value }).run();
            } else {
              editor.chain().focus().unsetHighlight().run();
            }
          }}
          title="Highlight Color"
          aria-label="Highlight Color"
        >
          {highlightColors.map((color) => (
            <option key={color.name} value={color.value}>
              🖍 {color.name}
            </option>
          ))}
        </select>
      </div>

      <div className="toolbar-divider" />

      {/* Text Alignment */}
      <div className="toolbar-group">
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          title="Align Left"
          aria-label="Align Left"
        >
          ≡
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          title="Align Center"
          aria-label="Align Center"
        >
          ≡
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          title="Align Right"
          aria-label="Align Right"
        >
          ≡
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          isActive={editor.isActive({ textAlign: 'justify' })}
          title="Justify"
          aria-label="Justify"
        >
          ≡
        </ToolbarButton>
      </div>

      <div className="toolbar-divider" />

      {/* Lists */}
      <div className="toolbar-group">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
          aria-label="Bullet List"
        >
          •
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
          aria-label="Numbered List"
        >
          1.
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          isActive={editor.isActive('taskList')}
          title="Todo List"
          aria-label="Todo List"
        >
          ☑
        </ToolbarButton>
      </div>

      <div className="toolbar-divider" />

      {/* Insert */}
      <div className="toolbar-group">
        <ToolbarButton
          onClick={handleLinkInsert}
          isActive={editor.isActive('link')}
          title="Insert Link (Ctrl+K)"
          aria-label="Insert Link"
        >
          🔗
        </ToolbarButton>
        {onImageUpload && (
          <ToolbarButton
            onClick={onImageUpload}
            title="Insert Image"
            aria-label="Insert Image"
          >
            🖼
          </ToolbarButton>
        )}
        <ToolbarButton
          onClick={handleTableInsert}
          title="Insert Table"
          aria-label="Insert Table"
        >
          ▦
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Insert Divider"
          aria-label="Insert Divider"
        >
          —
        </ToolbarButton>
      </div>

      <div className="toolbar-divider" />

      {/* History */}
      <div className="toolbar-group">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
          aria-label="Undo"
        >
          ↩
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Shift+Z)"
          aria-label="Redo"
        >
          ↪
        </ToolbarButton>
      </div>

      <style>{`
        .top-toolbar {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.625rem 1.25rem;
          background: linear-gradient(180deg, var(--editor-toolbar-bg) 0%, var(--editor-bg) 100%);
          border-bottom: 1px solid var(--editor-border);
          flex-wrap: wrap;
          gap: 0.5rem;
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .toolbar-group {
          display: flex;
          align-items: center;
          gap: 2px;
          background: var(--editor-bg-secondary);
          border: 1px solid var(--editor-border);
          border-radius: var(--editor-radius-lg);
          padding: 4px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .toolbar-group:hover {
          border-color: var(--editor-border-hover);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .toolbar-divider {
          width: 1px;
          height: 24px;
          background: transparent;
          margin: 0 0.25rem;
        }

        .toolbar-select {
          height: 32px;
          padding: 0 0.75rem;
          border: none;
          border-radius: var(--editor-radius-md);
          background: transparent;
          color: var(--editor-text);
          font-size: 0.8125rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          min-width: 110px;
        }

        .toolbar-select:hover {
          background: var(--editor-hover-bg);
        }

        .toolbar-select:focus {
          outline: none;
          background: var(--editor-primary-light);
          color: var(--editor-primary);
        }

        .color-select {
          min-width: 95px;
        }

        .toolbar-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          border-radius: var(--editor-radius-md);
          background: transparent;
          color: var(--editor-text-muted);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .toolbar-button:hover:not(:disabled) {
          background: var(--editor-hover-bg);
          color: var(--editor-text);
          transform: translateY(-1px);
        }

        .toolbar-button.active {
          background: var(--editor-primary);
          color: white;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
        }

        .toolbar-button.active:hover {
          background: var(--editor-primary-hover);
          transform: translateY(-1px);
        }

        .toolbar-button:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .toolbar-button:active:not(:disabled) {
          transform: scale(0.95);
        }

        @media (max-width: 768px) {
          .top-toolbar {
            padding: 0.5rem;
            gap: 0.375rem;
          }

          .toolbar-group {
            padding: 3px;
          }

          .toolbar-divider {
            margin: 0 0.125rem;
          }

          .toolbar-button {
            width: 28px;
            height: 28px;
            font-size: 12px;
          }

          .toolbar-select {
            height: 28px;
            padding: 0 0.5rem;
            font-size: 0.75rem;
            min-width: 90px;
          }

          .color-select {
            min-width: 80px;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Toolbar button component
 */
const ToolbarButton: React.FC<{
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title?: string;
  'aria-label'?: string;
  children: React.ReactNode;
}> = ({ onClick, isActive, disabled, title, 'aria-label': ariaLabel, children }) => (
  <button
    type="button"
    className={`toolbar-button ${isActive ? 'active' : ''}`}
    onClick={onClick}
    disabled={disabled}
    title={title}
    aria-label={ariaLabel}
  >
    {children}
  </button>
);
