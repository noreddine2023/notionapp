import React, { useCallback, useState } from 'react';
import type { Editor } from '@tiptap/core';

interface TopToolbarProps {
  editor: Editor;
  onImageUpload?: () => void;
}

// SVG Icons as components for clean rendering
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);

const UndoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
  </svg>
);

const RedoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/>
  </svg>
);

const PrinterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/>
  </svg>
);

const PaintRollerIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="16" height="6" x="2" y="2" rx="2"/><path d="M10 16v6"/><rect width="8" height="4" x="6" y="12" rx="1"/>
  </svg>
);

const MinusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="M12 5v14"/>
  </svg>
);

const BoldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 12a4 4 0 0 0 0-8H6v8"/><path d="M15 20a4 4 0 0 0 0-8H6v8Z"/>
  </svg>
);

const ItalicIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" x2="10" y1="4" y2="4"/><line x1="14" x2="5" y1="20" y2="20"/><line x1="15" x2="9" y1="4" y2="20"/>
  </svg>
);

const UnderlineIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" x2="20" y1="20" y2="20"/>
  </svg>
);

const TypeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/>
  </svg>
);

const HighlighterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/>
  </svg>
);

const LinkIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);

const MessageSquareIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const ImageIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
  </svg>
);

const AlignLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="21" x2="3" y1="6" y2="6"/><line x1="15" x2="3" y1="12" y2="12"/><line x1="17" x2="3" y1="18" y2="18"/>
  </svg>
);

const AlignCenterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="21" x2="3" y1="6" y2="6"/><line x1="17" x2="7" y1="12" y2="12"/><line x1="19" x2="5" y1="18" y2="18"/>
  </svg>
);

const AlignRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="9" y1="12" y2="12"/><line x1="21" x2="7" y1="18" y2="18"/>
  </svg>
);

const AlignJustifyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="3" y1="12" y2="12"/><line x1="21" x2="3" y1="18" y2="18"/>
  </svg>
);

const ListIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/>
  </svg>
);

const ListOrderedIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="10" x2="21" y1="6" y2="6"/><line x1="10" x2="21" y1="12" y2="12"/><line x1="10" x2="21" y1="18" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>
  </svg>
);

const PilcrowIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 4v16"/><path d="M17 4v16"/><path d="M19 4H9.5a4.5 4.5 0 0 0 0 9H13"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

/**
 * Modern Word-like top toolbar with formatting controls
 */
