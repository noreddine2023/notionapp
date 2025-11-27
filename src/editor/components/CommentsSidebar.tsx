import React, { useState, useCallback } from 'react';
import type { Comment, CommentReply } from '../types/editor';

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

/**
 * Comments sidebar component
 * Displays all comments and allows adding new ones
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
  const [showResolved, setShowResolved] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Filter comments based on resolved state
  const filteredComments = showResolved
    ? comments
    : comments.filter((c) => !c.resolved);

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

  // Format date
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

  return (
    <div className="comments-sidebar">
      <div className="comments-header">
        <h3>Comments</h3>
        <span className="comments-count">{comments.length}</span>
      </div>

      {/* Resolved toggle */}
      <div className="resolved-toggle">
        <input
          type="checkbox"
          id="show-resolved"
          checked={showResolved}
          onChange={(e) => setShowResolved(e.target.checked)}
        />
        <label htmlFor="show-resolved">Show resolved</label>
      </div>

      {/* Comments list */}
      <div className="comments-list">
        {filteredComments.length === 0 ? (
          <div className="comments-empty">
            <span className="comments-empty-icon">💬</span>
            <p>No comments yet</p>
            <p>Select text and add a comment</p>
          </div>
        ) : (
          filteredComments.map((comment) => (
            <div
              key={comment.id}
              className={`comment-card ${comment.resolved ? 'resolved' : ''} ${
                selectedCommentId === comment.id ? 'selected' : ''
              }`}
              onClick={() => onCommentClick(comment)}
            >
              {/* Comment header */}
              <div className="comment-header">
                <div className="comment-avatar">
                  {comment.author.avatar ? (
                    <img src={comment.author.avatar} alt="" />
                  ) : (
                    getInitials(comment.author.name)
                  )}
                </div>
                <div className="comment-info">
                  <p className="comment-author">{comment.author.name}</p>
                  <p className="comment-date">{formatDate(comment.createdAt)}</p>
                </div>
                <div className="comment-actions">
                  <button
                    type="button"
                    className="comment-action-btn resolve-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onResolveComment(comment.id);
                    }}
                    title={comment.resolved ? 'Unresolve' : 'Resolve'}
                    aria-label={comment.resolved ? 'Unresolve' : 'Resolve'}
                  >
                    {comment.resolved ? '↩' : '✓'}
                  </button>
                  <button
                    type="button"
                    className="comment-action-btn delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteComment(comment.id);
                    }}
                    title="Delete"
                    aria-label="Delete"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Comment body */}
              <div className="comment-body">
                <p className="comment-text">{comment.text}</p>
              </div>

              {/* Replies */}
              {comment.replies.length > 0 && (
                <div className="comment-replies">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="reply-item">
                      <div className="reply-avatar">
                        {reply.author.avatar ? (
                          <img src={reply.author.avatar} alt="" />
                        ) : (
                          getInitials(reply.author.name)
                        )}
                      </div>
                      <div className="reply-content">
                        <div className="reply-header">
                          <p className="reply-author">{reply.author.name}</p>
                          <p className="reply-date">{formatDate(reply.createdAt)}</p>
                        </div>
                        <p className="reply-text">{reply.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply input */}
              {replyingTo === comment.id ? (
                <div
                  className="reply-input-container"
                  onClick={(e) => e.stopPropagation()}
                >
                  <textarea
                    className="reply-input"
                    placeholder="Write a reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    autoFocus
                    rows={2}
                  />
                  <div className="reply-actions">
                    <button
                      type="button"
                      className="reply-btn"
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyText('');
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="reply-btn primary"
                      onClick={() => handleAddReply(comment.id)}
                      disabled={!replyText.trim()}
                    >
                      Reply
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="reply-input-container"
                  onClick={(e) => {
                    e.stopPropagation();
                    setReplyingTo(comment.id);
                  }}
                >
                  <input
                    type="text"
                    className="reply-input"
                    placeholder="Reply..."
                    readOnly
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add comment form */}
      {hasSelection && (
        <div className="add-comment-form">
          <textarea
            className="add-comment-textarea"
            placeholder="Add a comment..."
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            rows={3}
          />
          <div className="add-comment-actions">
            <button
              type="button"
              className="add-comment-btn"
              onClick={handleAddComment}
              disabled={!newCommentText.trim()}
            >
              Add Comment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentsSidebar;
