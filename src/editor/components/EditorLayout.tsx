import React, { useState, useCallback, useRef } from 'react';
import type { JSONContent } from '@tiptap/core';
import { TextEditor } from './TextEditor';
import { TableOfContents } from './TableOfContents';
import { CommentsSidebar } from './CommentsSidebar';
import { usePersistence } from '../hooks/usePersistence';
import type { EditorLayoutProps, TextEditorRef, Comment, TocHeading, SaveStatus } from '../types/editor';
import '../styles/toc.css';
import '../styles/comments.css';

/**
 * Full editor layout with sidebars for TOC and comments
 */
export const EditorLayout: React.FC<EditorLayoutProps> = ({
  initialValue,
  value,
  onChange,
  readOnly = false,
  placeholder,
  autoFocus = false,
  debounceMs = 300,
  onImageUpload,
  onMentionSearch,
  showToc = true,
  showComments = true,
  documentId,
}) => {
  const editorRef = useRef<TextEditorRef>(null);
  const [headings, setHeadings] = useState<TocHeading[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);

  // Get editor instance for persistence
  const editor = editorRef.current?.getEditor() ?? null;

  // Set up persistence
  const { status, lastSaved } = usePersistence(editor, {
    documentId,
    skipInitialLoad: !documentId,
  });

  // Extract headings from content for TOC
  const extractHeadings = useCallback((content: JSONContent) => {
    const newHeadings: TocHeading[] = [];
    let pos = 0;

    const traverse = (node: JSONContent) => {
      if (node.type === 'heading' && node.attrs?.level) {
        const text = getNodeText(node);
        if (text) {
          newHeadings.push({
            id: `heading-${pos}`,
            text,
            level: node.attrs.level,
            pos,
          });
        }
      }
      pos += 1;
      if (node.content) {
        node.content.forEach(traverse);
      }
    };

    traverse(content);
    
    // Only update if headings actually changed
    setHeadings((prevHeadings) => {
      const isSame = prevHeadings.length === newHeadings.length && 
        prevHeadings.every((h, i) => 
          h.id === newHeadings[i]?.id && 
          h.text === newHeadings[i]?.text && 
          h.level === newHeadings[i]?.level
        );
      return isSame ? prevHeadings : newHeadings;
    });
  }, []);

  // Handle content changes
  const handleChange = useCallback((content: JSONContent) => {
    extractHeadings(content);
    onChange?.(content);
  }, [onChange, extractHeadings]);

  // Handle heading click in TOC
  const handleHeadingClick = useCallback((heading: TocHeading) => {
    const editor = editorRef.current?.getEditor();
    if (!editor) return;

    // Find the heading position in the document
    let found = false;
    let headingCount = 0;

    editor.state.doc.descendants((node, pos) => {
      if (found) return false;
      
      if (node.type.name === 'heading') {
        if (headingCount === headings.indexOf(heading)) {
          editor.commands.setTextSelection(pos);
          editor.commands.scrollIntoView();
          found = true;
          return false;
        }
        headingCount++;
      }
    });
  }, [headings]);

  // Handle adding a comment
  const handleAddComment = useCallback((text: string) => {
    const editor = editorRef.current?.getEditor();
    if (!editor) return;

    const { from, to } = editor.state.selection;
    if (from === to) return; // No selection

    const id = `comment-${Date.now()}`;
    const newComment: Comment = {
      id,
      text,
      author: {
        id: 'current-user',
        name: 'You',
      },
      createdAt: new Date(),
      resolved: false,
      replies: [],
      from,
      to,
    };

    // Add comment mark to the selected text
    editor.chain().focus().setComment(id).run();

    setComments((prev) => [...prev, newComment]);
  }, []);

  // Handle resolving a comment
  const handleResolveComment = useCallback((commentId: string) => {
    const editor = editorRef.current?.getEditor();
    if (!editor) return;

    editor.commands.resolveComment(commentId);
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, resolved: true } : c))
    );
  }, []);

  // Handle deleting a comment
  const handleDeleteComment = useCallback((commentId: string) => {
    const editor = editorRef.current?.getEditor();
    if (!editor) return;

    editor.commands.removeComment(commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }, []);

  // Handle comment click
  const handleCommentClick = useCallback((comment: Comment) => {
    const editor = editorRef.current?.getEditor();
    if (!editor) return;

    setSelectedCommentId(comment.id);
    
    // Navigate to the comment's position
    editor.commands.setTextSelection({ from: comment.from, to: comment.to });
    editor.commands.scrollIntoView();
  }, []);

  // Handle adding a reply
  const handleAddReply = useCallback((commentId: string, text: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? {
              ...c,
              replies: [
                ...c.replies,
                {
                  id: `reply-${Date.now()}`,
                  text,
                  author: {
                    id: 'current-user',
                    name: 'You',
                  },
                  createdAt: new Date(),
                },
              ],
            }
          : c
      )
    );
  }, []);

  return (
    <div className="editor-layout">
      {/* Table of Contents Sidebar */}
      {showToc && (
        <TableOfContents
          headings={headings}
          onHeadingClick={handleHeadingClick}
        />
      )}

      {/* Main Editor */}
      <div className="editor-main">
        {/* Save status indicator */}
        {documentId && (
          <div className="editor-status-bar">
            <SaveStatusIndicator status={status} lastSaved={lastSaved} />
          </div>
        )}

        <TextEditor
          ref={editorRef}
          initialValue={initialValue}
          value={value}
          onChange={handleChange}
          readOnly={readOnly}
          placeholder={placeholder}
          autoFocus={autoFocus}
          debounceMs={debounceMs}
          onImageUpload={onImageUpload}
          onMentionSearch={onMentionSearch}
        />
      </div>

      {/* Comments Sidebar */}
      {showComments && (
        <CommentsSidebar
          comments={comments}
          selectedCommentId={selectedCommentId}
          onCommentClick={handleCommentClick}
          onAddComment={handleAddComment}
          onResolveComment={handleResolveComment}
          onDeleteComment={handleDeleteComment}
          onAddReply={handleAddReply}
          hasSelection={editor ? editor.state.selection.from !== editor.state.selection.to : false}
        />
      )}

      <style>{`
        .editor-layout {
          display: flex;
          height: 100%;
          min-height: 500px;
          background: var(--editor-bg);
        }

        .editor-main {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          background: var(--editor-bg);
          position: relative;
        }

        .editor-main::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 120px;
          background: linear-gradient(180deg, var(--editor-bg-secondary) 0%, transparent 100%);
          pointer-events: none;
          z-index: 0;
          opacity: 0.5;
        }

        .editor-status-bar {
          padding: 0.625rem 1.25rem;
          border-bottom: 1px solid var(--editor-border);
          display: flex;
          justify-content: flex-end;
          background: var(--editor-bg-secondary);
          position: relative;
          z-index: 1;
        }
      `}</style>
    </div>
  );
};

/**
 * Save status indicator component
 */
const SaveStatusIndicator: React.FC<{
  status: SaveStatus;
  lastSaved: Date | null;
}> = ({ status, lastSaved }) => {
  const getStatusText = () => {
    switch (status) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return lastSaved ? `Saved ${formatTimeAgo(lastSaved)}` : 'Saved';
      case 'error':
        return 'Save failed';
      default:
        return '';
    }
  };

  return (
    <span className={`save-status ${status}`}>
      {status === 'saving' && <span className="save-spinner">⏳</span>}
      {status === 'saved' && <span className="save-check">✓</span>}
      {status === 'error' && <span className="save-error">⚠</span>}
      {getStatusText()}
    </span>
  );
};

/**
 * Get text content from a node
 */
function getNodeText(node: JSONContent): string {
  if (node.text) return node.text;
  if (node.content) {
    return node.content.map(getNodeText).join('');
  }
  return '';
}

/**
 * Format time ago
 */
function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 120) return '1 minute ago';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 7200) return '1 hour ago';
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return date.toLocaleDateString();
}
