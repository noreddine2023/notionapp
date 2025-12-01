import React, { useCallback, useState } from 'react';
import type { Editor } from '@tiptap/core';

interface BubbleMenuToolbarProps {
  editor: Editor;
}

/**
 * Floating toolbar that appears on text selection
 */
export const BubbleMenuToolbar: React.FC<BubbleMenuToolbarProps> = ({ editor }) => {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  // Handle link submission
  const handleLinkSubmit = useCallback(() => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setShowLinkInput(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  // Handle link button click
  const handleLinkClick = useCallback(() => {
    const currentUrl = editor.getAttributes('link').href || '';
    setLinkUrl(currentUrl);
    setShowLinkInput(true);
  }, [editor]);

  // Cancel link editing
  const handleLinkCancel = useCallback(() => {
    setShowLinkInput(false);
    setLinkUrl('');
  }, []);

  // Remove link
  const handleLinkRemove = useCallback(() => {
    editor.chain().focus().unsetLink().run();
    setShowLinkInput(false);
    setLinkUrl('');
  }, [editor]);

  if (showLinkInput) {
    return (
      <div className="bubble-menu link-input-mode">
        <input
          type="url"
          className="link-input"
          placeholder="Enter URL..."
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleLinkSubmit();
            } else if (e.key === 'Escape') {
              handleLinkCancel();
            }
          }}
          autoFocus
        />
        <button
          type="button"
          className="link-btn confirm"
          onClick={handleLinkSubmit}
          title="Apply Link"
          aria-label="Apply Link"
        >
          ✓
        </button>
        {editor.isActive('link') && (
          <button
            type="button"
            className="link-btn remove"
            onClick={handleLinkRemove}
            title="Remove Link"
            aria-label="Remove Link"
          >
            ✕
          </button>
        )}
        <button
          type="button"
          className="link-btn cancel"
          onClick={handleLinkCancel}
          title="Cancel"
          aria-label="Cancel"
        >
          ←
        </button>

        <style>{bubbleMenuStyles}</style>
      </div>
    );
  }

  return (
    <div className="bubble-menu">
      <BubbleButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Bold"
        aria-label="Bold"
      >
        <strong>B</strong>
      </BubbleButton>
      <BubbleButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Italic"
        aria-label="Italic"
      >
        <em>I</em>
      </BubbleButton>
      <BubbleButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        title="Underline"
        aria-label="Underline"
      >
        <u>U</u>
      </BubbleButton>
      <BubbleButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        title="Strikethrough"
        aria-label="Strikethrough"
      >
        <s>S</s>
      </BubbleButton>
      <BubbleButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive('code')}
        title="Code"
        aria-label="Code"
      >
        {'</>'}
      </BubbleButton>

      <span className="bubble-divider" />

      <BubbleButton
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        isActive={editor.isActive('highlight')}
        title="Highlight"
        aria-label="Highlight"
      >
        🖍
      </BubbleButton>

      <span className="bubble-divider" />

      <BubbleButton
        onClick={handleLinkClick}
        isActive={editor.isActive('link')}
        title="Link"
        aria-label="Link"
      >
        🔗
      </BubbleButton>

      <style>{bubbleMenuStyles}</style>
    </div>
  );
};

/**
 * Bubble menu button component
 */
const BubbleButton: React.FC<{
  onClick: () => void;
  isActive?: boolean;
  title?: string;
  'aria-label'?: string;
  children: React.ReactNode;
}> = ({ onClick, isActive, title, 'aria-label': ariaLabel, children }) => (
  <button
    type="button"
    className={`bubble-button ${isActive ? 'active' : ''}`}
    onClick={onClick}
    title={title}
    aria-label={ariaLabel}
  >
    {children}
  </button>
);

const bubbleMenuStyles = `
  .bubble-menu {
    display: flex;
    align-items: center;
    padding: 0.375rem 0.5rem;
    background: var(--editor-menu-bg);
    border: 1px solid var(--editor-border);
    border-radius: var(--editor-radius-lg);
    box-shadow: 0 4px 24px -4px rgba(0, 0, 0, 0.15), 0 2px 8px -2px rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  .bubble-menu.link-input-mode {
    padding: 0.375rem 0.75rem;
  }

  .bubble-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border: none;
    border-radius: var(--editor-radius-md);
    background: transparent;
    color: var(--editor-text-muted);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .bubble-button:hover {
    background: var(--editor-hover-bg);
    color: var(--editor-text);
    transform: translateY(-1px);
  }

  .bubble-button.active {
    background: var(--editor-primary);
    color: white;
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
  }

  .bubble-button.active:hover {
    background: var(--editor-primary-hover);
  }

  .bubble-button:active {
    transform: scale(0.95);
  }

  .bubble-divider {
    width: 1px;
    height: 20px;
    background: var(--editor-border);
    margin: 0 0.375rem;
    opacity: 0.6;
  }

  .link-input {
    width: 200px;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--editor-border);
    border-radius: var(--editor-radius-md);
    background: var(--editor-bg);
    color: var(--editor-text);
    font-size: 0.8125rem;
    outline: none;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .link-input:focus {
    border-color: var(--editor-primary);
    box-shadow: 0 0 0 3px var(--editor-primary-light);
  }

  .link-input::placeholder {
    color: var(--editor-placeholder);
  }

  .link-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border: none;
    border-radius: var(--editor-radius-md);
    background: transparent;
    color: var(--editor-text-muted);
    font-size: 11px;
    cursor: pointer;
    margin-left: 0.375rem;
    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .link-btn:hover {
    background: var(--editor-hover-bg);
    transform: translateY(-1px);
  }

  .link-btn.confirm {
    color: white;
    background: var(--editor-success);
  }

  .link-btn.confirm:hover {
    background: #059669;
    box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
  }

  .link-btn.remove {
    color: white;
    background: var(--editor-error);
  }

  .link-btn.remove:hover {
    background: #dc2626;
    box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3);
  }

  .link-btn.cancel {
    color: var(--editor-text-muted);
  }

  .link-btn.cancel:hover {
    color: var(--editor-text);
  }
`;
