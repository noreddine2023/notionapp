/**
 * Search Papers Component - Search interface for academic papers
 */

import React, { useState, useCallback } from 'react';
import {
  Search,
  Filter,
  X,
  Loader2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useSearchPapers } from '../hooks/useSearchPapers';
import { PaperCard } from './PaperCard';
import { useResearchStore } from '../store/researchStore';
import type { SearchFilters } from '../types/paper';
import type { ApiSource } from '../services/paperSearchService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

export const SearchPapers: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFiltersState] = useState<SearchFilters>({});
  const [source, setSourceState] = useState<ApiSource>('semanticscholar');

  const {
    results,
    totalResults,
    isLoading,
    error,
    hasMore,
    query,
    search,
    updateQuery,
    loadMore,
    setFilters,
    setSource,
  } = useSearchPapers();

  const { setCurrentView, setSelectedPaper } = useResearchStore();

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    search(query);
  }, [query, search]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    updateQuery(value);
  }, [updateQuery]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      search(query);
    }
  }, [query, search]);

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
      <div className="p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search papers by title, author, keywords..."
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="pl-9 pr-9"
            />
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => updateQuery('')}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          <Button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Search
          </Button>
        </form>

        {/* Filter toggle and source selector */}
        <div className="flex items-center justify-between mt-3">
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button
                variant={Object.keys(filters).length > 0 ? "default" : "outline"}
                size="sm"
                className="gap-1.5"
              >
                <Filter className="w-4 h-4" />
                Filters
                {Object.keys(filters).length > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                    {Object.keys(filters).length}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Search Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Year From
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g., 2020"
                      value={filters.yearFrom || ''}
                      onChange={(e) => handleFilterChange('yearFrom', e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Year To
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g., 2024"
                      value={filters.yearTo || ''}
                      onChange={(e) => handleFilterChange('yearTo', e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Sort By
                  </label>
                  <Select
                    value={filters.sortBy || 'relevance'}
                    onValueChange={(value) => handleFilterChange('sortBy', value as SearchFilters['sortBy'])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sort order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="date">Date (newest first)</SelectItem>
                      <SelectItem value="citations">Citations (most cited)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.openAccessOnly || false}
                    onChange={(e) => handleFilterChange('openAccessOnly', e.target.checked || undefined)}
                    className="w-4 h-4 text-primary rounded border-input focus:ring-ring"
                  />
                  <span className="text-sm">Open Access only</span>
                </label>

                {Object.keys(filters).length > 0 && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    Clear all filters
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Source:</span>
            <Select value={source} onValueChange={(value) => handleSourceChange(value as ApiSource)}>
              <SelectTrigger className="w-[180px] h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semanticscholar">Semantic Scholar</SelectItem>
                <SelectItem value="openalex">OpenAlex</SelectItem>
                <SelectItem value="core">CORE</SelectItem>
                <SelectItem value="all">All Sources</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {/* Results count */}
          {totalResults > 0 && (
            <div className="mb-4">
              <Badge variant="secondary" className="text-sm">
                {totalResults.toLocaleString()} papers found
              </Badge>
            </div>
          )}

          {/* Loading state */}
          {isLoading && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Searching papers...</p>
              <div className="w-full space-y-3">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg mb-4 border border-destructive/20">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && results.length === 0 && query && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">No papers found</p>
              <p className="text-xs text-muted-foreground">
                Try different keywords or adjust your filters
              </p>
            </div>
          )}

          {/* Initial state */}
          {!isLoading && !error && results.length === 0 && !query && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="w-12 h-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">Search for scientific papers</p>
              <p className="text-xs text-muted-foreground">
                Enter keywords, author names, or DOIs and press Search or Enter
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
              <Button
                onClick={loadMore}
                variant="outline"
              >
                Load more papers
              </Button>
            </div>
          )}

          {/* Loading more indicator */}
          {isLoading && results.length > 0 && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
