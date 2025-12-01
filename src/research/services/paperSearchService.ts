/**
 * Unified Paper Search Service
 * Aggregates results from multiple academic APIs with fallback support
 */

import type { Paper, SearchFilters, SearchResult } from '../types/paper';
import { semanticScholarService } from './semanticScholarService';
import { openAlexService } from './openAlexService';
import { coreApiService } from './coreApiService';

export type ApiSource = 'semanticscholar' | 'openalex' | 'core' | 'all';

// Fallback order when primary source fails
const FALLBACK_ORDER: Record<ApiSource, ApiSource[]> = {
  semanticscholar: ['openalex', 'core'],
  openalex: ['semanticscholar', 'core'],
  core: ['semanticscholar', 'openalex'],
  all: [],
};

/**
 * Search from a single API source with error handling
 */
async function searchFromSource(
  source: ApiSource,
  query: string,
  filters: SearchFilters,
  page: number,
  pageSize: number
): Promise<SearchResult> {
  switch (source) {
    case 'semanticscholar':
      return semanticScholarService.searchPapers(query, filters, page, pageSize);
    case 'openalex':
      return openAlexService.searchPapers(query, filters, page, pageSize);
    case 'core':
      return coreApiService.searchPapers(query, filters, page, pageSize);
    default:
      throw new Error(`Unknown source: ${source}`);
  }
}

/**
 * Search papers from specified API source(s) with automatic fallback
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

  // Search from all sources and merge results
  if (source === 'all') {
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

  // Try primary source with fallback
  const sourcesToTry = [source, ...FALLBACK_ORDER[source]];

  for (const currentSource of sourcesToTry) {
    try {
      const result = await searchFromSource(currentSource, query, filters, page, pageSize);
      
      // If we got results, return them
      if (result.papers.length > 0 || result.totalResults > 0) {
        return result;
      }
      
      // If no results but no error, try next source
      console.log(`No results from ${currentSource}, trying fallback...`);
    } catch (error) {
      console.error(`Search failed for ${currentSource}:`, error);
      // Continue to try fallback sources
    }
  }

  // All sources failed or returned no results
  console.warn('All search sources failed or returned no results');
  return {
    papers: [],
    totalResults: 0,
    page,
    pageSize,
  };
}

/**
 * Get paper details by ID with fallback support
 */
export async function getPaperDetails(paperId: string): Promise<Paper | null> {
  // Determine source from ID prefix
  if (paperId.startsWith('ss_')) {
    try {
      const paper = await semanticScholarService.getPaperDetails(paperId);
      if (paper) return paper;
    } catch (error) {
      console.error('Semantic Scholar detail fetch failed:', error);
    }
    // Fallback: try other services with DOI if available
    return null;
  }
  
  if (paperId.startsWith('oa_')) {
    try {
      const paper = await openAlexService.getPaperDetails(paperId);
      if (paper) return paper;
    } catch (error) {
      console.error('OpenAlex detail fetch failed:', error);
    }
    return null;
  }
  
  if (paperId.startsWith('core_')) {
    try {
      const paper = await coreApiService.getPaperDetails(paperId);
      if (paper) return paper;
    } catch (error) {
      console.error('CORE detail fetch failed:', error);
    }
    return null;
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
