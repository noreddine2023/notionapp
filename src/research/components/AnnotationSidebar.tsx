/**
 * Annotation Sidebar Component - Lists all annotations with filtering
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Trash2,
  Edit2,
  Download,
  Filter,
  MessageSquare,
  X,
} from 'lucide-react';
import type { PdfAnnotation, HighlightColor, AnnotationType } from '../types/paper';

interface AnnotationSidebarProps {
  annotations: PdfAnnotation[];
  onAnnotationClick: (annotation: PdfAnnotation) => void;
  onDeleteAnnotation: (annotationId: string) => void;
  onUpdateAnnotation: (annotationId: string, updates: Partial<PdfAnnotation>) => void;
  onExportAnnotations: () => Promise<string>;
  isDarkMode: boolean;
}

const COLOR_LABELS: Record<HighlightColor, { label: string; emoji: string; bg: string }> = {
  yellow: { label: 'Yellow', emoji: '🟡', bg: 'bg-yellow-100' },
  green: { label: 'Green', emoji: '🟢', bg: 'bg-green-100' },
  blue: { label: 'Blue', emoji: '🔵', bg: 'bg-blue-100' },
  pink: { label: 'Pink', emoji: '🩷', bg: 'bg-pink-100' },
  orange: { label: 'Orange', emoji: '🟠', bg: 'bg-orange-100' },
  purple: { label: 'Purple', emoji: '🟣', bg: 'bg-purple-100' },
};

const TYPE_LABELS: Record<AnnotationType, string> = {
  highlight: 'Highlight',
  underline: 'Underline',
  note: 'Note',
  drawing: 'Drawing',
};

export const AnnotationSidebar: React.FC<AnnotationSidebarProps> = ({
  annotations,
  onAnnotationClick,
  onDeleteAnnotation,
  onUpdateAnnotation,
  onExportAnnotations,
  isDarkMode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterColor, setFilterColor] = useState<HighlightColor | 'all'>('all');
  const [filterType, setFilterType] = useState<AnnotationType | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  // Filter and sort annotations
  const filteredAnnotations = useMemo(() => {
    let result = [...annotations];

    // Apply color filter
    if (filterColor !== 'all') {
      result = result.filter(a => a.color === filterColor);
    }

    // Apply type filter
    if (filterType !== 'all') {
      result = result.filter(a => a.type === filterType);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(a =>
        a.textContent?.toLowerCase().includes(query) ||
        a.noteContent?.toLowerCase().includes(query)
      );
    }

    // Sort by page number, then by creation date
    result.sort((a, b) => {
      if (a.pageNumber !== b.pageNumber) {
        return a.pageNumber - b.pageNumber;
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    return result;
  }, [annotations, filterColor, filterType, searchQuery]);

  // Group by page
  const groupedByPage = useMemo(() => {
    const groups: Record<number, PdfAnnotation[]> = {};
    filteredAnnotations.forEach(ann => {
      if (!groups[ann.pageNumber]) {
        groups[ann.pageNumber] = [];
      }
      groups[ann.pageNumber].push(ann);
    });
    return groups;
  }, [filteredAnnotations]);

  const handleStartEdit = (annotation: PdfAnnotation) => {
    setEditingNote(annotation.id);
    setNoteText(annotation.noteContent || '');
  };

  const handleSaveNote = (annotationId: string) => {
    onUpdateAnnotation(annotationId, { noteContent: noteText });
    setEditingNote(null);
    setNoteText('');
  };

  const handleExport = async () => {
    const markdown = await onExportAnnotations();
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'annotations.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const bgClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textClass = isDarkMode ? 'text-gray-200' : 'text-gray-700';
  const mutedClass = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className={`w-80 flex-shrink-0 border-l ${bgClass} flex flex-col`}>
      {/* Header */}
      <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`font-semibold ${textClass}`}>Annotations</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1.5 rounded hover:bg-gray-100 ${
                showFilters ? 'bg-blue-100 text-blue-600' : mutedClass
              }`}
              title="Filter"
            >
              <Filter className="w-4 h-4" />
            </button>
            <button
              onClick={handleExport}
              className={`p-1.5 rounded hover:bg-gray-100 ${mutedClass}`}
              title="Export as Markdown"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 ${mutedClass}`} />
          <input
            type="text"
            placeholder="Search annotations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-8 pr-8 py-1.5 text-sm rounded border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                : 'bg-gray-50 border-gray-300'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`absolute right-2 top-1/2 -translate-y-1/2 ${mutedClass}`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-3 space-y-2">
            <div>
              <label className={`block text-xs font-medium mb-1 ${mutedClass}`}>Color</label>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setFilterColor('all')}
                  className={`px-2 py-1 text-xs rounded ${
                    filterColor === 'all'
                      ? 'bg-blue-500 text-white'
                      : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  All
                </button>
                {Object.entries(COLOR_LABELS).map(([color, { emoji }]) => (
                  <button
                    key={color}
                    onClick={() => setFilterColor(color as HighlightColor)}
                    className={`px-2 py-1 text-xs rounded ${
                      filterColor === color
                        ? 'bg-blue-500 text-white'
                        : isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1 ${mutedClass}`}>Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as AnnotationType | 'all')}
                className={`w-full px-2 py-1 text-sm rounded border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-300'
                }`}
              >
                <option value="all">All Types</option>
                {Object.entries(TYPE_LABELS).map(([type, label]) => (
                  <option key={type} value={type}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Annotations list */}
      <div className="flex-1 overflow-y-auto">
        {Object.keys(groupedByPage).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <MessageSquare className={`w-10 h-10 mb-3 ${mutedClass}`} />
            <p className={`text-sm ${mutedClass}`}>No annotations yet</p>
            <p className={`text-xs mt-1 ${mutedClass}`}>
              Select text and highlight to add annotations
            </p>
          </div>
        ) : (
          <div className="p-2">
            {Object.entries(groupedByPage).map(([page, anns]) => (
              <div key={page} className="mb-4">
                <div className={`text-xs font-medium uppercase tracking-wider mb-2 px-2 ${mutedClass}`}>
                  Page {page}
                </div>
                
                <div className="space-y-2">
                  {anns.map((annotation) => (
                    <div
                      key={annotation.id}
                      className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                        isDarkMode 
                          ? 'border-gray-700 hover:bg-gray-700' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => onAnnotationClick(annotation)}
                    >
                      {/* Color indicator and type */}
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span>{COLOR_LABELS[annotation.color].emoji}</span>
                          <span className={`text-xs ${mutedClass}`}>
                            {TYPE_LABELS[annotation.type]}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEdit(annotation);
                            }}
                            className={`p-1 rounded hover:bg-gray-200 ${mutedClass}`}
                            title="Edit note"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteAnnotation(annotation.id);
                            }}
                            className="p-1 rounded hover:bg-red-100 text-red-500"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Text content */}
                      {annotation.textContent && (
                        <p className={`text-sm line-clamp-2 mb-1 ${textClass}`}>
                          "{annotation.textContent}"
                        </p>
                      )}

                      {/* Note */}
                      {editingNote === annotation.id ? (
                        <div className="mt-2" onClick={e => e.stopPropagation()}>
                          <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Add a note..."
                            className={`w-full px-2 py-1 text-sm rounded border resize-none ${
                              isDarkMode 
                                ? 'bg-gray-700 border-gray-600 text-gray-200' 
                                : 'bg-white border-gray-300'
                            }`}
                            rows={2}
                            autoFocus
                          />
                          <div className="flex justify-end gap-2 mt-1">
                            <button
                              onClick={() => setEditingNote(null)}
                              className="px-2 py-1 text-xs text-gray-500"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveNote(annotation.id)}
                              className="px-2 py-1 text-xs bg-blue-500 text-white rounded"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : annotation.noteContent ? (
                        <div className={`mt-1 p-1.5 rounded text-xs ${
                          isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                        } ${mutedClass}`}>
                          📝 {annotation.noteContent}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className={`p-3 border-t text-xs ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} ${mutedClass}`}>
        {filteredAnnotations.length} annotation{filteredAnnotations.length !== 1 ? 's' : ''}
        {filterColor !== 'all' || filterType !== 'all' || searchQuery
          ? ` (filtered from ${annotations.length})`
          : ''}
      </div>
    </div>
  );
};
