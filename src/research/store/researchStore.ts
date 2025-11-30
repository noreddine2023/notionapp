/**
 * Research Store - Zustand store for managing papers and research projects
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Paper, ResearchProject, ResearchView } from '../types/paper';
import { generateBlockId } from '../../editor/utils/idGenerator';

interface ResearchStore {
  // State
  papers: Paper[];
  projects: ResearchProject[];
  currentView: ResearchView;
  selectedPaperId: string | null;
  selectedProjectId: string | null;
  searchQuery: string;
  libraryFilter: 'all' | 'favorites' | 'unread';
  viewedPaper: Paper | null; // Currently viewed paper (not necessarily in library)
  tempPdfUrl: string | null; // Temporary PDF URL for uploaded files (session-only)

  // Paper operations
  addPaperToLibrary: (paper: Paper) => void;
  removePaperFromLibrary: (paperId: string) => void;
  updatePaper: (paperId: string, updates: Partial<Paper>) => void;
  togglePaperRead: (paperId: string) => void;
  togglePaperFavorite: (paperId: string) => void;
  setPaperNotes: (paperId: string, notes: string) => void;
  isPaperInLibrary: (paperId: string) => boolean;
  setViewedPaper: (paper: Paper | null) => void;
  setTempPdfUrl: (url: string | null) => void; // Set temporary PDF URL

  // Project operations
  createProject: (name: string, parentId?: string) => string;
  updateProject: (projectId: string, updates: Partial<Omit<ResearchProject, 'id' | 'createdAt'>>) => void;
  deleteProject: (projectId: string) => void;
  addPaperToProject: (paperId: string, projectId: string) => void;
  removePaperFromProject: (paperId: string, projectId: string) => void;
  getProjectPapers: (projectId: string) => Paper[];
  getSubProjects: (parentId: string | null) => ResearchProject[];

  // Navigation
  setCurrentView: (view: ResearchView) => void;
  setSelectedPaper: (paperId: string | null) => void;
  setSelectedProject: (projectId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setLibraryFilter: (filter: 'all' | 'favorites' | 'unread') => void;

  // Getters
  getFilteredLibraryPapers: () => Paper[];
  getPaperById: (paperId: string) => Paper | undefined;
  getProjectById: (projectId: string) => ResearchProject | undefined;
}

// Helper to serialize/deserialize dates
const dateReviver = (_key: string, value: unknown) => {
  if (typeof value === 'string') {
    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
    if (dateRegex.test(value)) {
      return new Date(value);
    }
  }
  return value;
};

export const useResearchStore = create<ResearchStore>()(
  persist(
    (set, get) => ({
      // Initial state
      papers: [],
      projects: [],
      currentView: 'search',
      selectedPaperId: null,
      selectedProjectId: null,
      searchQuery: '',
      libraryFilter: 'all',
      viewedPaper: null,
      tempPdfUrl: null,

      // Paper operations
      addPaperToLibrary: (paper) => {
        const state = get();
        if (state.papers.some(p => p.id === paper.id)) {
          return; // Paper already in library
        }
        set({
          papers: [...state.papers, { ...paper, addedAt: new Date() }],
        });
      },

      removePaperFromLibrary: (paperId) => {
        set((state) => ({
          papers: state.papers.filter(p => p.id !== paperId),
          // Also remove from all projects
          projects: state.projects.map(project => ({
            ...project,
            paperIds: project.paperIds.filter(id => id !== paperId),
          })),
        }));
      },

      updatePaper: (paperId, updates) => {
        set((state) => ({
          papers: state.papers.map(p =>
            p.id === paperId ? { ...p, ...updates } : p
          ),
        }));
      },

      togglePaperRead: (paperId) => {
        set((state) => ({
          papers: state.papers.map(p =>
            p.id === paperId ? { ...p, isRead: !p.isRead } : p
          ),
        }));
      },

      togglePaperFavorite: (paperId) => {
        set((state) => ({
          papers: state.papers.map(p =>
            p.id === paperId ? { ...p, isFavorite: !p.isFavorite } : p
          ),
        }));
      },

      setPaperNotes: (paperId, notes) => {
        set((state) => ({
          papers: state.papers.map(p =>
            p.id === paperId ? { ...p, personalNotes: notes } : p
          ),
        }));
      },

      setViewedPaper: (paper) => {
        set({ viewedPaper: paper });
      },

      setTempPdfUrl: (url) => {
        set({ tempPdfUrl: url });
      },

      isPaperInLibrary: (paperId) => {
        return get().papers.some(p => p.id === paperId);
      },

      // Project operations
      createProject: (name, parentId) => {
        const now = new Date();
        const newProject: ResearchProject = {
          id: generateBlockId(),
          name,
          parentId,
          paperIds: [],
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          projects: [...state.projects, newProject],
        }));

        return newProject.id;
      },

      updateProject: (projectId, updates) => {
        set((state) => ({
          projects: state.projects.map(p =>
            p.id === projectId
              ? { ...p, ...updates, updatedAt: new Date() }
              : p
          ),
        }));
      },

      deleteProject: (projectId) => {
        set((state) => {
          // Get all descendant project IDs to delete
          const getAllDescendants = (parentId: string): string[] => {
            const children = state.projects.filter(p => p.parentId === parentId);
            return children.flatMap(child => [child.id, ...getAllDescendants(child.id)]);
          };
          
          const idsToDelete = [projectId, ...getAllDescendants(projectId)];
          
          return {
            projects: state.projects.filter(p => !idsToDelete.includes(p.id)),
            selectedProjectId: state.selectedProjectId && idsToDelete.includes(state.selectedProjectId)
              ? null
              : state.selectedProjectId,
          };
        });
      },

      addPaperToProject: (paperId, projectId) => {
        set((state) => ({
          projects: state.projects.map(p =>
            p.id === projectId && !p.paperIds.includes(paperId)
              ? { ...p, paperIds: [...p.paperIds, paperId], updatedAt: new Date() }
              : p
          ),
        }));
      },

      removePaperFromProject: (paperId, projectId) => {
        set((state) => ({
          projects: state.projects.map(p =>
            p.id === projectId
              ? { ...p, paperIds: p.paperIds.filter(id => id !== paperId), updatedAt: new Date() }
              : p
          ),
        }));
      },

      getProjectPapers: (projectId) => {
        const state = get();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return [];
        return state.papers.filter(paper => project.paperIds.includes(paper.id));
      },

      getSubProjects: (parentId) => {
        return get().projects.filter(p => 
          parentId === null ? !p.parentId : p.parentId === parentId
        );
      },

      // Navigation
      setCurrentView: (view) => set({ currentView: view }),
      setSelectedPaper: (paperId) => set({ selectedPaperId: paperId }),
      setSelectedProject: (projectId) => set({ selectedProjectId: projectId }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setLibraryFilter: (filter) => set({ libraryFilter: filter }),

      // Getters
      getFilteredLibraryPapers: () => {
        const state = get();
        let filtered = state.papers;

        // Apply filter
        if (state.libraryFilter === 'favorites') {
          filtered = filtered.filter(p => p.isFavorite);
        } else if (state.libraryFilter === 'unread') {
          filtered = filtered.filter(p => !p.isRead);
        }

        // Apply search
        if (state.searchQuery.trim()) {
          const query = state.searchQuery.toLowerCase();
          filtered = filtered.filter(p =>
            p.title.toLowerCase().includes(query) ||
            p.authors.some(a => a.name.toLowerCase().includes(query)) ||
            p.abstract.toLowerCase().includes(query)
          );
        }

        return filtered;
      },

      getPaperById: (paperId) => {
        const state = get();
        // First check library papers
        const libraryPaper = state.papers.find(p => p.id === paperId);
        if (libraryPaper) return libraryPaper;
        // Fall back to currently viewed paper
        if (state.viewedPaper?.id === paperId) return state.viewedPaper;
        return undefined;
      },

      getProjectById: (projectId) => {
        return get().projects.find(p => p.id === projectId);
      },
    }),
    {
      name: 'research-storage',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          return JSON.parse(str, dateReviver);
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);
