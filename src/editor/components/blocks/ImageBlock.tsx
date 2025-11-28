import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import type { Block } from '../../types/blocks';

interface ImageBlockProps {
  block: Block;
  isActive: boolean;
  onUpdate: (content: string, props?: Block['props']) => void;
  onFocus: () => void;
}

export const ImageBlock: React.FC<ImageBlockProps> = ({
  block,
  isActive,
  onUpdate,
  onFocus,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    });
  }, [block.props, onUpdate]);

  const alignment = block.props?.alignment || 'center';

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

  // Show uploaded image
  return (
    <div
      onClick={onFocus}
      className={`relative group ${
        alignment === 'left'
          ? 'text-left'
          : alignment === 'right'
          ? 'text-right'
          : 'text-center'
      }`}
    >
      {/* Image */}
      <div className="relative inline-block max-w-full">
        <img
          src={block.props.src}
          alt={block.props.alt || 'Image'}
          className={`max-w-full h-auto rounded-lg ${
            isActive ? 'ring-2 ring-blue-500 ring-offset-2' : ''
          }`}
          style={{ maxHeight: '400px' }}
        />

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
              onClick={handleRemove}
              className="p-1.5 rounded hover:bg-red-100 text-gray-500 hover:text-red-600"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
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
