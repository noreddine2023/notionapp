/**
 * Highlight Popover Component - Shows options when text is selected
 */

import React, { useState, useRef, useEffect } from 'react';
import { Highlighter, MessageSquare, X } from 'lucide-react';
import type { HighlightColor } from '../types/paper';

interface HighlightPopoverProps {
  position: { x: number; y: number };
  selectedColor: HighlightColor;
  onHighlight: () => void;
  onHighlightWithNote: (note: string) => void;
  onColorChange: (color: HighlightColor) => void;
  onClose: () => void;
}

const COLORS: { color: HighlightColor; bg: string; ring: string }[] = [
  { color: 'yellow', bg: 'bg-yellow-400', ring: 'ring-yellow-500' },
  { color: 'green', bg: 'bg-green-500', ring: 'ring-green-600' },
  { color: 'blue', bg: 'bg-blue-500', ring: 'ring-blue-600' },
  { color: 'pink', bg: 'bg-pink-400', ring: 'ring-pink-500' },
  { color: 'orange', bg: 'bg-orange-400', ring: 'ring-orange-500' },
  { color: 'purple', bg: 'bg-purple-500', ring: 'ring-purple-600' },
];

export const HighlightPopover: React.FC<HighlightPopoverProps> = ({
  position,
  selectedColor,
  onHighlight,
  onHighlightWithNote,
  onColorChange,
  onClose,
}) => {
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Focus input when showing note input
  useEffect(() => {
    if (showNoteInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showNoteInput]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleHighlightWithNote = () => {
    if (noteText.trim()) {
      onHighlightWithNote(noteText.trim());
    } else {
      onHighlight();
    }
    setNoteText('');
    setShowNoteInput(false);
  };

  // Calculate position to keep popover in viewport
  const style: React.CSSProperties = {
    position: 'fixed',
    left: Math.max(10, Math.min(position.x - 100, window.innerWidth - 220)),
    top: Math.max(10, position.y - 60),
    zIndex: 9999,
  };

  return (
    <div
      ref={popoverRef}
      style={style}
      className="bg-gray-900 text-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in duration-150"
    >
      {!showNoteInput ? (
        <div className="p-2">
          {/* Color options */}
          <div className="flex items-center gap-1.5 mb-2">
            {COLORS.map(({ color, bg, ring }) => (
              <button
                key={color}
                onClick={() => onColorChange(color)}
                className={`w-6 h-6 rounded-full ${bg} hover:scale-110 transition-all duration-150 shadow-sm ${
                  selectedColor === color ? `ring-2 ring-offset-2 ring-offset-gray-900 ${ring}` : ''
                }`}
                title={color.charAt(0).toUpperCase() + color.slice(1)}
              />
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={onHighlight}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
            >
              <Highlighter className="w-4 h-4" />
              Highlight
            </button>
            <button
              onClick={() => setShowNoteInput(true)}
              className="flex items-center justify-center p-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Add note"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="flex items-center justify-center p-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-2 w-64">
          <textarea
            ref={inputRef}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add a note..."
            className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
            rows={3}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                handleHighlightWithNote();
              } else if (e.key === 'Escape') {
                setShowNoteInput(false);
              }
            }}
          />
          <div className="flex justify-end gap-1 mt-2">
            <button
              onClick={() => {
                setShowNoteInput(false);
                setNoteText('');
              }}
              className="px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleHighlightWithNote}
              className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 rounded transition-colors"
            >
              Save
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Press Ctrl+Enter to save
          </p>
        </div>
      )}
    </div>
  );
};
