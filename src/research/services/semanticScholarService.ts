/**
 * Semantic Scholar API Service
 * https://api.semanticscholar.org/
 */

import type { Paper, Author, SearchFilters, SearchResult } from '../types/paper';

const BASE_URL = 'https://api.semanticscholar.org/graph/v1';

// Rate limiting: Semantic Scholar allows 100 requests per 5 minutes
const RATE_LIMIT_DELAY = 200; // ms between requests
let lastRequestTime = 0;

interface SemanticScholarAuthor {
  authorId: string;
  name: string;
}

interface SemanticScholarPaper {
  paperId: string;
  title: string;
  abstract: string | null;
  year: number | null;
  authors: SemanticScholarAuthor[];
  venue: string | null;
  citationCount: number;
  isOpenAccess: boolean;
  openAccessPdf?: { url: string } | null;
  externalIds?: {
    DOI?: string;
  };
  fieldsOfStudy?: string[] | null;
}

interface SemanticScholarSearchResponse {
  total: number;
  offset: number;
  data: SemanticScholarPaper[];
}

/**
 * Normalize Semantic Scholar paper to common Paper interface
 */
function normalizePaper(paper: SemanticScholarPaper): Paper {
  return {
    id: `ss_${paper.paperId}`,
    title: paper.title || 'Untitled',
    authors: (paper.authors || []).map((a): Author => ({
      name: a?.name || 'Unknown Author',
      id: a?.authorId,
    })),
    abstract: paper.abstract || '',
    year: paper.year || 0,
    doi: paper.externalIds?.DOI,
    venue: paper.venue || undefined,
    citationCount: paper.citationCount || 0,
    pdfUrl: paper.openAccessPdf?.url,
    openAccess: paper.isOpenAccess || false,
    keywords: paper.fieldsOfStudy || [],
    source: 'semanticscholar',
    isRead: false,
    isFavorite: false,
  };
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
  options: RequestInit = {},
  maxRetries: number = 3
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      await waitForRateLimit();
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Accept': 'application/json',
          ...options.headers,
        },
      });
      
      // If rate limited (429), wait and retry
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '5', 10);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        continue;
      }
      
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      // Exponential backoff
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  throw lastError || new Error('Request failed after retries');
}

/**
 * Search papers using Semantic Scholar API
 */
export async function searchPapers(
  query: string,
  filters: SearchFilters = {},
  page: number = 1,
  pageSize: number = 10
): Promise<SearchResult> {
  const offset = (page - 1) * pageSize;
  
  const params = new URLSearchParams({
    query,
    offset: offset.toString(),
    limit: pageSize.toString(),
    fields: 'paperId,title,abstract,year,authors,venue,citationCount,isOpenAccess,openAccessPdf,externalIds,fieldsOfStudy',
  });

  // Add year filter
  if (filters.yearFrom || filters.yearTo) {
    const yearFilter = `${filters.yearFrom || ''}:${filters.yearTo || ''}`;
    params.append('year', yearFilter);
  }

  // Add open access filter
  if (filters.openAccessOnly) {
    params.append('openAccessPdf', '');
  }

  try {
    const response = await fetchWithRetry(`${BASE_URL}/paper/search?${params.toString()}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Semantic Scholar API error:', response.status, errorText);
      throw new Error(`Semantic Scholar API error: ${response.status}`);
    }

    const data: SemanticScholarSearchResponse = await response.json();

    // Handle empty or malformed response
    if (!data || !data.data) {
      return {
        papers: [],
        totalResults: 0,
        page,
        pageSize,
      };
    }

    let papers = data.data
      .filter(p => p && p.paperId && p.title) // Filter out invalid papers
      .map(normalizePaper);

    // Apply sorting (API doesn't fully support all sort options)
    if (filters.sortBy === 'citations') {
      papers.sort((a, b) => b.citationCount - a.citationCount);
    } else if (filters.sortBy === 'date') {
      papers.sort((a, b) => b.year - a.year);
    }

    return {
      papers,
      totalResults: data.total || papers.length,
      page,
      pageSize,
    };
  } catch (error) {
    console.error('Semantic Scholar search error:', error);
    throw error; // Re-throw so the paperSearchService can handle fallback
  }
}

/**
 * Get paper details by ID
 */
export async function getPaperDetails(paperId: string): Promise<Paper | null> {
  // Remove the ss_ prefix if present
  const cleanId = paperId.replace(/^ss_/, '');
  
  const fields = 'paperId,title,abstract,year,authors,venue,citationCount,isOpenAccess,openAccessPdf,externalIds,fieldsOfStudy,references,citations';
  
  try {
    const response = await fetchWithRetry(`${BASE_URL}/paper/${cleanId}?fields=${fields}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Semantic Scholar API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !data.paperId) {
      return null;
    }
    
    return normalizePaper(data);
  } catch (error) {
    console.error('Semantic Scholar paper details error:', error);
    return null;
  }
}

export const semanticScholarService = {
  searchPapers,
  getPaperDetails,
};
