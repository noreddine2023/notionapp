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
  /** @deprecated PDFs are no longer stored locally. Use pdfUrl for viewing. */
  hasLocalPdf?: boolean;
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

export type ResearchView = 'search' | 'library' | 'projects' | 'paper-detail' | 'pdf-reader' | 'whiteboard';

// PDF Storage Types
/**
 * @deprecated PDF blobs are no longer stored locally. PDFs are fetched directly from source URLs.
 * Only annotation and reading progress data is persisted.
 */
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

// Whiteboard Types
export interface WhiteboardComment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WhiteboardNodeData {
  label?: string;
  color?: string;
  fontSize?: 'small' | 'medium' | 'large';
}

export interface PaperNodeData extends WhiteboardNodeData {
  paperId: string;
  title: string;
  authors: string[];
  year: number;
  doi?: string;
  citationCount?: number;
  comments: WhiteboardComment[];
}

export interface StickyNodeData extends WhiteboardNodeData {
  content: string;
  color: string;
}

export interface TextNodeData extends WhiteboardNodeData {
  content: string;
  fontSize: 'small' | 'medium' | 'large';
  bold?: boolean;
  italic?: boolean;
}

export interface ShapeNodeData extends WhiteboardNodeData {
  shapeType: 'rectangle' | 'circle' | 'triangle';
  fillColor: string;
  borderColor: string;
}

export interface ImageNodeData extends WhiteboardNodeData {
  imageUrl: string;
  alt?: string;
}

export interface WhiteboardState {
  id: string;
  projectId: string;
  nodes: WhiteboardNodeSerialized[];
  edges: WhiteboardEdgeSerialized[];
  viewport: { x: number; y: number; zoom: number };
  createdAt: Date;
  updatedAt: Date;
}

export interface WhiteboardNodeSerialized {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: WhiteboardNodeData | PaperNodeData | StickyNodeData | TextNodeData | ShapeNodeData | ImageNodeData;
  width?: number;
  height?: number;
}

export interface WhiteboardEdgeSerialized {
  id: string;
  source: string;
  target: string;
  type?: string;
  label?: string;
  style?: {
    strokeDasharray?: string;
    stroke?: string;
  };
  markerEnd?: string;
}
