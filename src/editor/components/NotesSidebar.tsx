import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Plus,
  Search,
  FolderPlus,
  MoreHorizontal,
  Trash2,
  Edit3,
  Copy,
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
  X,
} from 'lucide-react';
import { useNotesStore } from '../store/notesStore';
import { getPreviewSnippet } from '../types/notes';

/**
 * Format relative time (e.g., "2 hours ago", "Yesterday")
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * NotesSidebar - Left panel for organizing notes
 */
export const NotesSidebar: React.FC = () => {
  const {
    notes,
    groups,
    activeNoteId,
    activeGroupId,
    searchQuery,
    createNote,
    deleteNote,
    setActiveNote,
    duplicateNote,
    createGroup,
    updateGroup,
    deleteGroup,
    setActiveGroup,
    setSearchQuery,
    getFilteredNotes,
  } = useNotesStore();

  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{
    type: 'note' | 'group';
    id: string;
    x: number;
    y: number;
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'note' | 'group';
    id: string;
    name: string;
  } | null>(null);

  const groupInputRef = useRef<HTMLInputElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

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

  // Focus group input when creating
  useEffect(() => {
    if (isCreatingGroup && groupInputRef.current) {
      groupInputRef.current.focus();
    }
  }, [isCreatingGroup]);

  // Handle create new group
  const handleCreateGroup = useCallback(() => {
    if (newGroupName.trim()) {
      createGroup(newGroupName.trim());
      setNewGroupName('');
    }
    setIsCreatingGroup(false);
  }, [newGroupName, createGroup]);

  // Handle rename group
  const handleRenameGroup = useCallback(() => {
    if (editingGroupId && editingGroupName.trim()) {
      updateGroup(editingGroupId, { name: editingGroupName.trim() });
    }
    setEditingGroupId(null);
    setEditingGroupName('');
  }, [editingGroupId, editingGroupName, updateGroup]);

  // Toggle group expansion
  const toggleGroupExpansion = useCallback((groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }, []);

  // Handle context menu
  const handleContextMenu = useCallback(
    (e: React.MouseEvent, type: 'note' | 'group', id: string) => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({ type, id, x: e.clientX, y: e.clientY });
    },
    []
  );

  // Filtered notes
  const filteredNotes = getFilteredNotes();

  // Group notes by groupId
  const ungroupedNotes = filteredNotes.filter((n) => !n.groupId);
  const groupedNotesMap = new Map<string, typeof filteredNotes>();
  groups.forEach((g) => {
    groupedNotesMap.set(
      g.id,
      filteredNotes.filter((n) => n.groupId === g.id)
    );
  });

  return (
    <div className="notes-sidebar flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Notes</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => createNote(activeGroupId)}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-colors"
              title="New Note"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsCreatingGroup(true)}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-colors"
              title="New Group"
            >
              <FolderPlus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-gray-200 text-gray-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="px-3 py-2 border-b border-gray-100">
        <button
          onClick={() => setActiveGroup(null)}
          className={`w-full text-left px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activeGroupId === null
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          All Notes ({notes.length})
        </button>
      </div>

      {/* Groups and Notes List */}
      <div className="flex-1 overflow-y-auto">
        {/* Groups */}
        {groups.map((group) => {
          const isExpanded = expandedGroups.has(group.id);
          const groupNotes = groupedNotesMap.get(group.id) || [];

          return (
            <div key={group.id} className="border-b border-gray-50">
              {/* Group header */}
              <div
                onClick={() => {
                  setActiveGroup(group.id);
                  toggleGroupExpansion(group.id);
                }}
                onContextMenu={(e) => handleContextMenu(e, 'group', group.id)}
                className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
                  activeGroupId === group.id
                    ? 'bg-blue-50'
                    : 'hover:bg-gray-50'
                }`}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleGroupExpansion(group.id);
                  }}
                  className="p-0.5 rounded hover:bg-gray-200"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: group.color }}
                />
                {editingGroupId === group.id ? (
                  <input
                    ref={groupInputRef}
                    type="text"
                    value={editingGroupName}
                    onChange={(e) => setEditingGroupName(e.target.value)}
                    onBlur={handleRenameGroup}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenameGroup();
                      if (e.key === 'Escape') {
                        setEditingGroupId(null);
                        setEditingGroupName('');
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 px-1 py-0.5 text-sm border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                ) : (
                  <span className="flex-1 text-sm font-medium text-gray-700 truncate">
                    {group.name}
                  </span>
                )}
                <span className="text-xs text-gray-400">{groupNotes.length}</span>
              </div>

              {/* Group notes */}
              {isExpanded && (
                <div className="pb-1">
                  {groupNotes.length === 0 ? (
                    <div className="px-6 py-2 text-xs text-gray-400 italic">
                      No notes in this group
                    </div>
                  ) : (
                    groupNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        isActive={activeNoteId === note.id}
                        groupColor={group.color}
                        onClick={() => setActiveNote(note.id)}
                        onContextMenu={(e) => handleContextMenu(e, 'note', note.id)}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* New group input */}
        {isCreatingGroup && (
          <div className="px-3 py-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4 text-gray-400" />
              <input
                ref={groupInputRef}
                type="text"
                placeholder="Group name..."
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onBlur={handleCreateGroup}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateGroup();
                  if (e.key === 'Escape') {
                    setIsCreatingGroup(false);
                    setNewGroupName('');
                  }
                }}
                className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Ungrouped notes */}
        {ungroupedNotes.length > 0 && (
          <div className="py-2">
            {groups.length > 0 && (
              <div className="px-4 py-1 text-xs font-medium text-gray-400 uppercase tracking-wide">
                Ungrouped
              </div>
            )}
            {ungroupedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                isActive={activeNoteId === note.id}
                onClick={() => setActiveNote(note.id)}
                onContextMenu={(e) => handleContextMenu(e, 'note', note.id)}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {filteredNotes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <FileText className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500 mb-1">
              {searchQuery ? 'No notes found' : 'No notes yet'}
            </p>
            <p className="text-xs text-gray-400">
              {searchQuery
                ? 'Try a different search term'
                : 'Click + to create your first note'}
            </p>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {contextMenu.type === 'note' && (
            <>
              <button
                onClick={() => {
                  duplicateNote(contextMenu.id);
                  setContextMenu(null);
                }}
                className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Copy className="w-4 h-4" />
                Duplicate
              </button>
              <button
                onClick={() => {
                  const note = notes.find((n) => n.id === contextMenu.id);
                  setDeleteConfirm({
                    type: 'note',
                    id: contextMenu.id,
                    name: note?.title || 'this note',
                  });
                  setContextMenu(null);
                }}
                className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </>
          )}
          {contextMenu.type === 'group' && (
            <>
              <button
                onClick={() => {
                  const group = groups.find((g) => g.id === contextMenu.id);
                  if (group) {
                    setEditingGroupId(group.id);
                    setEditingGroupName(group.name);
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
                  createNote(contextMenu.id);
                  setContextMenu(null);
                }}
                className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Note
              </button>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={() => {
                  const group = groups.find((g) => g.id === contextMenu.id);
                  setDeleteConfirm({
                    type: 'group',
                    id: contextMenu.id,
                    name: group?.name || 'this group',
                  });
                  setContextMenu(null);
                }}
                className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Group
              </button>
            </>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Delete {deleteConfirm.type === 'note' ? 'Note' : 'Group'}?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete &quot;{deleteConfirm.name}&quot;?
              {deleteConfirm.type === 'group' &&
                ' Notes in this group will be moved to ungrouped.'}
              This action cannot be undone.
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
                  if (deleteConfirm.type === 'note') {
                    deleteNote(deleteConfirm.id);
                  } else {
                    deleteGroup(deleteConfirm.id);
                  }
                  setDeleteConfirm(null);
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

/**
 * Note Card Component
 */
interface NoteCardProps {
  note: {
    id: string;
    title: string;
    content: { type: string; content: string }[];
    updatedAt: Date;
  };
  isActive: boolean;
  groupColor?: string;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  isActive,
  groupColor,
  onClick,
  onContextMenu,
}) => {
  const preview = getPreviewSnippet(note.content as Parameters<typeof getPreviewSnippet>[0], 80);

  return (
    <div
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={`group relative mx-2 my-0.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 ${
        isActive
          ? 'bg-blue-100 shadow-sm'
          : 'hover:bg-gray-50'
      }`}
    >
      {/* Group indicator */}
      {groupColor && (
        <div
          className="absolute left-0 top-2 bottom-2 w-1 rounded-full"
          style={{ backgroundColor: groupColor }}
        />
      )}

      <div className={groupColor ? 'pl-2' : ''}>
        {/* Title */}
        <h3
          className={`text-sm font-medium truncate ${
            isActive ? 'text-blue-900' : 'text-gray-800'
          }`}
        >
          {note.title || 'Untitled'}
        </h3>

        {/* Preview */}
        <p
          className={`text-xs mt-0.5 line-clamp-2 ${
            isActive ? 'text-blue-700/70' : 'text-gray-500'
          }`}
        >
          {preview || 'No content'}
        </p>

        {/* Date */}
        <p
          className={`text-[10px] mt-1 ${
            isActive ? 'text-blue-600/60' : 'text-gray-400'
          }`}
        >
          {formatRelativeTime(note.updatedAt)}
        </p>
      </div>

      {/* More button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onContextMenu(e);
        }}
        className={`absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
          isActive ? 'hover:bg-blue-200' : 'hover:bg-gray-200'
        }`}
      >
        <MoreHorizontal className="w-4 h-4 text-gray-500" />
      </button>
    </div>
  );
};

export default NotesSidebar;
