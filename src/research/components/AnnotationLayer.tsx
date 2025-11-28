/**
 * Annotation Layer Component - Renders highlights and annotations over PDF pages
 */

import React from 'react';
import type { PdfAnnotation, HighlightColor } from '../types/paper';

interface AnnotationLayerProps {
  annotations: PdfAnnotation[];
  scale: number;
  onAnnotationClick: (annotation: PdfAnnotation) => void;
  onDeleteAnnotation?: (annotationId: string) => void;
}

// Color mapping for highlights
const HIGHLIGHT_COLORS: Record<HighlightColor, string> = {
  yellow: 'rgba(255, 235, 59, 0.4)',
  green: 'rgba(76, 175, 80, 0.4)',
  blue: 'rgba(33, 150, 243, 0.4)',
  pink: 'rgba(244, 114, 182, 0.4)',
  orange: 'rgba(255, 152, 0, 0.4)',
  purple: 'rgba(156, 39, 176, 0.4)',
};

const HIGHLIGHT_BORDERS: Record<HighlightColor, string> = {
  yellow: 'rgba(255, 235, 59, 0.8)',
  green: 'rgba(76, 175, 80, 0.8)',
  blue: 'rgba(33, 150, 243, 0.8)',
  pink: 'rgba(244, 114, 182, 0.8)',
  orange: 'rgba(255, 152, 0, 0.8)',
  purple: 'rgba(156, 39, 176, 0.8)',
};

export const AnnotationLayer: React.FC<AnnotationLayerProps> = ({
  annotations,
  scale,
  onAnnotationClick,
}) => {
  if (annotations.length === 0) return null;

  return (
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
    >
      {annotations.map((annotation) => (
        <AnnotationItem
          key={annotation.id}
          annotation={annotation}
          onClick={() => onAnnotationClick(annotation)}
        />
      ))}
    </div>
  );
};

interface AnnotationItemProps {
  annotation: PdfAnnotation;
  onClick: () => void;
}

const AnnotationItem: React.FC<AnnotationItemProps> = ({
  annotation,
  onClick,
}) => {
  const [showTooltip, setShowTooltip] = React.useState(false);
  const bgColor = HIGHLIGHT_COLORS[annotation.color];
  const borderColor = HIGHLIGHT_BORDERS[annotation.color];

  if (annotation.type === 'highlight' || annotation.type === 'underline') {
    return (
      <>
        {annotation.rects.map((rect, index) => (
          <div
            key={`${annotation.id}-${index}`}
            className="absolute cursor-pointer pointer-events-auto transition-all group"
            style={{
              left: rect.x,
              top: rect.y,
              width: rect.width,
              height: rect.height,
              backgroundColor: annotation.type === 'highlight' ? bgColor : 'transparent',
              borderBottom: annotation.type === 'underline' ? `2px solid ${borderColor}` : 'none',
              borderRadius: annotation.type === 'highlight' ? '2px' : '0',
            }}
            onClick={onClick}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            {/* Hover indicator for note */}
            {annotation.noteContent && index === 0 && (
              <div 
                className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full shadow"
                title="Has note"
              />
            )}
            
            {/* Tooltip */}
            {showTooltip && index === 0 && annotation.noteContent && (
              <div className="absolute bottom-full left-0 mb-2 p-2 bg-gray-900 text-white text-xs rounded shadow-lg max-w-xs z-50">
                {annotation.noteContent}
              </div>
            )}
          </div>
        ))}
      </>
    );
  }

  if (annotation.type === 'note') {
    const rect = annotation.rects[0];
    return (
      <div
        className="absolute cursor-pointer pointer-events-auto"
        style={{
          left: rect.x,
          top: rect.y,
        }}
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div 
          className="w-6 h-6 bg-yellow-400 rounded shadow-md flex items-center justify-center text-xs font-bold"
          style={{ backgroundColor: HIGHLIGHT_COLORS[annotation.color].replace('0.4', '1') }}
        >
          📝
        </div>
        
        {showTooltip && annotation.noteContent && (
          <div className="absolute top-full left-0 mt-1 p-2 bg-gray-900 text-white text-xs rounded shadow-lg max-w-xs z-50">
            {annotation.noteContent}
          </div>
        )}
      </div>
    );
  }

  return null;
};
