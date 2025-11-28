/**
 * Unified Paper Search Service
 * Aggregates results from multiple academic APIs
 */

import type { Paper, SearchFilters, SearchResult } from '../types/paper';
import { semanticScholarService } from './semanticScholarService';
import { openAlexService } from './openAlexService';
import { coreApiService } from './coreApiService';

export type ApiSource = 'semanticscholar' | 'openalex' | 'core' | 'all';

/**
 * Search papers from specified API source(s)
 */
export async function searchPapers(
  query: string,
  filters: SearchFilters = {},
  page: number = 1,
  pageSize: number = 10,
  source: ApiSource = 'semanticscholar'
): Promise<SearchResult> {
  if (!query.trim()) {
    return {
      papers: [],
      totalResults: 0,
      page,
      pageSize,
    };
  }

  // Search from a single source
  if (source !== 'all') {
    switch (source) {
      case 'semanticscholar':
        return semanticScholarService.searchPapers(query, filters, page, pageSize);
      case 'openalex':
        return openAlexService.searchPapers(query, filters, page, pageSize);
      case 'core':
        return coreApiService.searchPapers(query, filters, page, pageSize);
      default:
        return semanticScholarService.searchPapers(query, filters, page, pageSize);
    }
  }

  // Search from all sources and merge results
  const resultsPerSource = Math.ceil(pageSize / 3);
  
  const [ssResult, oaResult, coreResult] = await Promise.allSettled([
    semanticScholarService.searchPapers(query, filters, page, resultsPerSource),
    openAlexService.searchPapers(query, filters, page, resultsPerSource),
    coreApiService.searchPapers(query, filters, page, resultsPerSource),
  ]);

  const papers: Paper[] = [];
  let totalResults = 0;

  if (ssResult.status === 'fulfilled') {
    papers.push(...ssResult.value.papers);
    totalResults += ssResult.value.totalResults;
  }
  
  if (oaResult.status === 'fulfilled') {
    papers.push(...oaResult.value.papers);
    totalResults += oaResult.value.totalResults;
  }
  
  if (coreResult.status === 'fulfilled') {
    papers.push(...coreResult.value.papers);
    totalResults += coreResult.value.totalResults;
  }

  // Deduplicate by DOI if available
  const seenDois = new Set<string>();
  const uniquePapers = papers.filter(paper => {
    if (!paper.doi) return true;
    if (seenDois.has(paper.doi)) return false;
    seenDois.add(paper.doi);
    return true;
  });

  // Sort merged results
  if (filters.sortBy === 'citations') {
    uniquePapers.sort((a, b) => b.citationCount - a.citationCount);
  } else if (filters.sortBy === 'date') {
    uniquePapers.sort((a, b) => b.year - a.year);
  }

  return {
    papers: uniquePapers.slice(0, pageSize),
    totalResults,
    page,
    pageSize,
  };
}

/**
 * Get paper details by ID
 */
export async function getPaperDetails(paperId: string): Promise<Paper | null> {
  if (paperId.startsWith('ss_')) {
    return semanticScholarService.getPaperDetails(paperId);
  } else if (paperId.startsWith('oa_')) {
    return openAlexService.getPaperDetails(paperId);
  } else if (paperId.startsWith('core_')) {
    return coreApiService.getPaperDetails(paperId);
  }
  
  // Try all services if prefix is unknown
  const results = await Promise.allSettled([
    semanticScholarService.getPaperDetails(paperId),
    openAlexService.getPaperDetails(paperId),
    coreApiService.getPaperDetails(paperId),
  ]);

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value) {
      return result.value;
    }
  }

  return null;
}

export const paperSearchService = {
  searchPapers,
  getPaperDetails,
};
