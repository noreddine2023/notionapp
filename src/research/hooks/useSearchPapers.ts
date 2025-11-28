/**
 * Custom hook for searching papers
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Paper, SearchFilters, SearchResult } from '../types/paper';
import { paperSearchService, ApiSource } from '../services/paperSearchService';

interface UseSearchPapersReturn {
  results: Paper[];
  totalResults: number;
  isLoading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
  search: (query: string) => void;
  loadMore: () => void;
  setFilters: (filters: SearchFilters) => void;
  setSource: (source: ApiSource) => void;
  reset: () => void;
}

const PAGE_SIZE = 10;

export function useSearchPapers(): UseSearchPapersReturn {
  const [results, setResults] = useState<Paper[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [filters, setFiltersState] = useState<SearchFilters>({});
  const [source, setSourceState] = useState<ApiSource>('semanticscholar');
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const executeSearch = useCallback(async (
    searchQuery: string,
    searchPage: number,
    searchFilters: SearchFilters,
    searchSource: ApiSource,
    append: boolean = false
  ) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setTotalResults(0);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const result: SearchResult = await paperSearchService.searchPapers(
        searchQuery,
        searchFilters,
        searchPage,
        PAGE_SIZE,
        searchSource
      );

      if (append) {
        setResults(prev => [...prev, ...result.papers]);
      } else {
        setResults(result.papers);
      }
      setTotalResults(result.totalResults);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message || 'Failed to search papers');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const search = useCallback((newQuery: string) => {
    setQuery(newQuery);
    setPage(1);

    // Debounce search
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      executeSearch(newQuery, 1, filters, source, false);
    }, 300);
  }, [filters, source, executeSearch]);

  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    executeSearch(query, nextPage, filters, source, true);
  }, [page, query, filters, source, executeSearch]);

  const setFilters = useCallback((newFilters: SearchFilters) => {
    setFiltersState(newFilters);
    setPage(1);
    executeSearch(query, 1, newFilters, source, false);
  }, [query, source, executeSearch]);

  const setSource = useCallback((newSource: ApiSource) => {
    setSourceState(newSource);
    setPage(1);
    executeSearch(query, 1, filters, newSource, false);
  }, [query, filters, executeSearch]);

  const reset = useCallback(() => {
    setResults([]);
    setTotalResults(0);
    setPage(1);
    setQuery('');
    setError(null);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const hasMore = results.length < totalResults;

  return {
    results,
    totalResults,
    isLoading,
    error,
    page,
    hasMore,
    search,
    loadMore,
    setFilters,
    setSource,
    reset,
  };
}
