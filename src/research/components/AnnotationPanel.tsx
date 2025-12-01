/**
 * Annotation Panel Component - Right-side panel for managing annotations
 */

import React, { useState, useMemo } from 'react';
import {
  X,
  MessageSquare,
  Search,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronRight,
  FileText,
  Plus,
} from 'lucide-react';
import type { PdfAnnotation, HighlightColor } from '../types/paper';

interface AnnotationPanelProps {
  annotations: PdfAnnotation[];
  currentPage: number;
  onClose: () => void;
  onNavigateToPage: (pageNumber: number) => void;
  onDeleteAnnotation: (annotationId: string) => void;
  onUpdateAnnotation: (annotationId: string, updates: Partial<PdfAnnotation>) => void;
  onAddNote?: (pageNumber: number, noteContent: string, color: HighlightColor) => void;
  isDarkMode: boolean;
}

const COLOR_INFO: Record<HighlightColor, { label: string; bgClass: string; dotClass: string }> = {
  yellow: { label: 'Yellow', bgClass: 'bg-yellow-100', dotClass: 'bg-yellow-400' },
  green: { label: 'Green', bgClass: 'bg-green-100', dotClass: 'bg-green-500' },
  blue: { label: 'Blue', bgClass: 'bg-blue-100', dotClass: 'bg-blue-500' },
  pink: { label: 'Pink', bgClass: 'bg-pink-100', dotClass: 'bg-pink-400' },
  orange: { label: 'Orange', bgClass: 'bg-orange-100', dotClass: 'bg-orange-400' },
  purple: { label: 'Purple', bgClass: 'bg-purple-100', dotClass: 'bg-purple-500' },
};

