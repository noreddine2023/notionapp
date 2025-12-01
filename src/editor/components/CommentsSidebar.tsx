import React, { useState, useCallback } from 'react';
import type { Comment } from '../types/editor';

// Icons
const MoreVerticalIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
  </svg>
);

const Trash2Icon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
  </svg>
);

const SmileIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/>
  </svg>
);

const MessageCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
  </svg>
);

// Demo comments data matching the reference design (used when no comments prop provided)
interface DemoComment {
  id: string;
  user: string;
  avatar: string;
  color: string;
  time: string;
  text: string;
  replies: number;
}

const DEMO_COMMENTS: DemoComment[] = [
  {
    id: '1',
    user: 'X_AE_A-13',
    avatar: 'XB',
    color: 'bg-slate-800',
    time: '3d ago',
    text: 'Quis fermentum tristique ultrices eleifend tincidunt et. Volutpat elementum hendrerit.',
    replies: 12,
  },
  {
    id: '2',
    user: 'Saylor Twift',
    avatar: 'ST',
    color: 'bg-red-600',
    time: '4d ago',
    text: 'faucibus lectus orci in tortor amet. Nisi convallis tortor in sed. Fermentum et quisque elit imperdiet id.',
    replies: 7,
  },
  {
    id: '3',
    user: 'Oarack Babama',
    avatar: 'OB',
    color: 'bg-emerald-600',
    time: '1w ago',
    text: 'Quis fermentum!!',
    replies: 0,
  },
];

interface CommentsSidebarProps {
  comments: Comment[];
  selectedCommentId: string | null;
  onCommentClick: (comment: Comment) => void;
  onAddComment: (text: string) => void;
  onResolveComment: (commentId: string) => void;
  onDeleteComment: (commentId: string) => void;
  onAddReply: (commentId: string, text: string) => void;
  hasSelection: boolean;
}

// Avatar color mapping
const getAvatarColor = (color: string): string => {
  const colorMap: Record<string, string> = {
    'bg-slate-800': '#1e293b',
    'bg-red-600': '#dc2626',
    'bg-emerald-600': '#059669',
    'bg-blue-600': '#2563eb',
    'bg-purple-600': '#9333ea',
  };
  return colorMap[color] || '#6366f1';
};

// Format date for display
const formatDate = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

// Get initials from name
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Modern comments sidebar matching the reference design
 * Supports both real comments (via props) and demo comments for display
 */
