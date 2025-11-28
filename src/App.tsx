import React, { useCallback, useEffect } from 'react';
import { FileText, PanelLeftClose, PanelLeft } from 'lucide-react';
import { NotesSidebar } from './editor/components/NotesSidebar';
import { NoteEditor } from './editor/components/NoteEditor';
import { useNotesStore } from './editor/store/notesStore';
import type { Block } from './editor/types/blocks';

/**
 * Main application component - Modern Note Taking App
 */
const App: React.FC = () => {
  const { 
    activeNoteId, 
    notes, 
    setActiveNote,
  } = useNotesStore();

  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  // Set first note as active on initial load if none selected
  useEffect(() => {
    if (!activeNoteId && notes.length > 0) {
      setActiveNote(notes[0].id);
    }
  }, []);

  // Handle content change
  const handleChange = useCallback((blocks: Block[]) => {
    console.log('Content updated:', blocks.length, 'blocks');
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-50 text-slate-800 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"
            title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="w-5 h-5" />
            ) : (
              <PanelLeft className="w-5 h-5" />
            )}
          </button>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <h1 className="text-lg font-semibold text-gray-800">Notes</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {notes.length} note{notes.length !== 1 ? 's' : ''}
          </span>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div
          className={`transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'w-80' : 'w-0'
          } overflow-hidden flex-shrink-0`}
        >
          <div className="w-80 h-full">
            <NotesSidebar />
          </div>
        </div>

        {/* Editor */}
        <main className="flex-1 overflow-hidden">
          <NoteEditor
            noteId={activeNoteId}
            onChange={handleChange}
            autoFocus
          />
        </main>
      </div>
    </div>
  );
};

export default App;