export const TopToolbar: React.FC<TopToolbarProps> = ({ editor, onImageUpload }) => {
  const [zoom] = useState(100);
  const [fontSize, setFontSize] = useState(20);

  // Get current heading text
  const getCurrentHeading = (): string => {
    if (editor.isActive('heading', { level: 1 })) return 'Heading 1';
    if (editor.isActive('heading', { level: 2 })) return 'Heading 2';
    if (editor.isActive('heading', { level: 3 })) return 'Heading 3';
    return 'Paragraph';
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

  // Handle highlight
  const handleHighlight = useCallback(() => {
    editor.chain().focus().toggleHighlight({ color: '#bfdbfe' }).run();
  }, [editor]);

  return (
    <div className="modern-toolbar">
      {/* Row 1: Main Toolbar */}
      <div className="toolbar-row">
        {/* Left: Menu & Actions */}
        <div className="toolbar-section toolbar-left">
          <button className="menu-button" title="Search Menus">
            <SearchIcon />
            <span>Menus</span>
          </button>
          <div className="toolbar-separator" />
          <ToolbarIconButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo (Ctrl+Z)"
            icon={<UndoIcon />}
          />
          <ToolbarIconButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo (Ctrl+Shift+Z)"
            icon={<RedoIcon />}
          />
          <ToolbarIconButton
            onClick={() => window.print()}
            title="Print"
            icon={<PrinterIcon />}
          />
          <ToolbarIconButton
            onClick={() => {}}
            title="Format Painter"
            icon={<PaintRollerIcon />}
          />
        </div>

        {/* Center: Formatting Tools */}
        <div className="toolbar-section toolbar-center">
          {/* Zoom / View Controls */}
          <div className="toolbar-dropdown">
            <span>{zoom}%</span>
            <ChevronDownIcon />
          </div>

          {/* Text Style Dropdowns */}
          <div className="toolbar-dropdown">
            <span>{getCurrentHeading()}</span>
            <ChevronDownIcon />
          </div>
          <div className="toolbar-dropdown">
            <span>Arial</span>
            <ChevronDownIcon />
          </div>

          {/* Font Size */}
          <div className="font-size-control">
            <button
              className="font-size-btn"
              onClick={() => setFontSize((prev) => Math.max(8, prev - 2))}
              title="Decrease font size"
            >
              <MinusIcon />
            </button>
            <span className="font-size-value">{fontSize}</span>
            <button
              className="font-size-btn"
              onClick={() => setFontSize((prev) => Math.min(72, prev + 2))}
              title="Increase font size"
            >
              <PlusIcon />
            </button>
          </div>

          <div className="toolbar-separator" />

          {/* Formatting Buttons */}
          <ToolbarIconButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold (Ctrl+B)"
            icon={<BoldIcon />}
          />
          <ToolbarIconButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic (Ctrl+I)"
            icon={<ItalicIcon />}
          />
          <ToolbarIconButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="Underline (Ctrl+U)"
            icon={<UnderlineIcon />}
          />
          <ToolbarIconButton
            onClick={() => {}}
            title="Text Color"
            icon={<TypeIcon />}
          />
          <ToolbarIconButton
            onClick={handleHighlight}
            isActive={editor.isActive('highlight')}
            title="Highlight Selection"
            icon={<HighlighterIcon />}
            className="highlight-btn"
          />

          <div className="toolbar-separator" />

          <ToolbarIconButton
            onClick={handleLinkInsert}
            isActive={editor.isActive('link')}
            title="Insert Link (Ctrl+K)"
            icon={<LinkIcon />}
          />
          <ToolbarIconButton
            onClick={() => {}}
            title="Add Comment"
            icon={<MessageSquareIcon />}
          />
          {onImageUpload && (
            <ToolbarIconButton
              onClick={onImageUpload}
              title="Insert Image"
              icon={<ImageIcon />}
            />
          )}

          <div className="toolbar-separator" />

          <ToolbarIconButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            title="Align Left"
            icon={<AlignLeftIcon />}
          />
          <ToolbarIconButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            title="Align Center"
            icon={<AlignCenterIcon />}
          />
          <ToolbarIconButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            title="Align Right"
            icon={<AlignRightIcon />}
          />
          <ToolbarIconButton
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            isActive={editor.isActive({ textAlign: 'justify' })}
            title="Justify"
            icon={<AlignJustifyIcon />}
          />

          <div className="toolbar-separator" />

          <ToolbarIconButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
            icon={<ListIcon />}
          />
          <ToolbarIconButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Numbered List"
            icon={<ListOrderedIcon />}
          />
          <ToolbarIconButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Paragraph Settings"
            icon={<PilcrowIcon />}
          />
        </div>
      </div>

      <style>{`
        .modern-toolbar {
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .toolbar-row {
          display: flex;
          align-items: center;
          padding: 0.5rem 1rem;
          gap: 1rem;
          overflow-x: auto;
        }

        .toolbar-row::-webkit-scrollbar {
          display: none;
        }

        .toolbar-section {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .toolbar-left {
          padding-right: 1rem;
          border-right: 1px solid #e2e8f0;
          flex-shrink: 0;
        }

        .toolbar-center {
          flex-wrap: wrap;
          flex-shrink: 0;
        }

        .menu-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.375rem 0.75rem;
          background: #f1f5f9;
          border: none;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s;
        }

        .menu-button:hover {
          background: #e2e8f0;
        }

        .toolbar-separator {
          width: 1px;
          height: 1.5rem;
          background: #e2e8f0;
          margin: 0 0.25rem;
        }

        .toolbar-dropdown {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.375rem 0.5rem;
          background: #f8fafc;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s;
        }

        .toolbar-dropdown:hover {
          background: #f1f5f9;
        }

        .font-size-control {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.5rem;
          background: #f8fafc;
          border-radius: 0.25rem;
        }

        .font-size-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          background: transparent;
          border: none;
          cursor: pointer;
          color: #64748b;
          transition: color 0.2s;
        }

        .font-size-btn:hover {
          color: #1e293b;
        }

        .font-size-value {
          font-size: 0.875rem;
          font-weight: 500;
          color: #475569;
          min-width: 1.5rem;
          text-align: center;
        }

        .toolbar-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          padding: 0;
          background: transparent;
          border: none;
          border-radius: 0.25rem;
          color: #64748b;
          cursor: pointer;
          transition: all 0.15s;
        }

        .toolbar-icon-btn:hover:not(:disabled) {
          background: #f1f5f9;
          color: #1e293b;
        }

        .toolbar-icon-btn.active {
          background: #dbeafe;
          color: #2563eb;
        }

        .toolbar-icon-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .toolbar-icon-btn.highlight-btn:hover {
          background: #dbeafe;
          color: #2563eb;
        }

        @media (max-width: 768px) {
          .toolbar-row {
            padding: 0.375rem 0.5rem;
            gap: 0.5rem;
          }

          .toolbar-left {
            padding-right: 0.5rem;
          }

          .menu-button span {
            display: none;
          }

          .toolbar-dropdown span {
            max-width: 4rem;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Toolbar icon button component
 */
const ToolbarIconButton: React.FC<{
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title?: string;
  icon: React.ReactNode;
  className?: string;
}> = ({ onClick, isActive, disabled, title, icon, className = '' }) => (
  <button
    type="button"
    className={`toolbar-icon-btn ${isActive ? 'active' : ''} ${className}`}
    onClick={onClick}
    disabled={disabled}
    title={title}
    aria-label={title}
  >
    {icon}
  </button>
);
