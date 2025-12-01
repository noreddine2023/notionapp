/**
 * Paper Card Component - Displays a paper in search results or library
 */

import React from 'react';
import {
  BookOpen,
  Calendar,
  Quote,
  ExternalLink,
  Plus,
  Check,
  Star,
  StarOff,
  Unlock,
} from 'lucide-react';
import type { Paper } from '../types/paper';
import { useResearchStore } from '../store/researchStore';

interface PaperCardProps {
  paper: Paper;
  showLibraryActions?: boolean;
  onClick?: () => void;
}

export const PaperCard: React.FC<PaperCardProps> = ({
  paper,
  showLibraryActions = true,
  onClick,
}) => {
  const {
    addPaperToLibrary,
    removePaperFromLibrary,
    isPaperInLibrary,
    togglePaperFavorite,
    togglePaperRead,
  } = useResearchStore();

  const isInLibrary = isPaperInLibrary(paper.id);

  const handleAddToLibrary = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInLibrary) {
      removePaperFromLibrary(paper.id);
    } else {
      addPaperToLibrary(paper);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePaperFavorite(paper.id);
  };

  const handleToggleRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePaperRead(paper.id);
  };

  const truncateAuthors = (authors: Paper['authors'], max: number = 3) => {
    if (authors.length <= max) {
      return authors.map(a => a.name).join(', ');
    }
    return `${authors.slice(0, max).map(a => a.name).join(', ')} +${authors.length - max} more`;
  };

  const truncateAbstract = (abstract: string, maxLength: number = 200) => {
    if (abstract.length <= maxLength) return abstract;
    return abstract.slice(0, maxLength).trim() + '...';
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer ${
        paper.isRead ? 'opacity-75' : ''
      }`}
    >
      {/* Header with badges */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {paper.openAccess && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
              <Unlock className="w-3 h-3" />
              Open Access
            </span>
          )}
          {paper.year > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              <Calendar className="w-3 h-3" />
              {paper.year}
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            <Quote className="w-3 h-3" />
            {paper.citationCount} citations
          </span>
        </div>
        
        {showLibraryActions && (
          <div className="flex items-center gap-1">
            {isInLibrary && (
              <button
                onClick={handleToggleFavorite}
                className={`p-1.5 rounded-md transition-colors ${
                  paper.isFavorite
                    ? 'text-yellow-500 hover:bg-yellow-50'
                    : 'text-gray-400 hover:bg-gray-100'
                }`}
                title={paper.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                {paper.isFavorite ? (
                  <Star className="w-4 h-4 fill-current" />
                ) : (
                  <StarOff className="w-4 h-4" />
                )}
              </button>
            )}
            <button
              onClick={handleAddToLibrary}
              className={`p-1.5 rounded-md transition-colors ${
                isInLibrary
                  ? 'text-green-600 bg-green-50 hover:bg-green-100'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title={isInLibrary ? 'Remove from library' : 'Add to library'}
            >
              {isInLibrary ? (
                <Check className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2">
        {paper.title}
      </h3>

      {/* Authors */}
      <p className="text-sm text-gray-600 mb-2">
        {truncateAuthors(paper.authors)}
      </p>

      {/* Venue */}
      {paper.venue && (
        <p className="text-sm text-gray-500 italic mb-2 line-clamp-1">
          {paper.venue}
        </p>
      )}

      {/* Abstract */}
      {paper.abstract && (
        <p className="text-sm text-gray-600 line-clamp-3 mb-3">
          {truncateAbstract(paper.abstract)}
        </p>
      )}

      {/* Keywords */}
      {paper.keywords.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {paper.keywords.slice(0, 4).map((keyword, index) => (
            <span
              key={index}
              className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600"
            >
              {keyword}
            </span>
          ))}
          {paper.keywords.length > 4 && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-500">
              +{paper.keywords.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2">
          {paper.pdfUrl && (
            <a
              href={paper.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
            >
              <BookOpen className="w-3.5 h-3.5" />
              PDF
            </a>
          )}
          {paper.doi && (
            <a
              href={`https://doi.org/${paper.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              DOI
            </a>
          )}
        </div>
        
        {isInLibrary && (
          <button
            onClick={handleToggleRead}
            className={`text-xs px-2 py-1 rounded ${
              paper.isRead
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {paper.isRead ? 'Read' : 'Mark as read'}
          </button>
        )}
        
        <span className="text-xs text-gray-400 capitalize">
          via {paper.source}
        </span>
      </div>
    </div>
  );
};
