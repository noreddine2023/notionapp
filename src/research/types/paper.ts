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
  hasLocalPdf?: boolean; // Whether PDF is stored locally
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

export type ResearchView = 'search' | 'library' | 'projects' | 'paper-detail' | 'pdf-reader';

// PDF Storage Types
export interface PdfStorage {
  paperId: string;
  pdfBlob: Blob;
  fileName: string;
  fileSize: number;
  downloadedAt: Date;
  source: 'api' | 'upload';
}

export interface ReadingProgress {
  paperId: string;
  currentPage: number;
  totalPages: number;
  percentComplete: number;
  lastReadAt: Date;
}

// PDF Annotation Types
export type AnnotationType = 'highlight' | 'underline' | 'note' | 'drawing';
export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'orange' | 'purple';

export interface AnnotationRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PdfAnnotation {
  id: string;
  paperId: string;
  pageNumber: number;
  type: AnnotationType;
  color: HighlightColor;
  rects: AnnotationRect[];
  textContent?: string; // selected text for highlights
  noteContent?: string; // user's note
  createdAt: Date;
  updatedAt: Date;
}
