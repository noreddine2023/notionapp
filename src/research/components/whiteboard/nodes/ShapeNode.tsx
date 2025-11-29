/**
 * ShapeNode - Shape node (rectangle, circle, triangle) for whiteboard
 */

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeResizer } from '@reactflow/node-resizer';
import type { ShapeNodeData } from '../../../types/paper';

import '@reactflow/node-resizer/dist/style.css';

const SHAPE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6B7280'];

interface ShapeNodeProps extends NodeProps<ShapeNodeData> {
  onDataChange?: (id: string, data: Partial<ShapeNodeData>) => void;
}

export const ShapeNode = memo(({ id, data, selected, onDataChange }: ShapeNodeProps) => {
  const fillColor = data.fillColor || '#3B82F6';
  const borderColor = data.borderColor || '#1D4ED8';
  const shapeType = data.shapeType || 'rectangle';

  const renderShape = () => {
    const commonProps = {
      fill: fillColor,
      stroke: borderColor,
      strokeWidth: 2,
    };

    switch (shapeType) {
      case 'circle':
        return (
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <ellipse cx="50" cy="50" rx="48" ry="48" {...commonProps} />
          </svg>
        );
      case 'triangle':
        return (
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polygon points="50,5 95,95 5,95" {...commonProps} />
          </svg>
        );
      case 'rectangle':
      default:
        return (
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <rect x="2" y="2" width="96" height="96" rx="4" {...commonProps} />
          </svg>
        );
    }
  };

  return (
    <>
      <NodeResizer 
        minWidth={50} 
        minHeight={50} 
        isVisible={selected}
        lineClassName="border-blue-400"
        handleClassName="h-3 w-3 bg-white border-2 border-blue-400 rounded"
      />
      
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-blue-500 border-2 border-white" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-blue-500 border-2 border-white" />
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-blue-500 border-2 border-white" />
      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-blue-500 border-2 border-white" />
      
      <div 
        className={`w-full h-full min-w-[50px] min-h-[50px] ${selected ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`}
      >
        {/* Color picker when selected */}
        {selected && (
          <div className="absolute -top-10 left-0 flex items-center gap-1 bg-white rounded-lg shadow-lg border border-gray-200 px-1.5 py-1 z-50">
            {SHAPE_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => onDataChange?.(id, { fillColor: color })}
                className={`w-5 h-5 rounded hover:scale-110 transition-transform ${
                  fillColor === color ? 'ring-2 ring-gray-400' : ''
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}
        
        {renderShape()}
      </div>
    </>
  );
});

ShapeNode.displayName = 'ShapeNode';
