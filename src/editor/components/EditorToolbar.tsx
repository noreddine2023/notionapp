import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Highlighter,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Code,
  Image,
  Undo,
  Redo,
  Minus,
  Link,
  Palette,
  ChevronDown,
  Check,
  Save,
} from 'lucide-react';

// Types
interface EditorToolbarProps {
  onFormatText: (format: string, value?: string) => void;
  onInsertImage: () => void;
  onSave?: () => void;
  isSaving?: boolean;
  lastSaved?: Date | null;
  activeFormats?: Set<string>;
  currentColor?: string;
  currentHighlight?: string;
  currentFontSize?: string;
  currentFontFamily?: string;
}

// Highlight colors (Grammarly-style)
const HIGHLIGHT_COLORS = [
  { name: 'Yellow', value: '#fef08a' },
  { name: 'Green', value: '#bbf7d0' },
  { name: 'Blue', value: '#bfdbfe' },
  { name: 'Pink', value: '#fbcfe8' },
  { name: 'Orange', value: '#fed7aa' },
  { name: 'Purple', value: '#ddd6fe' },
];

// Text colors
const TEXT_COLORS = [
  { name: 'Default', value: '#1e293b' },
  { name: 'Gray', value: '#64748b' },
  { name: 'Red', value: '#dc2626' },
  { name: 'Orange', value: '#ea580c' },
  { name: 'Green', value: '#16a34a' },
  { name: 'Blue', value: '#2563eb' },
  { name: 'Purple', value: '#7c3aed' },
  { name: 'Pink', value: '#db2777' },
];

// Underline colors
const UNDERLINE_COLORS = [
  { name: 'Default', value: 'currentColor', style: 'solid' },
  { name: 'Red', value: '#dc2626', style: 'solid' },
  { name: 'Blue', value: '#2563eb', style: 'solid' },
  { name: 'Green', value: '#16a34a', style: 'solid' },
  { name: 'Wavy Red', value: '#dc2626', style: 'wavy' },
  { name: 'Dotted Blue', value: '#2563eb', style: 'dotted' },
];

// Font sizes
const FONT_SIZES = [
  { name: 'Small', value: '14px' },
  { name: 'Normal', value: '16px' },
  { name: 'Medium', value: '18px' },
  { name: 'Large', value: '20px' },
  { name: 'X-Large', value: '24px' },
  { name: 'XX-Large', value: '32px' },
];

// Font families
const FONT_FAMILIES = [
  { name: 'Sans Serif', value: 'Inter, -apple-system, sans-serif' },
  { name: 'Serif', value: 'Georgia, serif' },
  { name: 'Mono', value: 'JetBrains Mono, monospace' },
  { name: 'Handwriting', value: 'Caveat, cursive' },
];

/**
 * Dropdown Component
 */
interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
}

