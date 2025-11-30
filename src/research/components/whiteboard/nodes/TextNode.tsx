/**
 * TextNode - Text box node for whiteboard
 */

import { useState, useCallback, memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeResizer } from '@reactflow/node-resizer';
import { Bold, Italic, Type } from 'lucide-react';
import type { TextNodeData } from '../../../types/paper';
import { useNodeDataChange } from '../Whiteboard';

import '@reactflow/node-resizer/dist/style.css';

const FONT_SIZES = {
  small: 'text-sm',
  medium: 'text-base',
  large: 'text-xl',
};

export const TextNode = memo(({ id, data, selected }: NodeProps<TextNodeData>) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(data.content || '');
  const [showFormatting, setShowFormatting] = useState(false);

  const onDataChange = useNodeDataChange();

  const fontSize = FONT_SIZES[data.fontSize || 'medium'];

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (content !== data.content && onDataChange) {
      onDataChange(id, { content });
    }
  }, [id, content, data.content, onDataChange]);

  const toggleBold = useCallback(() => {
    if (onDataChange) {
      onDataChange(id, { bold: !data.bold });
    }
  }, [id, data.bold, onDataChange]);

  const toggleItalic = useCallback(() => {
    if (onDataChange) {
      onDataChange(id, { italic: !data.italic });
    }
  }, [id, data.italic, onDataChange]);

  const changeFontSize = useCallback((size: 'small' | 'medium' | 'large') => {
    if (onDataChange) {
      onDataChange(id, { fontSize: size });
    }
  }, [id, onDataChange]);

  return (
    <>
      <NodeResizer 
        minWidth={100} 
        minHeight={40} 
        isVisible={selected}
        lineClassName="border-blue-400"
        handleClassName="h-3 w-3 bg-white border-2 border-blue-400 rounded"
      />
      
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-blue-500 border-2 border-white" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-blue-500 border-2 border-white" />
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-blue-500 border-2 border-white" />
      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-blue-500 border-2 border-white" />
      
      <div 
        className={`bg-white rounded-lg min-w-[100px] min-h-[40px] h-full relative ${
          selected ? 'ring-2 ring-blue-400 shadow-md' : ''
        }`}
      >
        {/* Formatting toolbar */}
        {selected && (
          <div className="absolute -top-10 left-0 flex items-center gap-1 bg-white rounded-lg shadow-lg border border-gray-200 px-1.5 py-1">
            <button
              onClick={toggleBold}
              className={`p-1 rounded hover:bg-gray-100 ${data.bold ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={toggleItalic}
              className={`p-1 rounded hover:bg-gray-100 ${data.italic ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <div className="relative">
              <button
                onClick={() => setShowFormatting(!showFormatting)}
                className="p-1 rounded hover:bg-gray-100 text-gray-600"
                title="Font size"
              >
                <Type className="w-4 h-4" />
              </button>
              {showFormatting && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  {(['small', 'medium', 'large'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        changeFontSize(size);
                        setShowFormatting(false);
                      }}
                      className={`w-full px-3 py-1 text-left text-sm hover:bg-gray-100 ${
                        data.fontSize === size ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Content */}
        <div className="p-2 h-full">
          {isEditing ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setContent(data.content || '');
                  setIsEditing(false);
                }
              }}
              className={`w-full h-full bg-transparent resize-none outline-none ${fontSize} ${
                data.bold ? 'font-bold' : ''
              } ${data.italic ? 'italic' : ''}`}
              placeholder="Enter text..."
              autoFocus
            />
          ) : (
            <div 
              onClick={() => setIsEditing(true)}
              className={`w-full h-full cursor-text whitespace-pre-wrap ${fontSize} ${
                data.bold ? 'font-bold' : ''
              } ${data.italic ? 'italic' : ''} ${!content ? 'text-gray-400' : 'text-gray-800'}`}
            >
              {content || 'Click to add text...'}
            </div>
          )}
        </div>
      </div>
    </>
  );
});

TextNode.displayName = 'TextNode';
