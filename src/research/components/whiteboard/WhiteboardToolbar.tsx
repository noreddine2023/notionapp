/**
 * WhiteboardToolbar - Toolbar for whiteboard tools and actions
 */

import React, { memo } from 'react';
import {
  MousePointer2,
  Hand,
  Type,
  StickyNote,
  Square,
  Circle,
  Triangle,
  ArrowRight,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid3X3,
  Undo2,
  Redo2,
  Save,
  FileText,
} from 'lucide-react';

export type WhiteboardTool = 
  | 'select' 
  | 'pan' 
  | 'text' 
  | 'sticky' 
  | 'rectangle' 
  | 'circle' 
  | 'triangle'
  | 'arrow'
  | 'paper';

interface WhiteboardToolbarProps {
  activeTool: WhiteboardTool;
  onToolChange: (tool: WhiteboardTool) => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomFit: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onDelete: () => void;
  hasSelection: boolean;
  onAddPaper: () => void;
  isSaving?: boolean;
}

interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const ToolButton: React.FC<ToolButtonProps> = ({ icon, label, isActive, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`p-2 rounded-lg transition-all ${
      isActive 
        ? 'bg-blue-100 text-blue-600 shadow-sm' 
        : disabled 
          ? 'text-gray-300 cursor-not-allowed' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
    }`}
    title={label}
  >
    {icon}
  </button>
);

const Divider = () => <div className="w-px h-6 bg-gray-200 mx-1" />;

export const WhiteboardToolbar = memo(({
  activeTool,
  onToolChange,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomFit,
  showGrid,
  onToggleGrid,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSave,
  onDelete,
  hasSelection,
  onAddPaper,
  isSaving,
}: WhiteboardToolbarProps) => {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-lg border border-gray-200 px-2 py-1.5 flex items-center gap-1 z-50">
      {/* Selection Tools */}
      <ToolButton
        icon={<MousePointer2 className="w-5 h-5" />}
        label="Select (V)"
        isActive={activeTool === 'select'}
        onClick={() => onToolChange('select')}
      />
      <ToolButton
        icon={<Hand className="w-5 h-5" />}
        label="Pan (H)"
        isActive={activeTool === 'pan'}
        onClick={() => onToolChange('pan')}
      />
      
      <Divider />
      
      {/* Creation Tools */}
      <ToolButton
        icon={<Type className="w-5 h-5" />}
        label="Text (T)"
        isActive={activeTool === 'text'}
        onClick={() => onToolChange('text')}
      />
      <ToolButton
        icon={<StickyNote className="w-5 h-5" />}
        label="Sticky Note (N)"
        isActive={activeTool === 'sticky'}
        onClick={() => onToolChange('sticky')}
      />
      <ToolButton
        icon={<FileText className="w-5 h-5" />}
        label="Add Paper (P)"
        isActive={activeTool === 'paper'}
        onClick={() => onAddPaper()}
      />
      
      <Divider />
      
      {/* Shapes */}
      <ToolButton
        icon={<Square className="w-5 h-5" />}
        label="Rectangle (R)"
        isActive={activeTool === 'rectangle'}
        onClick={() => onToolChange('rectangle')}
      />
      <ToolButton
        icon={<Circle className="w-5 h-5" />}
        label="Circle (C)"
        isActive={activeTool === 'circle'}
        onClick={() => onToolChange('circle')}
      />
      <ToolButton
        icon={<Triangle className="w-5 h-5" />}
        label="Triangle"
        isActive={activeTool === 'triangle'}
        onClick={() => onToolChange('triangle')}
      />
      <ToolButton
        icon={<ArrowRight className="w-5 h-5" />}
        label="Arrow (A)"
        isActive={activeTool === 'arrow'}
        onClick={() => onToolChange('arrow')}
      />
      
      <Divider />
      
      {/* Delete */}
      <ToolButton
        icon={<Trash2 className="w-5 h-5" />}
        label="Delete (Del)"
        onClick={onDelete}
        disabled={!hasSelection}
      />
      
      <Divider />
      
      {/* Zoom Controls */}
      <ToolButton
        icon={<ZoomOut className="w-5 h-5" />}
        label="Zoom Out"
        onClick={onZoomOut}
      />
      <span className="text-xs text-gray-500 min-w-[40px] text-center">
        {Math.round(zoom * 100)}%
      </span>
      <ToolButton
        icon={<ZoomIn className="w-5 h-5" />}
        label="Zoom In"
        onClick={onZoomIn}
      />
      <ToolButton
        icon={<Maximize2 className="w-5 h-5" />}
        label="Fit View"
        onClick={onZoomFit}
      />
      
      <Divider />
      
      {/* Grid Toggle */}
      <ToolButton
        icon={<Grid3X3 className="w-5 h-5" />}
        label="Toggle Grid (G)"
        isActive={showGrid}
        onClick={onToggleGrid}
      />
      
      <Divider />
      
      {/* Undo/Redo */}
      <ToolButton
        icon={<Undo2 className="w-5 h-5" />}
        label="Undo (Ctrl+Z)"
        onClick={onUndo}
        disabled={!canUndo}
      />
      <ToolButton
        icon={<Redo2 className="w-5 h-5" />}
        label="Redo (Ctrl+Y)"
        onClick={onRedo}
        disabled={!canRedo}
      />
      
      <Divider />
      
      {/* Save */}
      <ToolButton
        icon={<Save className={`w-5 h-5 ${isSaving ? 'animate-pulse' : ''}`} />}
        label="Save (Ctrl+S)"
        onClick={onSave}
        disabled={isSaving}
      />
    </div>
  );
});

WhiteboardToolbar.displayName = 'WhiteboardToolbar';
