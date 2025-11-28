/**
 * OpenAlex API Service
 * https://docs.openalex.org/
 */

import type { Paper, Author, SearchFilters, SearchResult } from '../types/paper';

const BASE_URL = 'https://api.openalex.org';

// Rate limiting
const RATE_LIMIT_DELAY = 100;
let lastRequestTime = 0;

interface OpenAlexAuthor {
  author: {
    id: string;
    display_name: string;
  };
}

interface OpenAlexWork {
  id: string;
  title: string;
  abstract_inverted_index?: Record<string, number[]>;
  publication_year: number | null;
  authorships: OpenAlexAuthor[];
  primary_location?: {
    source?: {
      display_name: string;
    };
  };
  cited_by_count: number;
  open_access: {
    is_oa: boolean;
    oa_url?: string;
  };
  doi?: string;
  keywords?: Array<{ keyword: string }>;
  concepts?: Array<{ display_name: string }>;
}

interface OpenAlexSearchResponse {
  meta: {
    count: number;
    page: number;
    per_page: number;
  };
  results: OpenAlexWork[];
}

/**
 * Wait for rate limit
 */
async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();
}

/**
 * Fetch with retry logic
 */
async function fetchWithRetry(
  url: string,
  maxRetries: number = 3
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      await waitForRateLimit();
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (response.status === 429) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        continue;
      }
      
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  throw lastError || new Error('Request failed after retries');
}

/**
 * Reconstruct abstract from inverted index
 */
function reconstructAbstract(invertedIndex: Record<string, number[]> | undefined): string {
  if (!invertedIndex) return '';
  
  const words: { word: string; position: number }[] = [];
  
  for (const [word, positions] of Object.entries(invertedIndex)) {
    for (const position of positions) {
      words.push({ word, position });
    }
  }
  
  words.sort((a, b) => a.position - b.position);
  return words.map(w => w.word).join(' ');
}

/**
 * Normalize OpenAlex work to common Paper interface
 */
function normalizePaper(work: OpenAlexWork): Paper {
  const abstractText = reconstructAbstract(work.abstract_inverted_index);
  
  // Extract keywords from concepts or keywords
  const keywords: string[] = [];
  if (work.keywords) {
    keywords.push(...work.keywords.map(k => k.keyword));
  }
  if (work.concepts) {
    keywords.push(...work.concepts.slice(0, 5).map(c => c.display_name));
  }

  // Extract OpenAlex ID from URL
  const openAlexId = work.id.split('/').pop() || work.id;

  return {
    id: `oa_${openAlexId}`,
    title: work.title || 'Untitled',
    authors: (work.authorships || []).map((a): Author => ({
      name: a?.author?.display_name || 'Unknown Author',
      id: a?.author?.id,
    })),
    abstract: abstractText,
    year: work.publication_year || 0,
    doi: work.doi?.replace('https://doi.org/', ''),
    venue: work.primary_location?.source?.display_name,
    citationCount: work.cited_by_count || 0,
    pdfUrl: work.open_access?.oa_url,
    openAccess: work.open_access?.is_oa || false,
    keywords: [...new Set(keywords)].slice(0, 10),
    source: 'openalex',
    isRead: false,
    isFavorite: false,
  };
}

/**
 * Search papers using OpenAlex API
 */
export async function searchPapers(
  query: string,
  filters: SearchFilters = {},
  page: number = 1,
  pageSize: number = 10
): Promise<SearchResult> {
  const params = new URLSearchParams({
    search: query,
    page: page.toString(),
    per_page: pageSize.toString(),
  });

  // Build filter string
  const filterParts: string[] = [];
  
  if (filters.yearFrom) {
    filterParts.push(`publication_year:>=${filters.yearFrom}`);
  }
  if (filters.yearTo) {
    filterParts.push(`publication_year:<=${filters.yearTo}`);
  }
  if (filters.openAccessOnly) {
    filterParts.push('is_oa:true');
  }
  
  if (filterParts.length > 0) {
    params.append('filter', filterParts.join(','));
  }

  // Add sorting
  if (filters.sortBy === 'citations') {
    params.append('sort', 'cited_by_count:desc');
  } else if (filters.sortBy === 'date') {
    params.append('sort', 'publication_year:desc');
  } else {
    params.append('sort', 'relevance_score:desc');
  }

  try {
    const response = await fetchWithRetry(`${BASE_URL}/works?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`OpenAlex API error: ${response.status}`);
    }

    const data: OpenAlexSearchResponse = await response.json();
    
    if (!data || !data.results) {
      return {
        papers: [],
        totalResults: 0,
        page,
        pageSize,
      };
    }

    return {
      papers: data.results
        .filter(w => w && w.id && w.title)
        .map(normalizePaper),
      totalResults: data.meta?.count || 0,
      page: data.meta?.page || page,
      pageSize: data.meta?.per_page || pageSize,
    };
  } catch (error) {
    console.error('OpenAlex search error:', error);
    throw error;
  }
}

/**
 * Get paper details by ID
 */
export async function getPaperDetails(paperId: string): Promise<Paper | null> {
  // Remove the oa_ prefix if present
  const cleanId = paperId.replace(/^oa_/, '');
  
  try {
    const response = await fetchWithRetry(`${BASE_URL}/works/${cleanId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`OpenAlex API error: ${response.status}`);
    }

    const data: OpenAlexWork = await response.json();
    
    if (!data || !data.id) {
      return null;
    }
    
    return normalizePaper(data);
  } catch (error) {
    console.error('OpenAlex paper details error:', error);
    return null;
  }
}

export const openAlexService = {
  searchPapers,
  getPaperDetails,
};
