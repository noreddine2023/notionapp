import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Note, NoteGroup } from '../types/notes';
import type { Block } from '../types/blocks';
import { generateBlockId } from '../utils/idGenerator';
import { createBlock } from '../utils/blockUtils';
import { GROUP_COLORS } from '../types/notes';

interface NotesStore {
  notes: Note[];
  groups: NoteGroup[];
  activeNoteId: string | null;
  activeGroupId: string | null; // Filter by group
  searchQuery: string;

  // Note operations
  createNote: (groupId?: string | null) => string;
  updateNote: (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => void;
  updateNoteContent: (id: string, content: Block[]) => void;
  deleteNote: (id: string) => void;
  setActiveNote: (id: string | null) => void;
  duplicateNote: (id: string) => string | null;

  // Group operations
  createGroup: (name: string) => string;
  updateGroup: (id: string, updates: Partial<Omit<NoteGroup, 'id' | 'createdAt'>>) => void;
  deleteGroup: (id: string) => void;
  setActiveGroup: (id: string | null) => void;

  // Search
  setSearchQuery: (query: string) => void;

  // Getters
  getActiveNote: () => Note | null;
  getNotesByGroup: (groupId: string | null) => Note[];
  getFilteredNotes: () => Note[];
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

// Create initial welcome note
const createWelcomeNote = (): Note => {
  const now = new Date();
  return {
    id: generateBlockId(),
    title: 'Welcome to Notes',
    content: [
      createBlock('h1', 'Welcome to Notes'),
      createBlock('text', 'This is a modern note-taking application with rich text editing capabilities.'),
      createBlock('h2', 'Features'),
      createBlock('bullet', 'Rich text formatting (bold, italic, underline)'),
      createBlock('bullet', 'Text and highlight colors'),
      createBlock('bullet', 'Multiple font sizes and families'),
      createBlock('bullet', 'Image blocks'),
      createBlock('bullet', 'Code blocks with syntax highlighting'),
      createBlock('text', "Type '/' to see all available block types. Drag blocks to reorder them!"),
    ],
    groupId: null,
    createdAt: now,
    updatedAt: now,
  };
};

export const useNotesStore = create<NotesStore>()(
  persist(
    (set, get) => ({
      notes: [createWelcomeNote()],
      groups: [],
      activeNoteId: null,
      activeGroupId: null,
      searchQuery: '',

      // Note operations
      createNote: (groupId = null) => {
        const now = new Date();
        const newNote: Note = {
          id: generateBlockId(),
          title: 'Untitled',
          content: [createBlock('text', '')],
          groupId,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          notes: [newNote, ...state.notes],
          activeNoteId: newNote.id,
        }));

        return newNote.id;
      },

      updateNote: (id, updates) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? { ...note, ...updates, updatedAt: new Date() }
              : note
          ),
        }));
      },

      updateNoteContent: (id, content) => {
        set((state) => ({
          notes: state.notes.map((note) => {
            if (note.id !== id) return note;
            
            // Extract title from first heading or text block
            const firstContentBlock = content.find(
              (b) => b.type !== 'divider' && b.content.trim()
            );
            const title = firstContentBlock?.content.slice(0, 50) || 'Untitled';

            return {
              ...note,
              content,
              title,
              updatedAt: new Date(),
            };
          }),
        }));
      },

      deleteNote: (id) => {
        set((state) => {
          const newNotes = state.notes.filter((note) => note.id !== id);
          // If the deleted note was active, select the first remaining note
          const newActiveId =
            state.activeNoteId === id
              ? newNotes[0]?.id || null
              : state.activeNoteId;

          return {
            notes: newNotes,
            activeNoteId: newActiveId,
          };
        });
      },

      setActiveNote: (id) => {
        set({ activeNoteId: id });
      },

      duplicateNote: (id) => {
        const state = get();
        const note = state.notes.find((n) => n.id === id);
        if (!note) return null;

        const now = new Date();
        const newNote: Note = {
          ...note,
          id: generateBlockId(),
          title: `${note.title} (copy)`,
          content: note.content.map((block) => ({
            ...block,
            id: generateBlockId(),
          })),
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          notes: [newNote, ...state.notes],
          activeNoteId: newNote.id,
        }));

        return newNote.id;
      },

      // Group operations
      createGroup: (name) => {
        const state = get();
        const usedColors = state.groups.map((g) => g.color);
        const availableColor =
          GROUP_COLORS.find((c) => !usedColors.includes(c)) || GROUP_COLORS[0];

        const now = new Date();
        const newGroup: NoteGroup = {
          id: generateBlockId(),
          name,
          color: availableColor,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          groups: [...state.groups, newGroup],
        }));

        return newGroup.id;
      },

      updateGroup: (id, updates) => {
        set((state) => ({
          groups: state.groups.map((group) =>
            group.id === id
              ? { ...group, ...updates, updatedAt: new Date() }
              : group
          ),
        }));
      },

      deleteGroup: (id) => {
        set((state) => ({
          groups: state.groups.filter((group) => group.id !== id),
          // Ungroup all notes in this group
          notes: state.notes.map((note) =>
            note.groupId === id ? { ...note, groupId: null } : note
          ),
          // Reset filter if currently filtering by this group
          activeGroupId: state.activeGroupId === id ? null : state.activeGroupId,
        }));
      },

      setActiveGroup: (id) => {
        set({ activeGroupId: id });
      },

      // Search
      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },

      // Getters
      getActiveNote: () => {
        const state = get();
        return state.notes.find((n) => n.id === state.activeNoteId) || null;
      },

      getNotesByGroup: (groupId) => {
        const state = get();
        if (groupId === null) {
          return state.notes; // Return all notes
        }
        return state.notes.filter((n) => n.groupId === groupId);
      },

      getFilteredNotes: () => {
        const state = get();
        let filtered = state.notes;

        // Filter by group
        if (state.activeGroupId !== null) {
          filtered = filtered.filter((n) => n.groupId === state.activeGroupId);
        }

        // Filter by search query
        if (state.searchQuery.trim()) {
          const query = state.searchQuery.toLowerCase();
          filtered = filtered.filter(
            (n) =>
              n.title.toLowerCase().includes(query) ||
              n.content.some((block) =>
                block.content.toLowerCase().includes(query)
              )
          );
        }

        return filtered;
      },
    }),
    {
      name: 'notes-storage',
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
