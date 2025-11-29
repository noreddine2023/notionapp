/**
 * PaperNode - Research paper card node for whiteboard
 */

import { useState, useCallback, memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeResizer } from '@reactflow/node-resizer';
import { FileText, Calendar, Users, Hash, MessageSquare, Plus, Trash2, ExternalLink } from 'lucide-react';
import type { PaperNodeData, WhiteboardComment } from '../../../types/paper';
import { generateBlockId } from '../../../../editor/utils/idGenerator';

import '@reactflow/node-resizer/dist/style.css';

interface PaperNodeProps extends NodeProps<PaperNodeData> {
  onDataChange?: (id: string, data: Partial<PaperNodeData>) => void;
  onOpenPaper?: (paperId: string) => void;
}

export const PaperNode = memo(({ id, data, selected, onDataChange, onOpenPaper }: PaperNodeProps) => {
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);

  const handleAddComment = useCallback(() => {
    if (!newComment.trim()) return;
    
    const comment: WhiteboardComment = {
      id: generateBlockId(),
      content: newComment.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const updatedComments = [...(data.comments || []), comment];
    onDataChange?.(id, { comments: updatedComments });
    setNewComment('');
    setIsAddingComment(false);
  }, [id, data.comments, newComment, onDataChange]);

  const handleDeleteComment = useCallback((commentId: string) => {
    const updatedComments = (data.comments || []).filter(c => c.id !== commentId);
    onDataChange?.(id, { comments: updatedComments });
  }, [id, data.comments, onDataChange]);

  const authorsList = data.authors?.slice(0, 3).join(', ') || 'Unknown Authors';
  const hasMoreAuthors = data.authors && data.authors.length > 3;

  return (
    <>
      <NodeResizer 
        minWidth={280} 
        minHeight={180} 
        isVisible={selected}
        lineClassName="border-blue-400"
        handleClassName="h-3 w-3 bg-white border-2 border-blue-400 rounded"
      />
      
      {/* Connection handles */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500 border-2 border-white" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500 border-2 border-white" />
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500 border-2 border-white" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500 border-2 border-white" />
      
      <div 
        className={`bg-white rounded-xl shadow-lg border-2 overflow-hidden min-w-[280px] ${
          selected ? 'border-blue-400' : 'border-gray-200'
        }`}
      >
        {/* Header with icon */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 flex items-center gap-2">
          <FileText className="w-4 h-4 text-white" />
          <span className="text-xs font-medium text-blue-100">Research Paper</span>
          <button 
            onClick={() => onOpenPaper?.(data.paperId)}
            className="ml-auto p-1 hover:bg-blue-400 rounded transition-colors"
            title="Open paper"
          >
            <ExternalLink className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-gray-800 text-sm leading-tight mb-3 line-clamp-2">
            {data.title || 'Untitled Paper'}
          </h3>
          
          {/* Authors */}
          <div className="flex items-start gap-2 mb-2">
            <Users className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="text-xs text-gray-600 line-clamp-1">
              {authorsList}{hasMoreAuthors && ' et al.'}
            </span>
          </div>
          
          {/* Year */}
          {data.year && (
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-600">{data.year}</span>
            </div>
          )}
          
          {/* DOI Badge */}
          {data.doi && (
            <div className="flex items-center gap-2 mb-2">
              <Hash className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-blue-600 font-mono truncate">{data.doi}</span>
            </div>
          )}
          
          {/* Citation count */}
          {data.citationCount !== undefined && (
            <div className="mt-3 pt-2 border-t border-gray-100">
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {data.citationCount.toLocaleString()} citations
              </span>
            </div>
          )}
        </div>
        
        {/* Comments section */}
        <div className="border-t border-gray-100">
          <button
            onClick={() => setShowComments(!showComments)}
            className="w-full px-4 py-2 flex items-center gap-2 text-xs text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{data.comments?.length || 0} comments</span>
          </button>
          
          {showComments && (
            <div className="px-4 pb-4 space-y-2">
              {/* Existing comments */}
              {data.comments?.map((comment) => (
                <div key={comment.id} className="bg-yellow-50 rounded-lg p-2 relative group">
                  <p className="text-xs text-gray-700 pr-6">{comment.content}</p>
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="absolute top-1 right-1 p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded transition-all"
                  >
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </button>
                </div>
              ))}
              
              {/* Add comment */}
              {isAddingComment ? (
                <div className="space-y-2">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    autoFocus
                  />
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => {
                        setIsAddingComment(false);
                        setNewComment('');
                      }}
                      className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddComment}
                      className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingComment(true)}
                  className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600"
                >
                  <Plus className="w-3 h-3" />
                  Add comment
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
});

PaperNode.displayName = 'PaperNode';
