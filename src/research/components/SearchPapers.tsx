/**
 * Search Papers Component - Search interface for academic papers
 */

import React, { useState, useCallback } from 'react';
import {
  Search,
  Filter,
  X,
  ChevronDown,
  Loader2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useSearchPapers } from '../hooks/useSearchPapers';
import { PaperCard } from './PaperCard';
import { useResearchStore } from '../store/researchStore';
import type { SearchFilters } from '../types/paper';
import type { ApiSource } from '../services/paperSearchService';

export const SearchPapers: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFiltersState] = useState<SearchFilters>({});
  const [source, setSourceState] = useState<ApiSource>('semanticscholar');

  const {
    results,
    totalResults,
    isLoading,
    error,
    hasMore,
    search,
    loadMore,
    setFilters,
    setSource,
  } = useSearchPapers();

  const { setCurrentView, setSelectedPaper } = useResearchStore();

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    search(searchInput);
  }, [searchInput, search]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    search(value);
  }, [search]);

  const handleFilterChange = useCallback((key: keyof SearchFilters, value: unknown) => {
    const newFilters = { ...filters, [key]: value };
    setFiltersState(newFilters);
    setFilters(newFilters);
  }, [filters, setFilters]);

  const handleSourceChange = useCallback((newSource: ApiSource) => {
    setSourceState(newSource);
    setSource(newSource);
  }, [setSource]);

  const handlePaperClick = useCallback((paperId: string) => {
    setSelectedPaper(paperId);
    setCurrentView('paper-detail');
  }, [setSelectedPaper, setCurrentView]);

  const clearFilters = useCallback(() => {
    setFiltersState({});
    setFilters({});
  }, [setFilters]);

  return (
    <div className="flex flex-col h-full">
      {/* Search Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search papers by title, author, keywords..."
            value={searchInput}
            onChange={handleInputChange}
            className="w-full pl-10 pr-10 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                search('');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-200 text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Filter toggle and source selector */}
        <div className="flex items-center justify-between mt-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
              showFilters || Object.keys(filters).length > 0
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {Object.keys(filters).length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                {Object.keys(filters).length}
              </span>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Source:</span>
            <select
              value={source}
              onChange={(e) => handleSourceChange(e.target.value as ApiSource)}
              className="text-sm bg-white border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="semanticscholar">Semantic Scholar</option>
              <option value="openalex">OpenAlex</option>
              <option value="core">CORE</option>
              <option value="all">All Sources</option>
            </select>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Year From
                </label>
                <input
                  type="number"
                  placeholder="e.g., 2020"
                  value={filters.yearFrom || ''}
                  onChange={(e) => handleFilterChange('yearFrom', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Year To
                </label>
                <input
                  type="number"
                  placeholder="e.g., 2024"
                  value={filters.yearTo || ''}
                  onChange={(e) => handleFilterChange('yearTo', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Sort By
              </label>
              <select
                value={filters.sortBy || 'relevance'}
                onChange={(e) => handleFilterChange('sortBy', e.target.value as SearchFilters['sortBy'])}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="relevance">Relevance</option>
                <option value="date">Date (newest first)</option>
                <option value="citations">Citations (most cited)</option>
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.openAccessOnly || false}
                onChange={(e) => handleFilterChange('openAccessOnly', e.target.checked || undefined)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Open Access only</span>
            </label>

            {Object.keys(filters).length > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Results count */}
        {totalResults > 0 && (
          <p className="text-sm text-gray-500 mb-4">
            Found {totalResults.toLocaleString()} papers
          </p>
        )}

        {/* Loading state */}
        {isLoading && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
            <p className="text-sm text-gray-500">Searching papers...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg mb-4">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && results.length === 0 && searchInput && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500 mb-1">No papers found</p>
            <p className="text-xs text-gray-400">
              Try different keywords or adjust your filters
            </p>
          </div>
        )}

        {/* Initial state */}
        {!isLoading && !error && results.length === 0 && !searchInput && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500 mb-1">Search for scientific papers</p>
            <p className="text-xs text-gray-400">
              Enter keywords, author names, or DOIs to find papers
            </p>
          </div>
        )}

        {/* Results list */}
        <div className="space-y-3">
          {results.map((paper) => (
            <PaperCard
              key={paper.id}
              paper={paper}
              onClick={() => handlePaperClick(paper.id)}
            />
          ))}
        </div>

        {/* Load more */}
        {hasMore && !isLoading && (
          <div className="mt-4 text-center">
            <button
              onClick={loadMore}
              className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Load more papers
            </button>
          </div>
        )}

        {/* Loading more indicator */}
        {isLoading && results.length > 0 && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};
