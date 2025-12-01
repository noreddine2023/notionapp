import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Minus,
  Code,
  Image,
} from 'lucide-react';
import type { BlockType, SlashMenuItem } from '../types/blocks';

interface SlashMenuProps {
  position: { x: number; y: number };
  query: string;
  onSelect: (type: BlockType) => void;
  onClose: () => void;
}

const SLASH_MENU_ITEMS: SlashMenuItem[] = [
  { type: 'text', label: 'Text', description: 'Plain text paragraph', keywords: ['text', 'paragraph', 'p'] },
  { type: 'h1', label: 'Heading 1', description: 'Large section heading', keywords: ['h1', 'heading', 'title', 'heading1'] },
  { type: 'h2', label: 'Heading 2', description: 'Medium section heading', keywords: ['h2', 'heading', 'heading2'] },
  { type: 'h3', label: 'Heading 3', description: 'Small section heading', keywords: ['h3', 'heading', 'heading3'] },
  { type: 'bullet', label: 'Bullet List', description: 'Bulleted list item', keywords: ['bullet', 'list', 'ul'] },
  { type: 'numbered', label: 'Numbered List', description: 'Numbered list item', keywords: ['numbered', 'list', 'ol', 'ordered'] },
  { type: 'todo', label: 'To-do', description: 'Checkbox item', keywords: ['todo', 'checkbox', 'task', 'check'] },
  { type: 'quote', label: 'Quote', description: 'Block quote', keywords: ['quote', 'blockquote'] },
  { type: 'divider', label: 'Divider', description: 'Horizontal divider', keywords: ['divider', 'hr', 'line', 'separator'] },
  { type: 'code', label: 'Code', description: 'Code block', keywords: ['code', 'codeblock', 'pre'] },
  { type: 'image', label: 'Image', description: 'Upload or embed an image', keywords: ['image', 'img', 'photo', 'picture'] },
];

const IconMap: Record<BlockType, React.FC<{ className?: string }>> = {
  text: Type,
  h1: Heading1,
  h2: Heading2,
  h3: Heading3,
  bullet: List,
  numbered: ListOrdered,
  todo: CheckSquare,
  quote: Quote,
  divider: Minus,
  code: Code,
  image: Image,
};

export const SlashMenu: React.FC<SlashMenuProps> = ({
  position,
  query,
  onSelect,
  onClose,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  // Filter items based on query
  const filteredItems = query
    ? SLASH_MENU_ITEMS.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.keywords.some((k) => k.toLowerCase().includes(query.toLowerCase()))
      )
    : SLASH_MENU_ITEMS;

  // Reset selection when filtered items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          onSelect(filteredItems[selectedIndex].type);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }, [filteredItems, selectedIndex, onSelect, onClose]);

  // Add keyboard listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Scroll selected item into view
  useEffect(() => {
    const selectedEl = menuRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    selectedEl?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (filteredItems.length === 0) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      className="absolute z-50 w-72 max-h-80 overflow-y-auto bg-white rounded-lg shadow-lg border border-gray-200 py-2"
      style={{
        top: position.y,
        left: position.x,
      }}
    >
      <div className="px-3 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
        Basic blocks
      </div>
      {filteredItems.map((item, index) => {
        const Icon = IconMap[item.type];
        return (
          <button
            key={item.type}
            data-index={index}
            onClick={() => onSelect(item.type)}
            onMouseEnter={() => setSelectedIndex(index)}
            className={`w-full flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${
              index === selectedIndex ? 'bg-gray-100' : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-md">
              <Icon className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-gray-900">{item.label}</div>
              <div className="text-xs text-gray-500">{item.description}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
