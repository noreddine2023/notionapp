import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, X, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import type { Block } from '../../types/blocks';

interface ImageBlockProps {
  block: Block;
  isActive: boolean;
  onUpdate: (content: string, props?: Block['props']) => void;
  onFocus: () => void;
}

// Minimum and maximum dimensions for resizing
const MIN_WIDTH = 100;
const MAX_WIDTH = 800;

export const ImageBlock: React.FC<ImageBlockProps> = ({
  block,
  isActive,
  onUpdate,
  onFocus,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      setIsUploading(true);

      // Convert file to base64 for localStorage storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        onUpdate(block.content, {
          ...block.props,
          src: base64,
          alt: file.name,
        });
        setIsUploading(false);
      };
      reader.onerror = () => {
        alert('Failed to read file');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    },
    [block.content, block.props, onUpdate]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData.items;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            handleFileSelect(file);
          }
          break;
        }
      }
    },
    [handleFileSelect]
  );

  const handleCaptionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate(block.content, {
        ...block.props,
        caption: e.target.value,
      });
    },
    [block.content, block.props, onUpdate]
  );

  const handleAlignmentChange = useCallback(
    (alignment: 'left' | 'center' | 'right') => {
      onUpdate(block.content, {
        ...block.props,
        alignment,
      });
    },
    [block.content, block.props, onUpdate]
  );

  const handleRemove = useCallback(() => {
    onUpdate('', {
      ...block.props,
      src: undefined,
      alt: undefined,
      caption: undefined,
      width: undefined,
    });
  }, [block.props, onUpdate]);

  // Handle resize start
  const handleResizeStart = useCallback(
    (e: React.MouseEvent, _corner: string) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (imageRef.current) {
        const rect = imageRef.current.getBoundingClientRect();
        setResizeStart({
          x: e.clientX,
          y: e.clientY,
          width: rect.width,
          height: rect.height,
        });
        setIsResizing(true);
      }
    },
    []
  );

  // Handle resize move
  useEffect(() => {
    if (!isResizing || !resizeStart) return;

    let lastWidth = resizeStart.width;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStart.x;
      
      let newWidth = resizeStart.width + deltaX;
      
      // Constrain width
      newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth));
      
      // Only update if width changed significantly (optimization)
      if (Math.abs(newWidth - lastWidth) >= 2) {
        lastWidth = newWidth;
        // Update the image dimensions in block props
        // Height is auto via CSS when maintainAspectRatio is true
        onUpdate(block.content, {
          ...block.props,
          width: Math.round(newWidth),
        });
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeStart(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeStart, maintainAspectRatio, block.content, block.props, onUpdate]);

  const alignment = block.props?.alignment || 'center';
  const imageWidth = block.props?.width;

  // If no image uploaded yet, show upload area
  if (!block.props?.src) {
    return (
      <div
        onClick={() => {
          onFocus();
          fileInputRef.current?.click();
        }}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onPaste={handlePaste}
        className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
          dragOver
            ? 'border-blue-400 bg-blue-50'
            : isActive
            ? 'border-blue-300 bg-blue-50/50'
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
          className="hidden"
        />
        {isUploading ? (
          <div className="flex items-center gap-2 text-blue-600">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span>Uploading...</span>
          </div>
        ) : (
          <>
            <div className="p-3 bg-gray-100 rounded-full mb-3">
              <Upload className="w-6 h-6 text-gray-500" />
            </div>
            <p className="text-sm text-gray-600 mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
          </>
        )}
      </div>
    );
  }

  // Show uploaded image with resize handles
  return (
    <div
      ref={containerRef}
      onClick={onFocus}
      className={`relative group ${
        alignment === 'left'
          ? 'text-left'
          : alignment === 'right'
          ? 'text-right'
          : 'text-center'
      }`}
    >
      {/* Image container with resize handles */}
      <div 
        className="relative inline-block"
        style={{ maxWidth: '100%' }}
      >
        <img
          ref={imageRef}
          src={block.props.src}
          alt={block.props.alt || 'Image'}
          className={`h-auto rounded-lg ${
            isActive ? 'ring-2 ring-blue-500 ring-offset-2' : ''
          } ${isResizing ? 'pointer-events-none select-none' : ''}`}
          style={{ 
            width: imageWidth ? `${imageWidth}px` : 'auto',
            maxWidth: '100%',
            maxHeight: '600px',
          }}
          draggable={false}
        />

        {/* Resize handles - shown when active */}
        {isActive && (
          <>
            {/* Corner resize handles */}
            <div
              className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-sm cursor-se-resize shadow-md hover:bg-blue-600 transition-colors z-10"
              onMouseDown={(e) => handleResizeStart(e, 'se')}
              title="Drag to resize"
            />
            <div
              className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-sm cursor-sw-resize shadow-md hover:bg-blue-600 transition-colors z-10"
              onMouseDown={(e) => handleResizeStart(e, 'sw')}
              title="Drag to resize"
            />
            <div
              className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-sm cursor-ne-resize shadow-md hover:bg-blue-600 transition-colors z-10"
              onMouseDown={(e) => handleResizeStart(e, 'ne')}
              title="Drag to resize"
            />
            <div
              className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-sm cursor-nw-resize shadow-md hover:bg-blue-600 transition-colors z-10"
              onMouseDown={(e) => handleResizeStart(e, 'nw')}
              title="Drag to resize"
            />

            {/* Edge resize handles */}
            <div
              className="absolute top-1/2 -right-2 w-3 h-8 -translate-y-1/2 bg-blue-500 border-2 border-white rounded-sm cursor-e-resize shadow-md hover:bg-blue-600 transition-colors z-10"
              onMouseDown={(e) => handleResizeStart(e, 'e')}
              title="Drag to resize"
            />
            <div
              className="absolute top-1/2 -left-2 w-3 h-8 -translate-y-1/2 bg-blue-500 border-2 border-white rounded-sm cursor-w-resize shadow-md hover:bg-blue-600 transition-colors z-10"
              onMouseDown={(e) => handleResizeStart(e, 'w')}
              title="Drag to resize"
            />
          </>
        )}

        {/* Controls overlay */}
        {isActive && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-white rounded-lg shadow-lg p-1">
            <button
              onClick={() => handleAlignmentChange('left')}
              className={`p-1.5 rounded ${
                alignment === 'left' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}
              title="Align left"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleAlignmentChange('center')}
              className={`p-1.5 rounded ${
                alignment === 'center' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}
              title="Align center"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleAlignmentChange('right')}
              className={`p-1.5 rounded ${
                alignment === 'right' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}
              title="Align right"
            >
              <AlignRight className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <button
              onClick={() => setMaintainAspectRatio(!maintainAspectRatio)}
              className={`p-1.5 rounded text-xs font-medium ${
                maintainAspectRatio ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-500'
              }`}
              title={maintainAspectRatio ? 'Aspect ratio locked' : 'Aspect ratio unlocked'}
            >
              {maintainAspectRatio ? '🔒' : '🔓'}
            </button>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <button
              onClick={handleRemove}
              className="p-1.5 rounded hover:bg-red-100 text-gray-500 hover:text-red-600"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Resize indicator */}
        {isResizing && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {imageWidth ? `${imageWidth}px` : 'Auto'}
          </div>
        )}
      </div>

      {/* Caption */}
      {isActive || block.props.caption ? (
        <input
          type="text"
          value={block.props.caption || ''}
          onChange={handleCaptionChange}
          placeholder="Add a caption..."
          className={`mt-2 text-sm text-gray-500 bg-transparent border-none outline-none text-center w-full ${
            alignment === 'left'
              ? 'text-left'
              : alignment === 'right'
              ? 'text-right'
              : 'text-center'
          }`}
        />
      ) : null}
    </div>
  );
};
