import React, { useCallback, useEffect, useState } from 'react';
import { FileText, PanelLeftClose, PanelLeft, Beaker } from 'lucide-react';
import { NotesSidebar } from './editor/components/NotesSidebar';
import { NoteEditor } from './editor/components/NoteEditor';
import { useNotesStore } from './editor/store/notesStore';
import { ResearchSidebar, ResearchPanel, useResearchStore } from './research';
import type { Block } from './editor/types/blocks';

type MainView = 'notes' | 'research';

/**
 * Main application component - Modern Note Taking App with Research
 */
const App: React.FC = () => {
  const { 
    activeNoteId, 
    notes, 
    setActiveNote,
  } = useNotesStore();

  const {
    papers,
    setCurrentView,
    setSelectedProject,
  } = useResearchStore();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mainView, setMainView] = useState<MainView>('notes');

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

  // Research sidebar handlers
  const handleSearchClick = useCallback(() => {
    setCurrentView('search');
    setMainView('research');
  }, [setCurrentView]);

  const handleLibraryClick = useCallback(() => {
    setCurrentView('library');
    setMainView('research');
  }, [setCurrentView]);

  const handleProjectsClick = useCallback(() => {
    setCurrentView('projects');
    setMainView('research');
  }, [setCurrentView]);

  const handleProjectSelect = useCallback((projectId: string) => {
    setSelectedProject(projectId);
    setCurrentView('projects');
    setMainView('research');
  }, [setSelectedProject, setCurrentView]);

  const handleNotesClick = useCallback(() => {
    setMainView('notes');
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 text-slate-800 dark:text-slate-100 font-sans">
      {/* Header */}
      <header className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border-b border-white/20 dark:border-white/10 px-4 py-2 flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-all duration-200 hover:scale-105 active:scale-95"
            title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="w-5 h-5" />
            ) : (
              <PanelLeft className="w-5 h-5" />
            )}
          </button>
          <div className="flex items-center gap-2">
            {mainView === 'notes' ? (
              <>
                <div className="p-1.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Notes</h1>
              </>
            ) : (
              <>
                <div className="p-1.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md">
                  <Beaker className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">Research</h1>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {mainView === 'notes' ? (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {notes.length} note{notes.length !== 1 ? 's' : ''}
            </span>
          ) : (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {papers.length} saved paper{papers.length !== 1 ? 's' : ''}
            </span>
          )}
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
          <div className="w-80 h-full flex flex-col bg-gradient-to-b from-white/80 to-white/70 dark:from-slate-900/90 dark:to-slate-900/80 backdrop-blur-xl border-r border-white/20 dark:border-white/10 shadow-lg">
            {/* Research Section - Always visible at top */}
            <div className="flex-shrink-0 py-2">
              <ResearchSidebar
                onSearchClick={handleSearchClick}
                onLibraryClick={handleLibraryClick}
                onProjectsClick={handleProjectsClick}
                onProjectSelect={handleProjectSelect}
              />
            </div>

            {/* Divider */}
            <div className="flex-shrink-0 mx-4 my-2 border-t border-gray-200/50 dark:border-white/10" />

            {/* Notes Section Header */}
            <div className="flex-shrink-0 px-4 py-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Notes
                </span>
              </div>
            </div>
            
            {/* Notes Section Button */}
            <div className="flex-shrink-0">
              <button
                onClick={handleNotesClick}
                className={`flex items-center gap-2 mx-2 px-3 py-2 rounded-xl transition-all duration-200 w-full ${
                  mainView === 'notes'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg hover:scale-[1.02]'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/10 hover:scale-[1.02]'
                } active:scale-[0.98]`}
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium flex-1 text-left">All Notes</span>
                <span className={`text-xs ${mainView === 'notes' ? 'text-white/70' : 'text-gray-400'}`}>({notes.length})</span>
              </button>
            </div>

            {/* Notes Sidebar - Only when notes view is active */}
            {mainView === 'notes' && (
              <div className="flex-1 min-h-0 overflow-hidden">
                <NotesSidebar />
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden bg-white">
          {mainView === 'notes' ? (
            <NoteEditor
              noteId={activeNoteId}
              onChange={handleChange}
              autoFocus
            />
          ) : (
            <ResearchPanel />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