export const CommentsSidebar: React.FC<CommentsSidebarProps> = ({
  comments,
  selectedCommentId,
  onCommentClick,
  onAddComment,
  onResolveComment,
  onDeleteComment,
  onAddReply,
  hasSelection,
}) => {
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Use real comments if available, otherwise show demo comments
  const hasRealComments = comments.length > 0;

  // Handle new comment submission
  const handleAddComment = useCallback(() => {
    if (newCommentText.trim() && hasSelection) {
      onAddComment(newCommentText.trim());
      setNewCommentText('');
    }
  }, [newCommentText, hasSelection, onAddComment]);

  // Handle reply submission
  const handleAddReply = useCallback(
    (commentId: string) => {
      if (replyText.trim()) {
        onAddReply(commentId, replyText.trim());
        setReplyText('');
        setReplyingTo(null);
      }
    },
    [replyText, onAddReply]
  );

  return (
    <aside className="comments-sidebar-modern">
      {/* Header */}
      <div className="comments-header-modern">
        <h3 className="comments-title">All Comments</h3>
        <button className="more-btn" title="More options">
          <MoreVerticalIcon />
        </button>
      </div>

      {/* Comments list */}
      <div className="comments-list-modern">
        {/* Show real comments if available */}
        {hasRealComments ? (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`comment-card-modern ${selectedCommentId === comment.id ? 'selected' : ''} ${comment.resolved ? 'resolved' : ''}`}
              onClick={() => onCommentClick(comment)}
            >
              <div className="comment-top">
                <div className="comment-user-info">
                  <div
                    className="comment-avatar-modern"
                    style={{ backgroundColor: '#6366f1' }}
                  >
                    {getInitials(comment.author.name)}
                  </div>
                  <div className="comment-meta">
                    <div className="comment-username">{comment.author.name}</div>
                    <div className="comment-time">{formatDate(comment.createdAt)}</div>
                  </div>
                </div>
                <button className="comment-more-btn">
                  <MoreVerticalIcon />
                </button>
              </div>

              <p className="comment-text-modern">{comment.text}</p>

              <div className="comment-footer">
                <span
                  className="comment-replies-link"
                  onClick={(e) => {
                    e.stopPropagation();
                    setReplyingTo(replyingTo === comment.id ? null : comment.id);
                  }}
                >
                  {comment.replies.length > 0 ? `${comment.replies.length} replies` : 'Reply'}
                </span>

                <div className="comment-actions-modern">
                  <button
                    className="action-btn delete"
                    title="Delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteComment(comment.id);
                    }}
                  >
                    <Trash2Icon />
                  </button>
                  <button
                    className="action-btn resolve"
                    title="Resolve"
                    onClick={(e) => {
                      e.stopPropagation();
                      onResolveComment(comment.id);
                    }}
                  >
                    <CheckCircleIcon />
                  </button>
                  <button className="action-btn react" title="React">
                    <SmileIcon />
                  </button>
                  <button
                    className="action-btn reply"
                    title="Reply"
                    onClick={(e) => {
                      e.stopPropagation();
                      setReplyingTo(comment.id);
                    }}
                  >
                    <MessageCircleIcon />
                  </button>
                </div>
              </div>

              {/* Reply input */}
              {replyingTo === comment.id && (
                <div className="reply-input-wrapper" onClick={(e) => e.stopPropagation()}>
                  <textarea
                    className="reply-textarea"
                    placeholder="Write a reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    autoFocus
                    rows={2}
                  />
                  <div className="reply-buttons">
                    <button className="reply-cancel" onClick={() => setReplyingTo(null)}>
                      Cancel
                    </button>
                    <button
                      className="reply-submit"
                      onClick={() => handleAddReply(comment.id)}
                      disabled={!replyText.trim()}
                    >
                      Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          /* Show demo comments when no real comments exist */
          DEMO_COMMENTS.map((comment) => (
            <div key={comment.id} className="comment-card-modern">
              <div className="comment-top">
                <div className="comment-user-info">
                  <div
                    className="comment-avatar-modern"
                    style={{ backgroundColor: getAvatarColor(comment.color) }}
                  >
                    {comment.avatar}
                  </div>
                  <div className="comment-meta">
                    <div className="comment-username">{comment.user}</div>
                    <div className="comment-time">{comment.time}</div>
                  </div>
                </div>
                <button className="comment-more-btn">
                  <MoreVerticalIcon />
                </button>
              </div>

              <p className="comment-text-modern">{comment.text}</p>

              <div className="comment-footer">
                <span className="comment-replies-link">
                  {comment.replies > 0 ? `${comment.replies} replies` : 'Reply'}
                </span>

                <div className="comment-actions-modern">
                  <button className="action-btn delete" title="Delete">
                    <Trash2Icon />
                  </button>
                  <button className="action-btn resolve" title="Resolve">
                    <CheckCircleIcon />
                  </button>
                  <button className="action-btn react" title="React">
                    <SmileIcon />
                  </button>
                  <button className="action-btn reply" title="Reply">
                    <MessageCircleIcon />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add comment form */}
      {hasSelection && (
        <div className="add-comment-form-modern">
          <textarea
            className="add-comment-input"
            placeholder="Add a comment..."
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            rows={3}
          />
          <button
            className="add-comment-submit"
            onClick={handleAddComment}
            disabled={!newCommentText.trim()}
          >
            Add Comment
          </button>
        </div>
      )}

      <style>{`
        .comments-sidebar-modern {
          width: 20rem;
          background: #ffffff;
          border-left: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          height: 100%;
          flex-shrink: 0;
          overflow: hidden;
        }

        .comments-header-modern {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          border-bottom: 1px solid #f1f5f9;
          background: #ffffff;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .comments-title {
          font-size: 1rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }

        .more-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.25rem;
          background: transparent;
          border: none;
          border-radius: 0.25rem;
          color: #94a3b8;
          cursor: pointer;
          transition: color 0.15s;
        }

        .more-btn:hover {
          color: #475569;
        }

        .comments-list-modern {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .comment-card-modern {
          background: #ffffff;
          padding: 1rem;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          border: 1px solid #f1f5f9;
          transition: all 0.2s;
          cursor: pointer;
        }

        .comment-card-modern:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          border-color: #e2e8f0;
        }

        .comment-card-modern.selected {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .comment-card-modern.resolved {
          opacity: 0.6;
        }

        .comment-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .comment-user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .comment-avatar-modern {
          width: 2rem;
          height: 2rem;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: 700;
          flex-shrink: 0;
        }

        .comment-meta {
          display: flex;
          flex-direction: column;
        }

        .comment-username {
          font-size: 0.875rem;
          font-weight: 700;
          color: #1e293b;
        }

        .comment-time {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .comment-more-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.125rem;
          background: transparent;
          border: none;
          border-radius: 0.25rem;
          color: #cbd5e1;
          cursor: pointer;
          opacity: 0;
          transition: all 0.15s;
        }

        .comment-card-modern:hover .comment-more-btn {
          opacity: 1;
        }

        .comment-more-btn:hover {
          color: #64748b;
        }

        .comment-text-modern {
          font-size: 0.875rem;
          color: #475569;
          line-height: 1.5;
          margin: 0 0 0.75rem 0;
        }

        .comment-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 0.75rem;
          border-top: 1px solid #f8fafc;
          margin-top: 0.5rem;
        }

        .comment-replies-link {
          font-size: 0.75rem;
          font-weight: 500;
          color: #2563eb;
          cursor: pointer;
        }

        .comment-replies-link:hover {
          text-decoration: underline;
        }

        .comment-actions-modern {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          transition: color 0.15s;
        }

        .action-btn.delete:hover {
          color: #ef4444;
        }

        .action-btn.resolve:hover {
          color: #22c55e;
        }

        .action-btn.react:hover {
          color: #f59e0b;
        }

        .action-btn.reply:hover {
          color: #2563eb;
        }

        .reply-input-wrapper {
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid #f1f5f9;
        }

        .reply-textarea {
          width: 100%;
          padding: 0.5rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          font-size: 0.8125rem;
          font-family: inherit;
          resize: none;
          color: #1e293b;
        }

        .reply-textarea:focus {
          outline: none;
          border-color: #2563eb;
        }

        .reply-buttons {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
          margin-top: 0.5rem;
        }

        .reply-cancel, .reply-submit {
          padding: 0.375rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 500;
          border-radius: 0.25rem;
          cursor: pointer;
          transition: all 0.15s;
        }

        .reply-cancel {
          background: transparent;
          border: 1px solid #e2e8f0;
          color: #64748b;
        }

        .reply-cancel:hover {
          background: #f1f5f9;
        }

        .reply-submit {
          background: #2563eb;
          border: none;
          color: #ffffff;
        }

        .reply-submit:hover:not(:disabled) {
          background: #1d4ed8;
        }

        .reply-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .add-comment-form-modern {
          padding: 1rem;
          border-top: 1px solid #e2e8f0;
          background: #ffffff;
        }

        .add-comment-input {
          width: 100%;
          padding: 0.75rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-family: inherit;
          resize: none;
          color: #1e293b;
          transition: all 0.2s;
        }

        .add-comment-input:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .add-comment-input::placeholder {
          color: #94a3b8;
        }

        .add-comment-submit {
          width: 100%;
          margin-top: 0.75rem;
          padding: 0.625rem 1rem;
          background: #2563eb;
          border: none;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #ffffff;
          cursor: pointer;
          transition: background 0.2s;
        }

        .add-comment-submit:hover:not(:disabled) {
          background: #1d4ed8;
        }

        .add-comment-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 1024px) {
          .comments-sidebar-modern {
            display: none;
          }
        }
      `}</style>
    </aside>
  );
};

export default CommentsSidebar;
