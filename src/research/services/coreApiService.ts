/**
 * CORE API Service
 * https://core.ac.uk/services/api
 */

import type { Paper, Author, SearchFilters, SearchResult } from '../types/paper';

const BASE_URL = 'https://api.core.ac.uk/v3';

interface CoreAuthor {
  name: string;
}

interface CoreWork {
  id: string;
  title: string;
  abstract?: string;
  yearPublished?: number;
  authors: CoreAuthor[];
  publisher?: string;
  journals?: Array<{ title: string }>;
  citationCount?: number;
  downloadUrl?: string;
  doi?: string;
  fieldOfStudy?: string;
}

interface CoreSearchResponse {
  totalHits: number;
  limit: number;
  offset: number;
  results: CoreWork[];
}

/**
 * Normalize CORE work to common Paper interface
 */
function normalizePaper(work: CoreWork): Paper {
  return {
    id: `core_${work.id}`,
    title: work.title || 'Untitled',
    authors: work.authors?.map((a): Author => ({
      name: a.name,
    })) || [],
    abstract: work.abstract || '',
    year: work.yearPublished || 0,
    doi: work.doi,
    venue: work.journals?.[0]?.title || work.publisher,
    citationCount: work.citationCount || 0,
    pdfUrl: work.downloadUrl,
    openAccess: !!work.downloadUrl,
    keywords: work.fieldOfStudy ? [work.fieldOfStudy] : [],
    source: 'core',
    isRead: false,
    isFavorite: false,
  };
}

/**
 * Search papers using CORE API
 */
export async function searchPapers(
  query: string,
  filters: SearchFilters = {},
  page: number = 1,
  pageSize: number = 10
): Promise<SearchResult> {
  const offset = (page - 1) * pageSize;

  // Build query with filters
  let searchQuery = query;
  
  if (filters.yearFrom || filters.yearTo) {
    const yearFrom = filters.yearFrom || 1900;
    const yearTo = filters.yearTo || new Date().getFullYear();
    searchQuery += ` AND yearPublished:[${yearFrom} TO ${yearTo}]`;
  }

  const params = new URLSearchParams({
    q: searchQuery,
    offset: offset.toString(),
    limit: pageSize.toString(),
  });

  // Add sorting
  if (filters.sortBy === 'date') {
    params.append('sort', 'yearPublished:desc');
  } else if (filters.sortBy === 'citations') {
    params.append('sort', 'citationCount:desc');
  }

  try {
    const response = await fetch(`${BASE_URL}/search/works?${params.toString()}`, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`CORE API error: ${response.status}`);
    }

    const data: CoreSearchResponse = await response.json();

    let papers = data.results.map(normalizePaper);

    // Filter for open access only if requested
    if (filters.openAccessOnly) {
      papers = papers.filter(p => p.openAccess);
    }

    return {
      papers,
      totalResults: data.totalHits,
      page,
      pageSize,
    };
  } catch (error) {
    console.error('CORE search error:', error);
    return {
      papers: [],
      totalResults: 0,
      page,
      pageSize,
    };
  }
}

/**
 * Get paper details by ID
 */
export async function getPaperDetails(paperId: string): Promise<Paper | null> {
  // Remove the core_ prefix if present
  const cleanId = paperId.replace(/^core_/, '');
  
  try {
    const response = await fetch(`${BASE_URL}/works/${cleanId}`, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`CORE API error: ${response.status}`);
    }

    const data: CoreWork = await response.json();
    return normalizePaper(data);
  } catch (error) {
    console.error('CORE paper details error:', error);
    return null;
  }
}

export const coreApiService = {
  searchPapers,
  getPaperDetails,
};
