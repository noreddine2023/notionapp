/**
 * Research Sidebar Component - Left panel for research papers
 */

import React, { useState, useCallback } from 'react';
import {
  Search,
  Library,
  Folder,
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

  // Project colors for visual indicators
  const PROJECT_COLORS = [
    'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 
    'bg-pink-500', 'bg-teal-500', 'bg-indigo-500', 'bg-yellow-500'
  ];
  
  const getProjectColor = (projectId: string) => {
    // Generate consistent color based on project ID
    const hash = projectId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return PROJECT_COLORS[hash % PROJECT_COLORS.length];
  };

  const renderProject = (project: ResearchProject, level: number = 0) => {
    const isExpanded = expandedProjectIds.has(project.id);
    const isSelected = selectedProjectId === project.id;
    const subProjects = getSubProjects(project.id);
    const paperCount = getProjectPapers(project.id).length;
    const projectColor = getProjectColor(project.id);

    return (
      <div key={project.id} className="transition-all duration-200">
        <div
          onClick={() => onProjectSelect(project.id)}
          className={`group flex items-center gap-2 mx-1 px-2 py-2 rounded-xl cursor-pointer transition-all duration-200 text-sm ${
            isSelected
              ? 'bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-500/20 dark:to-blue-600/10 text-blue-700 dark:text-blue-300 shadow-md border-l-2 border-blue-500 dark:border-blue-400 hover:scale-[1.02]'
              : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/10 hover:shadow-sm border border-transparent hover:translate-x-1'
          } active:scale-[0.98]`}
          style={{ marginLeft: `${4 + level * 12}px` }}
        >
          {/* Expand/Collapse button */}
          {subProjects.length > 0 ? (
            <button
              onClick={(e) => toggleProjectExpansion(project.id, e)}
              className={`p-0.5 rounded-lg transition-all duration-200 hover:scale-110 ${
                isSelected ? 'hover:bg-blue-200 dark:hover:bg-blue-700/30' : 'hover:bg-gray-200 dark:hover:bg-white/20'
              }`}
            >
              <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${
                isExpanded ? 'rotate-90' : ''
              }`} />
            </button>
          ) : (
            <span className="w-4.5" />
          )}
          
          {/* Color indicator */}
          <div className={`w-2 h-2 rounded-full ${projectColor} flex-shrink-0 shadow-sm`} />
          
          {/* Folder icon */}
          <Folder className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
            isSelected ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
          }`} />
          
          {/* Project name */}
          <span className="flex-1 truncate font-medium">{project.name}</span>
          
          {/* Paper count badge */}
          {paperCount > 0 && (
            <span className={`px-1.5 py-0.5 text-xs rounded-full flex-shrink-0 ${
              isSelected 
                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300' 
                : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-white/20'
            }`}>
              {paperCount}
            </span>
          )}
        </div>
        
        {/* Sub-projects with smooth animation */}
        {isExpanded && subProjects.length > 0 && (
          <div className="mt-0.5 space-y-0.5 animate-in slide-in-from-top-1 duration-200">
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
        <Beaker className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Research Papers
        </span>
      </div>

      {/* Search papers */}
      <button
        onClick={onSearchClick}
        className={`flex items-center gap-2 mx-2 px-3 py-2 rounded-xl transition-all duration-200 ${
          currentView === 'search'
            ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md hover:shadow-lg hover:scale-[1.02]'
            : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/10 hover:scale-[1.02]'
        } active:scale-[0.98]`}
      >
        <Search className="w-4 h-4" />
        <span className="text-sm font-medium">Search Papers</span>
      </button>

      {/* My Library */}
      <button
        onClick={onLibraryClick}
        className={`flex items-center gap-2 mx-2 px-3 py-2 rounded-xl transition-all duration-200 ${
          currentView === 'library'
            ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md hover:shadow-lg hover:scale-[1.02]'
            : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/10 hover:scale-[1.02]'
        } active:scale-[0.98]`}
      >
        <Library className="w-4 h-4" />
        <span className="text-sm font-medium flex-1 text-left">My Library</span>
        {papers.length > 0 && (
          <span className={`text-xs ${currentView === 'library' ? 'text-white/70' : 'text-gray-400 dark:text-gray-500'}`}>({papers.length})</span>
        )}
      </button>

      {/* Projects section */}
      <div className="mt-2">
        <button
          onClick={toggleProjectsExpansion}
          className="flex items-center gap-2 w-full px-4 py-1.5 text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/10 transition-all duration-200 rounded-xl mx-1 hover:scale-[1.02] active:scale-[0.98]"
        >
          <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${
            expandedProjects ? 'rotate-90' : ''
          }`} />
          <Folder className="w-4 h-4" />
          <span className="text-sm font-medium flex-1 text-left">Projects</span>
          {projects.length > 0 && (
            <span className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 rounded-full">
              {projects.length}
            </span>
          )}
        </button>

        {expandedProjects && (
          <div className="mt-1 space-y-0.5 animate-in slide-in-from-top-1 duration-200">
            {rootProjects.map((project) => renderProject(project))}
            
            <button
              onClick={onProjectsClick}
              className="flex items-center gap-2 mx-2 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-white/10 rounded-xl transition-all duration-200 border border-dashed border-gray-200 dark:border-white/20 hover:border-gray-300 dark:hover:border-white/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Manage Projects</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
