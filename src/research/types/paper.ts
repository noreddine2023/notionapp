/**
 * Types for Scientific Papers and Research Management
 */

export interface Author {
  name: string;
  id?: string;
}

export interface Paper {
  id: string;
  title: string;
  authors: Author[];
  abstract: string;
  year: number;
  doi?: string;
  venue?: string;
  citationCount: number;
  pdfUrl?: string;
  openAccess: boolean;
  keywords: string[];
  source: 'core' | 'openalex' | 'semanticscholar';
  addedAt?: Date;
  isRead: boolean;
  isFavorite: boolean;
  personalNotes?: string;
  references?: string[]; // IDs of papers this paper cites
  citedBy?: string[]; // IDs of papers that cite this paper
}

export interface ResearchProject {
  id: string;
  name: string;
  description?: string;
  parentId?: string; // for sub-projects
  paperIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchFilters {
  yearFrom?: number;
  yearTo?: number;
  openAccessOnly?: boolean;
  sortBy?: 'relevance' | 'date' | 'citations';
}

export interface SearchResult {
  papers: Paper[];
  totalResults: number;
  page: number;
  pageSize: number;
}

export type CitationFormat = 'apa' | 'mla' | 'chicago' | 'harvard' | 'bibtex' | 'ieee';

export type ResearchView = 'search' | 'library' | 'projects' | 'paper-detail';