const Dropdown: React.FC<DropdownProps> = ({ trigger, children, align = 'left' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div
          className={`absolute top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[140px] ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {React.Children.map(children, (child) =>
            React.isValidElement(child)
              ? React.cloneElement(child as React.ReactElement<{ onClick?: () => void }>, {
                  onClick: () => {
                    (child.props as { onClick?: () => void }).onClick?.();
                    setIsOpen(false);
                  },
                })
              : child
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Color Picker Dropdown
 */
interface ColorPickerProps {
  colors: { name: string; value: string; style?: string }[];
  currentValue?: string;
  onSelect: (value: string, style?: string) => void;
  icon: React.ReactNode;
  title: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  colors,
  currentValue,
  onSelect,
  icon,
  title,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 p-2 rounded-md hover:bg-gray-100 transition-colors"
        title={title}
      >
        {icon}
        <ChevronDown className="w-3 h-3 text-gray-400" />
      </button>
      {isOpen && (
        <div className="absolute top-full mt-1 left-0 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-50">
          <div className="grid grid-cols-4 gap-1">
            {colors.map((color) => (
              <button
                key={color.name}
                onClick={() => {
                  onSelect(color.value, color.style);
                  setIsOpen(false);
                }}
                className={`w-8 h-8 rounded-md border-2 transition-all hover:scale-110 ${
                  currentValue === color.value
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              >
                {currentValue === color.value && (
                  <Check className="w-4 h-4 mx-auto text-gray-700" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Toolbar Button Component
 */
interface ToolbarButtonProps {
  icon: React.ReactNode;
  isActive?: boolean;
  onClick: () => void;
  title: string;
  disabled?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  icon,
  isActive,
  onClick,
  title,
  disabled,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-2 rounded-md transition-all ${
      isActive
        ? 'bg-blue-100 text-blue-700'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
    } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
  >
    {icon}
  </button>
);

/**
 * Separator Component
 */
const Separator: React.FC = () => (
  <div className="w-px h-6 bg-gray-200 mx-1" />
);

/**
 * Main Editor Toolbar Component
 */
export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onFormatText,
  onInsertImage,
  onSave,
  isSaving,
  lastSaved,
  activeFormats = new Set(),
  currentColor = '#1e293b',
  currentHighlight,
  currentFontSize = '16px',
  currentFontFamily = 'Inter, -apple-system, sans-serif',
}) => {
  const handleUndo = useCallback(() => onFormatText('undo'), [onFormatText]);
  const handleRedo = useCallback(() => onFormatText('redo'), [onFormatText]);

  return (
    <div className="editor-toolbar bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-1 flex-wrap sticky top-0 z-20">
      {/* Undo/Redo */}
      <ToolbarButton
        icon={<Undo className="w-4 h-4" />}
        onClick={handleUndo}
        title="Undo (Ctrl+Z)"
      />
      <ToolbarButton
        icon={<Redo className="w-4 h-4" />}
        onClick={handleRedo}
        title="Redo (Ctrl+Y)"
      />

      <Separator />

      {/* Font Family */}
      <Dropdown
        trigger={
          <button className="flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-gray-100 text-sm text-gray-700 min-w-[100px] justify-between">
            <span className="truncate">
              {FONT_FAMILIES.find((f) => f.value === currentFontFamily)?.name || 'Sans Serif'}
            </span>
            <ChevronDown className="w-3 h-3 text-gray-400 flex-shrink-0" />
          </button>
        }
      >
        {FONT_FAMILIES.map((font) => (
          <button
            key={font.name}
            onClick={() => onFormatText('fontFamily', font.value)}
            className={`w-full px-3 py-1.5 text-sm text-left hover:bg-gray-100 flex items-center justify-between ${
              currentFontFamily === font.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
            }`}
            style={{ fontFamily: font.value }}
          >
            {font.name}
            {currentFontFamily === font.value && <Check className="w-4 h-4" />}
          </button>
        ))}
      </Dropdown>

      {/* Font Size */}
      <Dropdown
        trigger={
          <button className="flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-gray-100 text-sm text-gray-700 min-w-[80px] justify-between">
            <span>{currentFontSize}</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>
        }
      >
        {FONT_SIZES.map((size) => (
          <button
            key={size.name}
            onClick={() => onFormatText('fontSize', size.value)}
            className={`w-full px-3 py-1.5 text-sm text-left hover:bg-gray-100 flex items-center justify-between ${
              currentFontSize === size.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
            }`}
          >
            {size.name} ({size.value})
            {currentFontSize === size.value && <Check className="w-4 h-4" />}
          </button>
        ))}
      </Dropdown>

      <Separator />

      {/* Text Formatting */}
      <ToolbarButton
        icon={<Bold className="w-4 h-4" />}
        isActive={activeFormats.has('bold')}
        onClick={() => onFormatText('bold')}
        title="Bold (Ctrl+B)"
      />
      <ToolbarButton
        icon={<Italic className="w-4 h-4" />}
        isActive={activeFormats.has('italic')}
        onClick={() => onFormatText('italic')}
        title="Italic (Ctrl+I)"
      />
      <ToolbarButton
        icon={<Underline className="w-4 h-4" />}
        isActive={activeFormats.has('underline')}
        onClick={() => onFormatText('underline')}
        title="Underline (Ctrl+U)"
      />
      <ToolbarButton
        icon={<Strikethrough className="w-4 h-4" />}
        isActive={activeFormats.has('strikethrough')}
        onClick={() => onFormatText('strikethrough')}
        title="Strikethrough"
      />

      <Separator />

      {/* Text Color */}
      <ColorPicker
        colors={TEXT_COLORS}
        currentValue={currentColor}
        onSelect={(value) => onFormatText('textColor', value)}
        icon={<Type className="w-4 h-4" style={{ color: currentColor }} />}
        title="Text Color"
      />

      {/* Highlight */}
      <ColorPicker
        colors={HIGHLIGHT_COLORS}
        currentValue={currentHighlight}
        onSelect={(value) => onFormatText('highlight', value)}
        icon={
          <Highlighter
            className="w-4 h-4"
            style={{ color: currentHighlight || '#facc15' }}
          />
        }
        title="Highlight"
      />

      {/* Underline Color */}
      <ColorPicker
        colors={UNDERLINE_COLORS}
        currentValue={undefined}
        onSelect={(value, style) => onFormatText('underlineColor', `${value}|${style || 'solid'}`)}
        icon={<Palette className="w-4 h-4" />}
        title="Underline Style"
      />

      <Separator />

      {/* Block Types */}
      <Dropdown
        trigger={
          <button className="flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-gray-100 text-sm text-gray-700">
            <span>Heading</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>
        }
      >
        <button
          onClick={() => onFormatText('heading', '1')}
          className="w-full px-3 py-1.5 text-left hover:bg-gray-100 text-xl font-bold text-gray-800"
        >
          Heading 1
        </button>
        <button
          onClick={() => onFormatText('heading', '2')}
          className="w-full px-3 py-1.5 text-left hover:bg-gray-100 text-lg font-bold text-gray-800"
        >
          Heading 2
        </button>
        <button
          onClick={() => onFormatText('heading', '3')}
          className="w-full px-3 py-1.5 text-left hover:bg-gray-100 text-base font-semibold text-gray-800"
        >
          Heading 3
        </button>
        <button
          onClick={() => onFormatText('paragraph')}
          className="w-full px-3 py-1.5 text-left hover:bg-gray-100 text-sm text-gray-700"
        >
          Paragraph
        </button>
      </Dropdown>

      <Separator />

      {/* Alignment */}
      <ToolbarButton
        icon={<AlignLeft className="w-4 h-4" />}
        isActive={activeFormats.has('alignLeft')}
        onClick={() => onFormatText('align', 'left')}
        title="Align Left"
      />
      <ToolbarButton
        icon={<AlignCenter className="w-4 h-4" />}
        isActive={activeFormats.has('alignCenter')}
        onClick={() => onFormatText('align', 'center')}
        title="Align Center"
      />
      <ToolbarButton
        icon={<AlignRight className="w-4 h-4" />}
        isActive={activeFormats.has('alignRight')}
        onClick={() => onFormatText('align', 'right')}
        title="Align Right"
      />

      <Separator />

      {/* Lists */}
      <ToolbarButton
        icon={<List className="w-4 h-4" />}
        isActive={activeFormats.has('bulletList')}
        onClick={() => onFormatText('bulletList')}
        title="Bullet List"
      />
      <ToolbarButton
        icon={<ListOrdered className="w-4 h-4" />}
        isActive={activeFormats.has('numberedList')}
        onClick={() => onFormatText('numberedList')}
        title="Numbered List"
      />

      <Separator />

      {/* Other Elements */}
      <ToolbarButton
        icon={<Quote className="w-4 h-4" />}
        onClick={() => onFormatText('quote')}
        title="Quote Block"
      />
      <ToolbarButton
        icon={<Code className="w-4 h-4" />}
        onClick={() => onFormatText('code')}
        title="Code Block"
      />
      <ToolbarButton
        icon={<Minus className="w-4 h-4" />}
        onClick={() => onFormatText('divider')}
        title="Divider"
      />
      <ToolbarButton
        icon={<Link className="w-4 h-4" />}
        onClick={() => onFormatText('link')}
        title="Insert Link"
      />
      <ToolbarButton
        icon={<Image className="w-4 h-4" />}
        onClick={onInsertImage}
        title="Insert Image"
      />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Save Status */}
      {onSave && (
        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="text-xs text-gray-400">
              Saved {formatTime(lastSaved)}
            </span>
          )}
          <button
            onClick={onSave}
            disabled={isSaving}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              isSaving
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      )}
    </div>
  );
};

// Helper function to format time
function formatTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default EditorToolbar;
