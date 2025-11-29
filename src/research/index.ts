/**
 * Research module exports
 */

// Components
export { ResearchSidebar } from './components/ResearchSidebar';
export { ResearchPanel } from './components/ResearchPanel';
export { SearchPapers } from './components/SearchPapers';
export { PaperLibrary } from './components/PaperLibrary';
export { PaperDetail } from './components/PaperDetail';
export { PaperCard } from './components/PaperCard';
export { ResearchProjects } from './components/ResearchProjects';
export { PdfReader } from './components/PdfReader';
export { AnnotationSidebar } from './components/AnnotationSidebar';
export { AnnotationLayer } from './components/AnnotationLayer';
export { HighlightPopover } from './components/HighlightPopover';

// Store
export { useResearchStore } from './store/researchStore';

// Hooks
export { useSearchPapers } from './hooks/useSearchPapers';
export { usePaperDetails } from './hooks/usePaperDetails';

// Services
export { paperSearchService } from './services/paperSearchService';
export { citationService } from './services/citationService';
export { pdfStorageService } from './services/pdfStorageService';
export { pdfDownloadService } from './services/pdfDownloadService';

// Types
export type {
  Paper,
  Author,
  ResearchProject,
  SearchFilters,
  SearchResult,
  CitationFormat,
  ResearchView,
  PdfStorage,
  ReadingProgress,
  PdfAnnotation,
  AnnotationType,
  HighlightColor,
  AnnotationRect,
} from './types/paper';
