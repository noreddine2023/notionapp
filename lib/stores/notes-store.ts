"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Note Interface
 */
export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Notes Store State
 */
interface NotesState {
  notes: Note[];
  selectedNoteId: string | null;
  isEditorOpen: boolean;
  isCreateDialogOpen: boolean;
  
  // Actions
  addNote: (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => void;
  updateNote: (id: string, updates: Partial<Omit<Note, "id" | "createdAt">>) => void;
  deleteNote: (id: string) => void;
  toggleFavorite: (id: string) => void;
  selectNote: (id: string | null) => void;
  setEditorOpen: (open: boolean) => void;
  setCreateDialogOpen: (open: boolean) => void;
  getNoteById: (id: string) => Note | undefined;
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get current date string
 */
function getCurrentDateString(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Initial mock notes data
 */
const initialNotes: Note[] = [
  {
    id: "1",
    title: "Machine Learning Research Notes",
    content: `# Machine Learning Research Notes

## Overview
Exploring transformer architectures and attention mechanisms for NLP tasks.

## Key Concepts
- Self-attention mechanisms
- Multi-head attention
- Positional encoding
- Layer normalization

## Resources
- Attention Is All You Need paper
- BERT documentation
- Hugging Face tutorials

## Next Steps
1. Implement basic transformer from scratch
2. Fine-tune pre-trained models
3. Benchmark on custom dataset`,
    tags: ["ML", "Research"],
    isFavorite: true,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-15",
  },
  {
    id: "2",
    title: "Weekly Team Standup Notes",
    content: `# Weekly Team Standup Notes

## Date: January 15, 2024

### Progress
- Completed user authentication module
- Fixed critical bug in payment processing
- Updated documentation

### Blockers
- Waiting for API access from third-party vendor
- Need design review for new feature

### Action Items
- [ ] Follow up with vendor by Wednesday
- [ ] Schedule design review meeting
- [ ] Update sprint board`,
    tags: ["Team", "Agile"],
    isFavorite: false,
    createdAt: "2023-12-15",
    updatedAt: "2024-01-14",
  },
  {
    id: "3",
    title: "Product Roadmap 2024",
    content: `# Product Roadmap 2024

## Q1 Goals
- Launch v2.0 with new features
- Improve user onboarding
- Expand to 3 new markets

## Q2 Goals
- Mobile app release
- Enterprise features
- API v2 launch

## Q3 Goals
- AI-powered features
- Advanced analytics
- Partner integrations

## Q4 Goals
- Scale infrastructure
- Global expansion
- IPO preparation`,
    tags: ["Planning", "Product"],
    isFavorite: true,
    createdAt: "2024-01-02",
    updatedAt: "2024-01-13",
  },
  {
    id: "4",
    title: "API Design Guidelines",
    content: `# API Design Guidelines

## RESTful Principles
- Use proper HTTP methods
- Resource-based URLs
- Consistent naming conventions

## Authentication
- JWT tokens for API access
- OAuth 2.0 for third-party apps
- API key rotation policy

## Versioning
- URL-based versioning (v1, v2)
- Deprecation timeline: 6 months
- Breaking change communication

## Error Handling
- Consistent error format
- Meaningful error messages
- HTTP status code usage`,
    tags: ["Engineering", "Documentation"],
    isFavorite: false,
    createdAt: "2023-11-20",
    updatedAt: "2024-01-12",
  },
  {
    id: "5",
    title: "User Interview Findings",
    content: `# User Interview Findings

## Interview Date: January 5, 2024

### Participants
- 5 power users
- 3 new users
- 2 enterprise customers

### Key Insights
1. Users love the collaboration features
2. Search functionality needs improvement
3. Mobile experience is lacking

### Pain Points
- Slow loading times on large documents
- Limited offline support
- Complex permission management

### Recommendations
- Prioritize performance optimization
- Add offline mode in Q2
- Simplify sharing workflows`,
    tags: ["UX", "Research"],
    isFavorite: false,
    createdAt: "2024-01-05",
    updatedAt: "2024-01-11",
  },
  {
    id: "6",
    title: "Sprint Retrospective - January",
    content: `# Sprint Retrospective - January 2024

## What Went Well
- Team collaboration improved
- On-time delivery of key features
- Good communication with stakeholders

## What Could Be Better
- Testing coverage
- Documentation updates
- Code review turnaround

## Action Items
- Implement automated testing pipeline
- Allocate time for documentation
- Set up code review SLAs

## Team Mood
Overall positive, but some concerns about workload`,
    tags: ["Team", "Agile"],
    isFavorite: false,
    createdAt: "2024-01-10",
    updatedAt: "2024-01-10",
  },
  {
    id: "7",
    title: "Competitive Analysis",
    content: `# Competitive Analysis

## Competitors
1. **Notion** - All-in-one workspace
2. **Obsidian** - Local-first, markdown
3. **Roam Research** - Bi-directional linking

## Our Strengths
- Better performance
- Stronger collaboration
- More intuitive UI

## Our Weaknesses
- Smaller feature set
- Less integrations
- Newer brand

## Opportunities
- AI integration
- Mobile-first approach
- Enterprise market`,
    tags: ["Strategy", "Research"],
    isFavorite: true,
    createdAt: "2023-12-28",
    updatedAt: "2024-01-09",
  },
  {
    id: "8",
    title: "Performance Optimization Notes",
    content: `# Performance Optimization Notes

## Current Issues
- Initial load time: 3.5s
- Large document lag
- Memory leaks in editor

## Optimization Plan
1. Code splitting
2. Lazy loading
3. Virtual scrolling
4. Web workers for heavy operations

## Metrics to Track
- Time to First Byte (TTFB)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)

## Tools
- Lighthouse
- Chrome DevTools
- React Profiler`,
    tags: ["Engineering", "Performance"],
    isFavorite: false,
    createdAt: "2024-01-03",
    updatedAt: "2024-01-08",
  },
];

/**
 * Notes Store using Zustand with persistence
 */
export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: initialNotes,
      selectedNoteId: null,
      isEditorOpen: false,
      isCreateDialogOpen: false,

      addNote: (noteData) => {
        const newNote: Note = {
          ...noteData,
          id: generateId(),
          createdAt: getCurrentDateString(),
          updatedAt: getCurrentDateString(),
        };
        set((state) => ({
          notes: [newNote, ...state.notes],
        }));
      },

      updateNote: (id, updates) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? { ...note, ...updates, updatedAt: getCurrentDateString() }
              : note
          ),
        }));
      },

      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
          selectedNoteId:
            state.selectedNoteId === id ? null : state.selectedNoteId,
          isEditorOpen: state.selectedNoteId === id ? false : state.isEditorOpen,
        }));
      },

      toggleFavorite: (id) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? { ...note, isFavorite: !note.isFavorite, updatedAt: getCurrentDateString() }
              : note
          ),
        }));
      },

      selectNote: (id) => {
        set({ selectedNoteId: id });
      },

      setEditorOpen: (open) => {
        set({ isEditorOpen: open });
      },

      setCreateDialogOpen: (open) => {
        set({ isCreateDialogOpen: open });
      },

      getNoteById: (id) => {
        return get().notes.find((note) => note.id === id);
      },
    }),
    {
      name: "notionapp-notes-storage",
    }
  )
);
