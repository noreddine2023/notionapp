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
            {mainView === 'notes' ? (
              <>
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <h1 className="text-lg font-semibold text-gray-800">Notes</h1>
              </>
            ) : (
              <>
                <div className="p-1.5 bg-purple-100 rounded-lg">
                  <Beaker className="w-5 h-5 text-purple-600" />
                </div>
                <h1 className="text-lg font-semibold text-gray-800">Research</h1>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {mainView === 'notes' ? (
            <span className="text-sm text-gray-500">
              {notes.length} note{notes.length !== 1 ? 's' : ''}
            </span>
          ) : (
            <span className="text-sm text-gray-500">
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
          <div className="w-80 h-full flex flex-col bg-white border-r border-gray-200">
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
            <div className="flex-shrink-0 mx-4 my-2 border-t border-gray-200" />

            {/* Notes Section Header */}
            <div className="flex-shrink-0 px-4 py-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Notes
                </span>
              </div>
            </div>
            
            {/* Notes Section Button */}
            <div className="flex-shrink-0">
              <button
                onClick={handleNotesClick}
                className={`flex items-center gap-2 mx-2 px-3 py-2 rounded-lg transition-colors w-full ${
                  mainView === 'notes'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium flex-1 text-left">All Notes</span>
                <span className="text-xs text-gray-400">({notes.length})</span>
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
