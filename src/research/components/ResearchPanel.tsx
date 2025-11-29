/**
 * Research Panel Component - Main panel for research content
 */

import React from 'react';
import { SearchPapers } from './SearchPapers';
import { PaperLibrary } from './PaperLibrary';
import { PaperDetail } from './PaperDetail';
import { ResearchProjects } from './ResearchProjects';
import { PdfReader } from './PdfReader';
import { useResearchStore } from '../store/researchStore';

export const ResearchPanel: React.FC = () => {
  const { 
    currentView, 
    selectedPaperId, 
    setCurrentView, 
    getPaperById 
  } = useResearchStore();

  const handleClosePdfReader = () => {
    setCurrentView('paper-detail');
  };

  // Render based on current view
  switch (currentView) {
    case 'search':
      return <SearchPapers />;
    
    case 'library':
      return <PaperLibrary />;
    
    case 'projects':
      return <ResearchProjects />;
    
    case 'paper-detail':
      if (selectedPaperId) {
        return <PaperDetail paperId={selectedPaperId} />;
      }
      return <SearchPapers />;
    
    case 'pdf-reader':
      if (selectedPaperId) {
        const paper = getPaperById(selectedPaperId);
        return (
          <PdfReader 
            paperId={selectedPaperId} 
            paper={paper}
            onClose={handleClosePdfReader}
          />
        );
      }
      return <SearchPapers />;
    
    default:
      return <SearchPapers />;
  }
};
