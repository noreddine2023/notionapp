/**
 * Research Panel Component - Main panel for research content
 */

import React from 'react';
import { SearchPapers } from './SearchPapers';
import { PaperLibrary } from './PaperLibrary';
import { PaperDetail } from './PaperDetail';
import { ResearchProjects } from './ResearchProjects';
import { PdfReader } from './PdfReader';
import { Whiteboard } from './whiteboard/Whiteboard';
import { useResearchStore } from '../store/researchStore';

export const ResearchPanel: React.FC = () => {
  const { 
    currentView, 
    selectedPaperId,
    selectedProjectId,
    setCurrentView, 
    getPaperById,
    getProjectById,
  } = useResearchStore();

  const handleClosePdfReader = () => {
    setCurrentView('paper-detail');
  };

  const handleCloseWhiteboard = () => {
    setCurrentView('projects');
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
        console.log('[ResearchPanel] Rendering PdfReader with paperId:', selectedPaperId, 'paper:', paper?.title);
        return (
          <PdfReader 
            paperId={selectedPaperId} 
            paper={paper}
            onClose={handleClosePdfReader}
          />
        );
      }
      return <SearchPapers />;
    
    case 'whiteboard':
      if (selectedProjectId) {
        const project = getProjectById(selectedProjectId);
        return (
          <Whiteboard
            projectId={selectedProjectId}
            projectName={project?.name || 'Untitled Project'}
            onClose={handleCloseWhiteboard}
          />
        );
      }
      return <ResearchProjects />;
    
    default:
      return <SearchPapers />;
  }
};
