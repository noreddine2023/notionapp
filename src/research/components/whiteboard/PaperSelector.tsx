/**
 * PaperSelector - Modal to select papers from library for whiteboard
 */

import React, { useState, useMemo } from 'react';
import { X, Search, FileText, Calendar, Users } from 'lucide-react';
import { useResearchStore } from '../../store/researchStore';
import type { Paper } from '../../types/paper';

interface PaperSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPaper: (paper: Paper) => void;
  existingPaperIds?: string[];
}

export const PaperSelector: React.FC<PaperSelectorProps> = ({
  isOpen,
  onClose,
  onSelectPaper,
  existingPaperIds = [],
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { papers } = useResearchStore();

  const filteredPapers = useMemo(() => {
    let filtered = papers.filter(p => !existingPaperIds.includes(p.id));
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.authors.some(a => a.name.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }, [papers, searchQuery, existingPaperIds]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Add Paper to Whiteboard</h2>
            <p className="text-sm text-gray-500 mt-0.5">Select a paper from your library</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Search */}
        <div className="px-6 py-3 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search papers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        {/* Papers list */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredPapers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">
                {papers.length === 0 
                  ? 'No papers in your library' 
                  : existingPaperIds.length === papers.length
                    ? 'All papers are already on the whiteboard'
                    : 'No papers match your search'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPapers.map((paper) => (
                <button
                  key={paper.id}
                  onClick={() => {
                    onSelectPaper(paper);
                    onClose();
                  }}
                  className="w-full text-left p-4 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-200 transition-colors group"
                >
                  <h3 className="font-medium text-gray-800 text-sm line-clamp-2 group-hover:text-blue-700">
                    {paper.title}
                  </h3>
                  
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[200px]">
                        {paper.authors.slice(0, 2).map(a => a.name).join(', ')}
                        {paper.authors.length > 2 && ' et al.'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{paper.year}</span>
                    </div>
                    
                    {paper.citationCount > 0 && (
                      <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                        {paper.citationCount} citations
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <p className="text-xs text-gray-500">
            {filteredPapers.length} paper{filteredPapers.length !== 1 ? 's' : ''} available
          </p>
        </div>
      </div>
    </div>
  );
};
