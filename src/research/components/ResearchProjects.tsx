/**
 * Research Projects Component - Manage research projects and sub-projects
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  FolderPlus,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  MoreHorizontal,
  Edit3,
  Trash2,
  Plus,
  X,
  Download,
  Layout,
} from 'lucide-react';
import { useResearchStore } from '../store/researchStore';
import { PaperCard } from './PaperCard';
import { exportBibtex } from '../services/citationService';
import type { ResearchProject } from '../types/paper';

export const ResearchProjects: React.FC = () => {
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectParentId, setNewProjectParentId] = useState<string | undefined>();
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingProjectName, setEditingProjectName] = useState('');
  const [contextMenu, setContextMenu] = useState<{
    projectId: string;
    x: number;
    y: number;
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [selectedProjectId, setSelectedProjectIdLocal] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const {
    projects,
    createProject,
    updateProject,
    deleteProject,
    getProjectPapers,
    removePaperFromProject,
    setCurrentView,
    setSelectedPaper,
    setSelectedProject,
  } = useResearchStore();

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when creating
  useEffect(() => {
    if (isCreatingProject && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreatingProject]);

  const toggleProjectExpansion = (projectId: string) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  };

  const handleCreateProject = useCallback(() => {
    if (newProjectName.trim()) {
      createProject(newProjectName.trim(), newProjectParentId);
      setNewProjectName('');
      setNewProjectParentId(undefined);
    }
    setIsCreatingProject(false);
  }, [newProjectName, newProjectParentId, createProject]);

  const handleRenameProject = useCallback(() => {
    if (editingProjectId && editingProjectName.trim()) {
      updateProject(editingProjectId, { name: editingProjectName.trim() });
    }
    setEditingProjectId(null);
    setEditingProjectName('');
  }, [editingProjectId, editingProjectName, updateProject]);

  const handleContextMenu = (e: React.MouseEvent, projectId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ projectId, x: e.clientX, y: e.clientY });
  };

  const handleExportBibtex = (projectId: string) => {
    const papers = getProjectPapers(projectId);
    if (papers.length === 0) return;
    
    const bibtex = exportBibtex(papers);
    const blob = new Blob([bibtex], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const project = projects.find(p => p.id === projectId);
    a.href = url;
    a.download = `${project?.name || 'papers'}.bib`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePaperClick = (paperId: string) => {
    setSelectedPaper(paperId);
    setCurrentView('paper-detail');
  };

  // Filter projects directly from state to ensure reactivity
  const rootProjects = projects.filter(p => !p.parentId);

  const renderProject = (project: ResearchProject, level: number = 0) => {
    const isExpanded = expandedProjects.has(project.id);
    const isSelected = selectedProjectId === project.id;
    const subProjects = projects.filter(p => p.parentId === project.id);
    const papers = getProjectPapers(project.id);

    return (
      <div key={project.id}>
        {/* Project header */}
        <div
          onClick={() => {
            setSelectedProjectIdLocal(isSelected ? null : project.id);
            toggleProjectExpansion(project.id);
          }}
          onContextMenu={(e) => handleContextMenu(e, project.id)}
          className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
            isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
          }`}
          style={{ paddingLeft: `${12 + level * 16}px` }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleProjectExpansion(project.id);
            }}
            className="p-0.5 rounded hover:bg-gray-200"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>
          
          {isExpanded ? (
            <FolderOpen className="w-4 h-4 text-blue-500" />
          ) : (
            <Folder className="w-4 h-4 text-gray-400" />
          )}

          {editingProjectId === project.id ? (
            <input
              ref={inputRef}
              type="text"
              value={editingProjectName}
              onChange={(e) => setEditingProjectName(e.target.value)}
              onBlur={handleRenameProject}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRenameProject();
                if (e.key === 'Escape') {
                  setEditingProjectId(null);
                  setEditingProjectName('');
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 px-1 py-0.5 text-sm border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          ) : (
            <span className="flex-1 text-sm font-medium text-gray-700 truncate">
              {project.name}
            </span>
          )}

          <span className="text-xs text-gray-400">{papers.length}</span>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleContextMenu(e, project.id);
            }}
            className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-200"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div>
            {/* Sub-projects */}
            {subProjects.map((sub) => renderProject(sub, level + 1))}
            
            {/* Whiteboard button and Papers */}
            {isSelected && (
              <div className="bg-gray-50 border-t border-gray-100">
                {/* Open Whiteboard button */}
                <div className="px-4 py-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProject(project.id);
                      setCurrentView('whiteboard');
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all shadow-sm"
                  >
                    <Layout className="w-4 h-4" />
                    <span className="font-medium">Open Whiteboard</span>
                  </button>
                </div>
                
                {/* Papers in project */}
                {papers.length > 0 && (
                  <div className="px-4 pb-3 space-y-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                      Papers ({papers.length})
                    </p>
                    {papers.map((paper) => (
                      <div key={paper.id} className="relative">
                        <PaperCard
                          paper={paper}
                          showLibraryActions={false}
                          onClick={() => handlePaperClick(paper.id)}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removePaperFromProject(paper.id, project.id);
                          }}
                          className="absolute top-2 right-2 p-1 bg-white rounded shadow hover:bg-red-50 text-gray-400 hover:text-red-600"
                          title="Remove from project"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {papers.length === 0 && (
                  <div className="px-8 pb-4 text-sm text-gray-500 italic">
                    No papers in this project
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Folder className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Projects</h2>
          </div>
          
          <button
            onClick={() => {
              setIsCreatingProject(true);
              setNewProjectParentId(undefined);
            }}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-colors"
            title="New Project"
          >
            <FolderPlus className="w-5 h-5" />
          </button>
        </div>
        
        {projects.length > 0 && (
          <p className="text-xs text-gray-500">
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Projects list */}
      <div className="flex-1 overflow-y-auto">
        {/* New project input */}
        {isCreatingProject && (
          <div className="px-3 py-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Project name..."
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onBlur={handleCreateProject}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateProject();
                  if (e.key === 'Escape') {
                    setIsCreatingProject(false);
                    setNewProjectName('');
                  }
                }}
                className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Projects */}
        {rootProjects.length === 0 && !isCreatingProject ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <Folder className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500 mb-1">No projects yet</p>
            <p className="text-xs text-gray-400 mb-4">
              Create a project to organize your papers
            </p>
            <button
              onClick={() => setIsCreatingProject(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Project
            </button>
          </div>
        ) : (
          <div className="py-2">
            {rootProjects.map((project) => renderProject(project))}
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[180px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => {
              setSelectedProject(contextMenu.projectId);
              setCurrentView('whiteboard');
              setContextMenu(null);
            }}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Layout className="w-4 h-4" />
            Open Whiteboard
          </button>
          <div className="border-t border-gray-100 my-1" />
          <button
            onClick={() => {
              const project = projects.find((p) => p.id === contextMenu.projectId);
              if (project) {
                setEditingProjectId(project.id);
                setEditingProjectName(project.name);
              }
              setContextMenu(null);
            }}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Rename
          </button>
          <button
            onClick={() => {
              setIsCreatingProject(true);
              setNewProjectParentId(contextMenu.projectId);
              setContextMenu(null);
            }}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <FolderPlus className="w-4 h-4" />
            Add Sub-project
          </button>
          <button
            onClick={() => {
              handleExportBibtex(contextMenu.projectId);
              setContextMenu(null);
            }}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export BibTeX
          </button>
          <div className="border-t border-gray-100 my-1" />
          <button
            onClick={() => {
              const project = projects.find((p) => p.id === contextMenu.projectId);
              setDeleteConfirm({
                id: contextMenu.projectId,
                name: project?.name || 'this project',
              });
              setContextMenu(null);
            }}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Project
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Delete Project?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete "{deleteConfirm.name}"?
              Sub-projects will also be deleted. Papers will remain in your library.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteProject(deleteConfirm.id);
                  setDeleteConfirm(null);
                  if (selectedProjectId === deleteConfirm.id) {
                    setSelectedProjectIdLocal(null);
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
