/**
 * StickyNode - Sticky note node for whiteboard
 */

import { useState, useCallback, memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeResizer } from '@reactflow/node-resizer';
import type { StickyNodeData } from '../../../types/paper';
import { useNodeDataChange } from '../Whiteboard';

import '@reactflow/node-resizer/dist/style.css';

const STICKY_COLORS = [
  { name: 'Yellow', bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-900' },
  { name: 'Green', bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-900' },
  { name: 'Blue', bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-900' },
  { name: 'Pink', bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-900' },
  { name: 'Purple', bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-900' },
  { name: 'Orange', bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-900' },
];

export const StickyNode = memo(({ id, data, selected }: NodeProps<StickyNodeData>) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(data.content || '');
  const [showColorPicker, setShowColorPicker] = useState(false);

  const onDataChange = useNodeDataChange();

  const colorConfig = STICKY_COLORS.find(c => c.name.toLowerCase() === (data.color || 'yellow').toLowerCase()) 
    || STICKY_COLORS[0];

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (content !== data.content && onDataChange) {
      onDataChange(id, { content });
    }
  }, [id, content, data.content, onDataChange]);

  const handleColorChange = useCallback((colorName: string) => {
    if (onDataChange) {
      onDataChange(id, { color: colorName.toLowerCase() });
    }
    setShowColorPicker(false);
  }, [id, onDataChange]);

  return (
    <>
      <NodeResizer 
        minWidth={150} 
        minHeight={100} 
        isVisible={selected}
        lineClassName="border-gray-400"
        handleClassName="h-3 w-3 bg-white border-2 border-gray-400 rounded"
      />
      
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-gray-400 border-2 border-white" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-gray-400 border-2 border-white" />
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-gray-400 border-2 border-white" />
      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-gray-400 border-2 border-white" />
      
      <div 
        className={`${colorConfig.bg} ${colorConfig.border} border-2 rounded-lg shadow-md min-w-[150px] min-h-[100px] h-full relative ${
          selected ? 'ring-2 ring-blue-400' : ''
        }`}
      >
        {/* Color picker button */}
        {selected && (
          <div className="absolute -top-2 -right-2">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-5 h-5 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center"
              title="Change color"
            >
              <div className={`w-3 h-3 rounded-full ${colorConfig.bg.replace('100', '400')}`} />
            </button>
            
            {showColorPicker && (
              <div className="absolute top-6 right-0 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex gap-1 z-50">
                {STICKY_COLORS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => handleColorChange(color.name)}
                    className={`w-6 h-6 rounded-full ${color.bg.replace('100', '400')} hover:scale-110 transition-transform ${
                      color.name.toLowerCase() === (data.color || 'yellow').toLowerCase() ? 'ring-2 ring-gray-400' : ''
                    }`}
                    title={color.name}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="p-3 h-full">
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
              className={`w-full h-full bg-transparent resize-none outline-none text-sm ${colorConfig.text}`}
              placeholder="Type your note..."
              autoFocus
            />
          ) : (
            <div 
              onClick={() => setIsEditing(true)}
              className={`w-full h-full text-sm cursor-text whitespace-pre-wrap ${colorConfig.text} ${
                !content ? 'text-opacity-50' : ''
              }`}
            >
              {content || 'Click to add note...'}
            </div>
          )}
        </div>
      </div>
    </>
  );
});

StickyNode.displayName = 'StickyNode';
