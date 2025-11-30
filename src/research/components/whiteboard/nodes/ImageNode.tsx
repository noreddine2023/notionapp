/**
 * ImageNode - Image node for whiteboard
 */

import { memo, useState, useRef } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeResizer } from '@reactflow/node-resizer';
import { Image, X } from 'lucide-react';
import type { ImageNodeData } from '../../../types/paper';
import { useNodeDataChange } from '../Whiteboard';

import '@reactflow/node-resizer/dist/style.css';

export const ImageNode = memo(({ id, data, selected }: NodeProps<ImageNodeData>) => {
  const onDataChange = useNodeDataChange();
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onDataChange) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      onDataChange(id, { imageUrl, alt: file.name });
      setIsLoading(false);
    };
    reader.onerror = () => {
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    if (onDataChange) {
      onDataChange(id, { imageUrl: '', alt: '' });
    }
  };

  return (
    <>
      <NodeResizer 
        minWidth={100} 
        minHeight={100}
        maxWidth={600}
        maxHeight={600}
        isVisible={selected}
        lineClassName="border-blue-400"
        handleClassName="h-3 w-3 bg-white border-2 border-blue-400 rounded shadow-sm"
      />
      
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-blue-500 border-2 border-white" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-blue-500 border-2 border-white" />
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-blue-500 border-2 border-white" />
      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-blue-500 border-2 border-white" />
      
      <div 
        className={`bg-white rounded-lg border-2 overflow-hidden min-w-[100px] min-h-[100px] w-full h-full ${
          selected ? 'border-blue-400' : 'border-gray-200'
        }`}
      >
        {data.imageUrl ? (
          <div className="relative w-full h-full">
            <img 
              src={data.imageUrl} 
              alt={data.alt || 'Uploaded image'}
              className="w-full h-full object-contain"
            />
            {selected && (
              <button
                onClick={handleRemoveImage}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                title="Remove image"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ) : (
          <div 
            className="w-full h-full flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {isLoading ? (
              <div className="animate-pulse text-gray-400">Loading...</div>
            ) : (
              <>
                <Image className="w-8 h-8 text-gray-300 mb-2" />
                <span className="text-xs text-gray-400 text-center">Click to upload image</span>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}
      </div>
    </>
  );
});

ImageNode.displayName = 'ImageNode';
