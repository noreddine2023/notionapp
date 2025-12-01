/**
 * Research Types
 * 
 * Core types for the Research feature.
 */

export interface Paper {
  id: string;
  title: string;
  authors: Author[];
  abstract: string;
  publishedDate: Date;
  journal?: string;
  doi?: string;
  url?: string;
  tags: string[];
  isSaved: boolean;
  annotations?: Annotation[];
}

export interface Author {
  id: string;
  name: string;
  affiliation?: string;
}

export interface Annotation {
  id: string;
  paperId: string;
  type: "highlight" | "note" | "bookmark";
  content: string;
  position?: {
    page: number;
    x: number;
    y: number;
  };
  color?: string;
  createdAt: Date;
}

export interface ResearchProject {
  id: string;
  name: string;
  description?: string;
  papers: string[]; // Paper IDs
  notes: string[]; // Note IDs
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchFilters {
  query: string;
  dateFrom?: Date;
  dateTo?: Date;
  authors?: string[];
  journals?: string[];
}

export interface SearchResult {
  papers: Paper[];
  totalCount: number;
  page: number;
  pageSize: number;
}
