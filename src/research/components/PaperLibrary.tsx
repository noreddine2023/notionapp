/**
 * Paper Library Component - View and manage saved papers
 */

import React, { useState } from 'react';
import {
  Search,
  Star,
  BookOpen,
  Filter,
  X,
  Library,
  Grid,
  List,
} from 'lucide-react';
import { PaperCard } from './PaperCard';
import { useResearchStore } from '../store/researchStore';

type ViewMode = 'grid' | 'list';

export const PaperLibrary: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    papers,
    libraryFilter,
    setLibraryFilter,
    getFilteredLibraryPapers,
    setCurrentView,
    setSelectedPaper,
    setSearchQuery: setStoreSearchQuery,
  } = useResearchStore();

  // Apply local search filter
  const filteredPapers = React.useMemo(() => {
    let filtered = getFilteredLibraryPapers();
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.authors.some(a => a.name.toLowerCase().includes(query)) ||
        p.abstract.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [getFilteredLibraryPapers, searchQuery]);

  const handlePaperClick = (paperId: string) => {
    setSelectedPaper(paperId);
    setCurrentView('paper-detail');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setStoreSearchQuery(e.target.value);
  };

  const stats = {
    total: papers.length,
    favorites: papers.filter(p => p.isFavorite).length,
    unread: papers.filter(p => !p.isRead).length,
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Library className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">My Library</h2>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
              title="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search your library..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-9 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStoreSearchQuery('');
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-200 text-gray-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLibraryFilter('all')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
              libraryFilter === 'all'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            All ({stats.total})
          </button>
          <button
            onClick={() => setLibraryFilter('favorites')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
              libraryFilter === 'favorites'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            Favorites ({stats.favorites})
          </button>
          <button
            onClick={() => setLibraryFilter('unread')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
              libraryFilter === 'unread'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Unread ({stats.unread})
          </button>
        </div>
      </div>

      {/* Papers list */}
      <div className="flex-1 overflow-y-auto p-4">
        {papers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Library className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500 mb-1">Your library is empty</p>
            <p className="text-xs text-gray-400">
              Search for papers and add them to your library
            </p>
          </div>
        ) : filteredPapers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500 mb-1">No papers match your filters</p>
            <p className="text-xs text-gray-400">
              Try different search terms or filters
            </p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-3' : 'space-y-3'}>
            {filteredPapers.map((paper) => (
              <PaperCard
                key={paper.id}
                paper={paper}
                onClick={() => handlePaperClick(paper.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