export const AnnotationPanel: React.FC<AnnotationPanelProps> = ({
  annotations,
  currentPage,
  onClose,
  onNavigateToPage,
  onDeleteAnnotation,
  onUpdateAnnotation,
  onAddNote,
  isDarkMode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNoteText, setEditNoteText] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [collapsedPages, setCollapsedPages] = useState<Set<number>>(new Set());
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteColor, setNewNoteColor] = useState<HighlightColor>('yellow');

  // Filter annotations by search query
  const filteredAnnotations = useMemo(() => {
    if (!searchQuery.trim()) return annotations;
    
    const query = searchQuery.toLowerCase();
    return annotations.filter(ann =>
      ann.textContent?.toLowerCase().includes(query) ||
      ann.noteContent?.toLowerCase().includes(query)
    );
  }, [annotations, searchQuery]);

  // Group annotations by page
  const groupedByPage = useMemo(() => {
    const groups: Record<number, PdfAnnotation[]> = {};
    
    // Sort by page number
    const sorted = [...filteredAnnotations].sort((a, b) => a.pageNumber - b.pageNumber);
    
    sorted.forEach(ann => {
      if (!groups[ann.pageNumber]) {
        groups[ann.pageNumber] = [];
      }
      groups[ann.pageNumber].push(ann);
    });
    
    return groups;
  }, [filteredAnnotations]);

  const pageNumbers = Object.keys(groupedByPage).map(Number).sort((a, b) => a - b);

  const togglePageCollapse = (pageNumber: number) => {
    setCollapsedPages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pageNumber)) {
        newSet.delete(pageNumber);
      } else {
        newSet.add(pageNumber);
      }
      return newSet;
    });
  };

  const handleStartEdit = (annotation: PdfAnnotation) => {
    setEditingId(annotation.id);
    setEditNoteText(annotation.noteContent || '');
  };

  const handleSaveEdit = (annotationId: string) => {
    onUpdateAnnotation(annotationId, { noteContent: editNoteText || undefined });
    setEditingId(null);
    setEditNoteText('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditNoteText('');
  };

  const handleDeleteClick = (annotationId: string) => {
    setDeleteConfirmId(annotationId);
  };

  const handleConfirmDelete = (annotationId: string) => {
    onDeleteAnnotation(annotationId);
    setDeleteConfirmId(null);
  };

  const handleCancelDelete = () => {
    setDeleteConfirmId(null);
  };

  const handleAddNote = () => {
    if (!newNoteText.trim() || !onAddNote) return;
    onAddNote(currentPage, newNoteText.trim(), newNoteColor);
    setNewNoteText('');
    setNewNoteColor('yellow');
    setIsAddingNote(false);
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const bgClass = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const textClass = isDarkMode ? 'text-gray-200' : 'text-gray-800';
  const mutedClass = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const borderClass = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const hoverBgClass = isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50';
  const inputBgClass = isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300';

  return (
    <div className={`w-80 flex-shrink-0 h-full flex flex-col border-l ${borderClass} ${bgClass} shadow-lg`}>
      {/* Header */}
      <div className={`flex-shrink-0 p-4 border-b ${borderClass}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h3 className={`font-semibold ${textClass}`}>
              Annotations
            </h3>
            <span className={`px-2 py-0.5 text-xs rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} ${mutedClass}`}>
              {annotations.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg ${hoverBgClass} ${mutedClass}`}
            title="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 ${mutedClass}`} />
          <input
            type="text"
            placeholder="Search annotations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-8 pr-3 py-2 text-sm rounded-lg border ${inputBgClass} ${textClass} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>

        {/* Add Note Button */}
        {onAddNote && !isAddingNote && (
          <button
            onClick={() => setIsAddingNote(true)}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg border border-dashed ${borderClass} ${hoverBgClass} ${mutedClass} transition-colors`}
          >
            <Plus className="w-4 h-4" />
            Add Note to Page {currentPage}
          </button>
        )}

        {/* Add Note Form */}
        {isAddingNote && (
          <div className={`p-3 rounded-lg border ${borderClass} ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-1.5 mb-2">
              {Object.entries(COLOR_INFO).map(([color, info]) => (
                <button
                  key={color}
                  onClick={() => setNewNoteColor(color as HighlightColor)}
                  className={`w-5 h-5 rounded-full ${info.dotClass} hover:scale-110 transition-all duration-150 shadow-sm ${
                    newNoteColor === color ? 'ring-2 ring-offset-1 ring-blue-500' : ''
                  }`}
                  title={info.label}
                />
              ))}
            </div>
            <textarea
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Write your note..."
              className={`w-full px-2 py-1.5 text-sm rounded border ${inputBgClass} ${textClass} resize-none focus:outline-none focus:ring-2 focus:ring-blue-500`}
              rows={3}
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => {
                  setIsAddingNote(false);
                  setNewNoteText('');
                }}
                className={`px-3 py-1 text-xs ${mutedClass} hover:text-gray-700`}
              >
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                disabled={!newNoteText.trim()}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Note
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Annotations list */}
      <div className="flex-1 overflow-y-auto">
        {pageNumbers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <FileText className={`w-12 h-12 mb-3 ${mutedClass}`} />
            <p className={`text-sm font-medium ${textClass}`}>
              {searchQuery ? 'No matching annotations' : 'No annotations yet'}
            </p>
            <p className={`text-xs mt-1 ${mutedClass}`}>
              {searchQuery 
                ? 'Try a different search term'
                : 'Enable highlight mode and select text to add annotations'
              }
            </p>
          </div>
        ) : (
          <div className="py-2">
            {pageNumbers.map(pageNumber => {
              const pageAnnotations = groupedByPage[pageNumber];
              const isCollapsed = collapsedPages.has(pageNumber);
              const isCurrentPage = pageNumber === currentPage;

              return (
                <div key={pageNumber} className="mb-2">
                  {/* Page header */}
                  <button
                    onClick={() => togglePageCollapse(pageNumber)}
                    className={`w-full flex items-center gap-2 px-4 py-2 ${hoverBgClass} transition-colors`}
                  >
                    {isCollapsed ? (
                      <ChevronRight className={`w-4 h-4 ${mutedClass}`} />
                    ) : (
                      <ChevronDown className={`w-4 h-4 ${mutedClass}`} />
                    )}
                    <FileText className={`w-4 h-4 ${isCurrentPage ? 'text-blue-500' : mutedClass}`} />
                    <span className={`text-sm font-medium ${isCurrentPage ? 'text-blue-500' : textClass}`}>
                      Page {pageNumber}
                    </span>
                    <span className={`text-xs ${mutedClass}`}>
                      ({pageAnnotations.length})
                    </span>
                  </button>

                  {/* Annotations for this page */}
                  {!isCollapsed && (
                    <div className="px-2 space-y-2">
                      {pageAnnotations.map(annotation => (
                        <AnnotationCard
                          key={annotation.id}
                          annotation={annotation}
                          isEditing={editingId === annotation.id}
                          editNoteText={editNoteText}
                          isDeleteConfirm={deleteConfirmId === annotation.id}
                          isDarkMode={isDarkMode}
                          onNavigate={() => onNavigateToPage(annotation.pageNumber)}
                          onStartEdit={() => handleStartEdit(annotation)}
                          onSaveEdit={() => handleSaveEdit(annotation.id)}
                          onCancelEdit={handleCancelEdit}
                          onEditNoteChange={setEditNoteText}
                          onDeleteClick={() => handleDeleteClick(annotation.id)}
                          onConfirmDelete={() => handleConfirmDelete(annotation.id)}
                          onCancelDelete={handleCancelDelete}
                          formatDate={formatDate}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer with count */}
      <div className={`flex-shrink-0 px-4 py-3 border-t ${borderClass} text-xs ${mutedClass}`}>
        {filteredAnnotations.length !== annotations.length
          ? `Showing ${filteredAnnotations.length} of ${annotations.length} annotations`
          : `${annotations.length} annotation${annotations.length !== 1 ? 's' : ''} total`
        }
      </div>
    </div>
  );
};

// Annotation Card subcomponent
interface AnnotationCardProps {
  annotation: PdfAnnotation;
  isEditing: boolean;
  editNoteText: string;
  isDeleteConfirm: boolean;
  isDarkMode: boolean;
  onNavigate: () => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditNoteChange: (text: string) => void;
  onDeleteClick: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  formatDate: (date: Date) => string;
}

const AnnotationCard: React.FC<AnnotationCardProps> = ({
  annotation,
  isEditing,
  editNoteText,
  isDeleteConfirm,
  isDarkMode,
  onNavigate,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditNoteChange,
  onDeleteClick,
  onConfirmDelete,
  onCancelDelete,
  formatDate,
}) => {
  const colorInfo = COLOR_INFO[annotation.color];
  
  const cardBgClass = isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100';
  const borderClass = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const textClass = isDarkMode ? 'text-gray-200' : 'text-gray-800';
  const mutedClass = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const inputBgClass = isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300';
  const deleteHoverClass = isDarkMode ? 'hover:bg-red-900/30' : 'hover:bg-red-100';

  return (
    <div
      className={`mx-2 p-3 rounded-lg border ${borderClass} ${cardBgClass} cursor-pointer transition-colors overflow-hidden`}
      onClick={onNavigate}
    >
      {/* Header with color indicator and actions */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0 flex-shrink">
          <span title={colorInfo.label} className={`w-3 h-3 rounded-full ${colorInfo.dotClass} flex-shrink-0 shadow-sm`} />
          <span className={`text-xs ${mutedClass} truncate`}>
            {annotation.type.charAt(0).toUpperCase() + annotation.type.slice(1)}
          </span>
        </div>
        
        {!isDeleteConfirm && !isEditing && (
          <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
            <button
              onClick={onStartEdit}
              className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} ${mutedClass}`}
              title="Edit note"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDeleteClick}
              className={`p-1 rounded ${deleteHoverClass} text-red-500`}
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Highlighted text */}
      {annotation.textContent && (
        <p className={`text-sm ${textClass} mb-2 line-clamp-3 break-words overflow-hidden`}>
          "{annotation.textContent}"
        </p>
      )}

      {/* Note editing or display */}
      {isEditing ? (
        <div onClick={e => e.stopPropagation()}>
          <textarea
            value={editNoteText}
            onChange={(e) => onEditNoteChange(e.target.value)}
            placeholder="Add a note..."
            className={`w-full px-2 py-1.5 text-sm rounded border ${inputBgClass} ${textClass} resize-none focus:outline-none focus:ring-2 focus:ring-blue-500`}
            rows={3}
            autoFocus
            onClick={e => e.stopPropagation()}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={onCancelEdit}
              className={`px-2 py-1 text-xs ${mutedClass} hover:text-gray-700`}
            >
              Cancel
            </button>
            <button
              onClick={onSaveEdit}
              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </div>
      ) : annotation.noteContent ? (
        <div className={`mt-2 p-2 rounded text-xs ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} ${mutedClass} max-h-24 overflow-y-auto break-words`}>
          📝 {annotation.noteContent}
        </div>
      ) : null}

      {/* Delete confirmation */}
      {isDeleteConfirm && (
        <div 
          onClick={e => e.stopPropagation()} 
          className={`mt-2 p-2 rounded border ${
            isDarkMode 
              ? 'bg-red-900/20 border-red-800' 
              : 'bg-red-50 border-red-200'
          }`}
        >
          <p className={`text-xs mb-2 ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
            Delete this annotation?
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={onCancelDelete}
              className={`px-2 py-1 text-xs ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`}
            >
              Cancel
            </button>
            <button
              onClick={onConfirmDelete}
              className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Date */}
      <div className={`mt-2 text-xs ${mutedClass}`}>
        {formatDate(annotation.createdAt)}
      </div>
    </div>
  );
};
