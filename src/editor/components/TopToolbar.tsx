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
          padding: 0.5rem;
          border-bottom: 1px solid var(--editor-toolbar-border);
          background: var(--editor-toolbar-bg);
          flex-wrap: wrap;
          gap: 0.25rem;
        }

        .toolbar-group {
          display: flex;
          align-items: center;
          gap: 2px;
        }

        .toolbar-divider {
          width: 1px;
          height: 24px;
          background: var(--editor-border);
          margin: 0 0.5rem;
        }

        .toolbar-select {
          height: 32px;
          padding: 0 0.5rem;
          border: 1px solid var(--editor-border);
          border-radius: 4px;
          background: var(--editor-bg);
          color: var(--editor-text);
          font-size: 0.875rem;
          cursor: pointer;
        }

        .toolbar-select:hover {
          border-color: var(--editor-border-hover);
        }

        .toolbar-select:focus {
          outline: none;
          border-color: var(--editor-primary);
        }

        .color-select {
          width: 80px;
        }

        .toolbar-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 4px;
          background: transparent;
          color: var(--editor-text);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .toolbar-button:hover:not(:disabled) {
          background: var(--editor-code-bg);
        }

        .toolbar-button.active {
          background: var(--editor-selection);
          color: var(--editor-primary);
        }

        .toolbar-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .top-toolbar {
            padding: 0.25rem;
          }

          .toolbar-divider {
            margin: 0 0.25rem;
          }

          .toolbar-button {
            width: 28px;
            height: 28px;
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
