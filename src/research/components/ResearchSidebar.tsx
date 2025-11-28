/**
 * Research Sidebar Component - Left panel for research papers
 */

import React, { useState, useCallback } from 'react';
import {
  Search,
  Library,
  Folder,
  ChevronDown,
  ChevronRight,
  FolderPlus,
  Beaker,
} from 'lucide-react';
import { useResearchStore } from '../store/researchStore';
import type { ResearchProject } from '../types/paper';

interface ResearchSidebarProps {
  onSearchClick: () => void;
  onLibraryClick: () => void;
  onProjectsClick: () => void;
  onProjectSelect: (projectId: string) => void;
}

export const ResearchSidebar: React.FC<ResearchSidebarProps> = ({
  onSearchClick,
  onLibraryClick,
  onProjectsClick,
  onProjectSelect,
}) => {
  const [expandedProjects, setExpandedProjects] = useState(true);
  const [expandedProjectIds, setExpandedProjectIds] = useState<Set<string>>(new Set());

  const {
    papers,
    projects,
    currentView,
    getProjectPapers,
    selectedProjectId,
  } = useResearchStore();

  const toggleProjectsExpansion = () => {
    setExpandedProjects(!expandedProjects);
  };

  const toggleProjectExpansion = useCallback((projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedProjectIds((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  }, []);

  // Compute root projects directly from state for proper reactivity
  const rootProjects = projects.filter(p => !p.parentId);
  
  // Helper to get sub-projects
  const getSubProjects = useCallback((parentId: string | null) => {
    return projects.filter(p => 
      parentId === null ? !p.parentId : p.parentId === parentId
    );
  }, [projects]);

  const renderProject = (project: ResearchProject, level: number = 0) => {
    const isExpanded = expandedProjectIds.has(project.id);
    const isSelected = selectedProjectId === project.id;
    const subProjects = getSubProjects(project.id);
    const paperCount = getProjectPapers(project.id).length;

    return (
      <div key={project.id}>
        <div
          onClick={() => onProjectSelect(project.id)}
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer transition-colors text-sm ${
            isSelected
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          style={{ paddingLeft: `${8 + level * 12}px` }}
        >
          {subProjects.length > 0 ? (
            <button
              onClick={(e) => toggleProjectExpansion(project.id, e)}
              className="p-0.5 rounded hover:bg-gray-200"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
          ) : (
            <span className="w-4" />
          )}
          <Folder className="w-3.5 h-3.5" />
          <span className="flex-1 truncate">{project.name}</span>
          {paperCount > 0 && (
            <span className="text-xs text-gray-400">{paperCount}</span>
          )}
        </div>
        
        {isExpanded && subProjects.length > 0 && (
          <div>
            {subProjects.map((sub) => renderProject(sub, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      {/* Section header */}
      <div className="flex items-center gap-2 px-4 py-2">
        <Beaker className="w-4 h-4 text-purple-600" />
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Research Papers
        </span>
      </div>

      {/* Search papers */}
      <button
        onClick={onSearchClick}
        className={`flex items-center gap-2 mx-2 px-3 py-2 rounded-lg transition-colors ${
          currentView === 'search'
            ? 'bg-purple-100 text-purple-700'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <Search className="w-4 h-4" />
        <span className="text-sm font-medium">Search Papers</span>
      </button>

      {/* My Library */}
      <button
        onClick={onLibraryClick}
        className={`flex items-center gap-2 mx-2 px-3 py-2 rounded-lg transition-colors ${
          currentView === 'library'
            ? 'bg-purple-100 text-purple-700'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <Library className="w-4 h-4" />
        <span className="text-sm font-medium flex-1 text-left">My Library</span>
        {papers.length > 0 && (
          <span className="text-xs text-gray-400">({papers.length})</span>
        )}
      </button>

      {/* Projects section */}
      <div className="mt-2">
        <button
          onClick={toggleProjectsExpansion}
          className="flex items-center gap-2 w-full px-4 py-1.5 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          {expandedProjects ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          <Folder className="w-4 h-4" />
          <span className="text-sm font-medium flex-1 text-left">Projects</span>
          {projects.length > 0 && (
            <span className="text-xs text-gray-400">({projects.length})</span>
          )}
        </button>

        {expandedProjects && (
          <div className="ml-2 mt-1 space-y-0.5">
            {rootProjects.map((project) => renderProject(project))}
            
            <button
              onClick={onProjectsClick}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Manage Projects</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
