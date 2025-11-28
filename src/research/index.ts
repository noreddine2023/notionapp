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

// Store
export { useResearchStore } from './store/researchStore';

// Hooks
export { useSearchPapers } from './hooks/useSearchPapers';
export { usePaperDetails } from './hooks/usePaperDetails';

// Services
export { paperSearchService } from './services/paperSearchService';
export { citationService } from './services/citationService';

// Types
export type {
  Paper,
  Author,
  ResearchProject,
  SearchFilters,
  SearchResult,
  CitationFormat,
  ResearchView,
} from './types/paper';
