/**
 * Custom hook for getting paper details
 */

import { useState, useCallback, useEffect } from 'react';
import type { Paper } from '../types/paper';
import { paperSearchService } from '../services/paperSearchService';
import { useResearchStore } from '../store/researchStore';

interface UsePaperDetailsReturn {
  paper: Paper | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePaperDetails(paperId: string | null): UsePaperDetailsReturn {
  const [paper, setPaper] = useState<Paper | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const getPaperById = useResearchStore(state => state.getPaperById);

  const fetchPaper = useCallback(async () => {
    if (!paperId) {
      setPaper(null);
      return;
    }

    // First, check if paper is in library
    const libraryPaper = getPaperById(paperId);
    if (libraryPaper) {
      setPaper(libraryPaper);
      return;
    }

    // Otherwise, fetch from API
    setIsLoading(true);
    setError(null);

    try {
      const result = await paperSearchService.getPaperDetails(paperId);
      setPaper(result);
      
      if (!result) {
        setError('Paper not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch paper details');
    } finally {
      setIsLoading(false);
    }
  }, [paperId, getPaperById]);

  useEffect(() => {
    fetchPaper();
  }, [fetchPaper]);

  const refetch = useCallback(() => {
    fetchPaper();
  }, [fetchPaper]);

  return {
    paper,
    isLoading,
    error,
    refetch,
  };
}
