/**
 * PDF Reader Component - Full-featured PDF viewer with annotations
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Sun,
  Moon,
  X,
  Download,
  Highlighter,
  Sidebar,
  Search,
  Loader2,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { pdfStorageService } from '../services/pdfStorageService';
import { useResearchStore } from '../store/researchStore';
import type { Paper, PdfAnnotation, HighlightColor } from '../types/paper';
import { AnnotationSidebar } from './AnnotationSidebar';
import { AnnotationLayer } from './AnnotationLayer';
import { HighlightPopover } from './HighlightPopover';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfReaderProps {
  paperId: string;
  paper?: Paper;
  onClose: () => void;
}

const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];
const DEFAULT_ZOOM = 1;

const HIGHLIGHT_COLORS: { color: HighlightColor; label: string; emoji: string }[] = [
  { color: 'yellow', label: 'Yellow', emoji: '🟡' },
  { color: 'green', label: 'Green', emoji: '🟢' },
  { color: 'blue', label: 'Blue', emoji: '🔵' },
  { color: 'pink', label: 'Pink', emoji: '🩷' },
  { color: 'orange', label: 'Orange', emoji: '🟠' },
  { color: 'purple', label: 'Purple', emoji: '🟣' },
];

export const PdfReader: React.FC<PdfReaderProps> = ({ paperId, paper, onClose }) => {
  // State
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(DEFAULT_ZOOM);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [annotations, setAnnotations] = useState<PdfAnnotation[]>([]);
  const [selectedColor, setSelectedColor] = useState<HighlightColor>('yellow');
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [selectedText, setSelectedText] = useState<{
    text: string;
    rects: Array<{ x: number; y: number; width: number; height: number }>;
    pageNumber: number;
  } | null>(null);
  const [highlightMode, setHighlightMode] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const pageInputRef = useRef<HTMLInputElement>(null);

  const { togglePaperRead } = useResearchStore();

  // Load PDF
  useEffect(() => {
    let mounted = true;
    let objectUrl: string | null = null;

    async function loadPdf() {
      setIsLoading(true);
      setError(null);

      try {
        // First try to get from local storage
        const localBlob = await pdfStorageService.getPdf(paperId);
        
        if (localBlob && mounted) {
          objectUrl = URL.createObjectURL(localBlob);
          setPdfUrl(objectUrl);
          setIsLoading(false);
          return;
        }

        // If not local and paper has URL, try to load directly
        if (paper?.pdfUrl) {
          setPdfUrl(paper.pdfUrl);
          setIsLoading(false);
        } else {
          setError('No PDF available for this paper');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load PDF:', err);
        if (mounted) {
          setError('Failed to load PDF');
          setIsLoading(false);
        }
      }
    }

    loadPdf();

    return () => {
      mounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [paperId, paper?.pdfUrl]);

  // Load annotations
  useEffect(() => {
    async function loadAnnotations() {
      const anns = await pdfStorageService.getAnnotationsForPaper(paperId);
      setAnnotations(anns);
    }
    loadAnnotations();
  }, [paperId]);

  // Load reading progress
  useEffect(() => {
    async function loadProgress() {
      const progress = await pdfStorageService.getReadingProgress(paperId);
      if (progress) {
        setCurrentPage(progress.currentPage);
      }
    }
    loadProgress();
  }, [paperId]);

  // Save reading progress on page change
  useEffect(() => {
    if (numPages > 0) {
      pdfStorageService.saveReadingProgress(paperId, currentPage, numPages);
      
      // Mark as read when reaching last page
      if (currentPage === numPages) {
        togglePaperRead(paperId);
      }
    }
  }, [currentPage, numPages, paperId, togglePaperRead]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          goToPrevPage();
          break;
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
          goToNextPage();
          break;
        case '+':
        case '=':
          zoomIn();
          break;
        case '-':
          zoomOut();
          break;
        case 'Escape':
          if (isFullscreen) {
            toggleFullscreen();
          } else {
            onClose();
          }
          break;
        case 'f':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setShowSearch(prev => !prev);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, numPages, isFullscreen]);

  // PDF load handlers
  const onDocumentLoadSuccess = useCallback(({ numPages: pages }: { numPages: number }) => {
    setNumPages(pages);
    setIsLoading(false);
  }, []);

  const onDocumentLoadError = useCallback((err: Error) => {
    console.error('PDF load error:', err);
    setError('Failed to load PDF document');
    setIsLoading(false);
  }, []);

  // Navigation
  const goToPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, numPages));
    setCurrentPage(validPage);
  }, [numPages]);

  const goToPrevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const goToNextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  // Zoom controls
  const zoomIn = useCallback(() => {
    const currentIndex = ZOOM_LEVELS.findIndex(z => z >= scale);
    if (currentIndex < ZOOM_LEVELS.length - 1) {
      setScale(ZOOM_LEVELS[currentIndex + 1]);
    }
  }, [scale]);

  const zoomOut = useCallback(() => {
    const currentIndex = ZOOM_LEVELS.findIndex(z => z >= scale);
    if (currentIndex > 0) {
      setScale(ZOOM_LEVELS[currentIndex - 1]);
    }
  }, [scale]);

  const fitToWidth = useCallback(() => {
    if (containerRef.current) {
      // Calculate scale to fit page width
      const containerWidth = containerRef.current.clientWidth - 80; // padding
      const pageWidth = 612; // standard PDF width in points
      setScale(containerWidth / pageWidth);
    }
  }, []);

  const fitToPage = useCallback(() => {
    setScale(1);
  }, []);

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Handle text selection for highlighting
  const handleTextSelection = useCallback(() => {
    if (!highlightMode) return;

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setSelectedText(null);
      return;
    }

    const text = selection.toString().trim();
    if (!text) {
      setSelectedText(null);
      return;
    }

    // Get selection rects
    const range = selection.getRangeAt(0);
    const rects = Array.from(range.getClientRects()).map(rect => ({
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    }));

    if (rects.length > 0) {
      setSelectedText({
        text,
        rects,
        pageNumber: currentPage,
      });
    }
  }, [highlightMode, currentPage]);

  // Create highlight
  const createHighlight = useCallback(async (noteContent?: string) => {
    if (!selectedText) return;

    const annotation = await pdfStorageService.saveAnnotation({
      paperId,
      pageNumber: selectedText.pageNumber,
      type: 'highlight',
      color: selectedColor,
      rects: selectedText.rects,
      textContent: selectedText.text,
      noteContent,
    });

    setAnnotations(prev => [...prev, annotation]);
    setSelectedText(null);
    window.getSelection()?.removeAllRanges();
  }, [selectedText, paperId, selectedColor]);

  // Delete annotation
  const deleteAnnotation = useCallback(async (annotationId: string) => {
    await pdfStorageService.deleteAnnotation(annotationId);
    setAnnotations(prev => prev.filter(a => a.id !== annotationId));
  }, []);

  // Update annotation
  const updateAnnotation = useCallback(async (annotationId: string, updates: Partial<PdfAnnotation>) => {
    const updated = await pdfStorageService.updateAnnotation(annotationId, updates);
    if (updated) {
      setAnnotations(prev => prev.map(a => a.id === annotationId ? updated : a));
    }
  }, []);

  // Jump to annotation
  const jumpToAnnotation = useCallback((annotation: PdfAnnotation) => {
    setCurrentPage(annotation.pageNumber);
    setShowSidebar(false);
  }, []);

  // Download PDF
  const handleDownload = useCallback(async () => {
    const blob = await pdfStorageService.getPdf(paperId);
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${paper?.title || paperId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (paper?.pdfUrl) {
      window.open(paper.pdfUrl, '_blank');
    }
  }, [paperId, paper]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`flex flex-col h-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}
    >
      {/* Toolbar */}
      <div className={`flex-shrink-0 flex items-center justify-between px-4 py-2 border-b ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        {/* Left section */}
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="h-6 w-px bg-gray-300 mx-2" />
          
          {/* Page navigation */}
          <button
            onClick={goToPrevPage}
            disabled={currentPage <= 1}
            className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Previous page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className={`flex items-center gap-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <input
              ref={pageInputRef}
              type="number"
              min={1}
              max={numPages}
              value={currentPage}
              onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
              className={`w-12 text-center rounded border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200' 
                  : 'bg-gray-50 border-gray-300'
              }`}
            />
            <span>of {numPages}</span>
          </div>
          
          <button
            onClick={goToNextPage}
            disabled={currentPage >= numPages}
            className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Next page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Center section - Zoom */}
        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Zoom out (-)"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          
          <span className={`text-sm min-w-[60px] text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {Math.round(scale * 100)}%
          </span>
          
          <button
            onClick={zoomIn}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Zoom in (+)"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          
          <div className="h-6 w-px bg-gray-300 mx-2" />
          
          <button
            onClick={fitToWidth}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            Fit Width
          </button>
          
          <button
            onClick={fitToPage}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            Fit Page
          </button>
        </div>

        {/* Right section - Tools */}
        <div className="flex items-center gap-2">
          {/* Highlight tool */}
          <div className="relative">
            <button
              onClick={() => setHighlightMode(!highlightMode)}
              className={`p-2 rounded-lg transition-colors ${
                highlightMode 
                  ? 'bg-yellow-100 text-yellow-700' 
                  : isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Highlight tool"
            >
              <Highlighter className="w-5 h-5" />
            </button>
            
            {highlightMode && (
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm`}
                style={{ backgroundColor: selectedColor === 'pink' ? '#f472b6' : selectedColor }}
              />
            )}
            
            {showColorPicker && (
              <div className="absolute top-full right-0 mt-2 p-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="flex gap-1">
                  {HIGHLIGHT_COLORS.map(({ color, label, emoji }) => (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        setShowColorPicker(false);
                      }}
                      className={`p-2 rounded hover:bg-gray-100 ${
                        selectedColor === color ? 'ring-2 ring-blue-500' : ''
                      }`}
                      title={label}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`p-2 rounded-lg transition-colors ${
              showSearch
                ? 'bg-blue-100 text-blue-700'
                : isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Search (Ctrl+F)"
          >
            <Search className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className={`p-2 rounded-lg transition-colors ${
              showSidebar
                ? 'bg-blue-100 text-blue-700'
                : isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Annotations sidebar"
          >
            <Sidebar className="w-5 h-5" />
          </button>
          
          <div className="h-6 w-px bg-gray-300 mx-2" />
          
          <button
            onClick={handleDownload}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Download PDF"
          >
            <Download className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
            }`}
            title={isDarkMode ? 'Light mode' : 'Dark mode'}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <button
            onClick={toggleFullscreen}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Search bar */}
      {showSearch && (
        <div className={`flex-shrink-0 px-4 py-2 border-b ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center gap-2 max-w-md mx-auto">
            <Search className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Search in document..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className={`flex-1 px-2 py-1 text-sm rounded border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                  : 'bg-white border-gray-300'
              }`}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* PDF viewer */}
        <div 
          className="flex-1 overflow-auto"
          onMouseUp={handleTextSelection}
        >
          <div className="min-h-full flex items-start justify-center p-10">
            {pdfUrl && (
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="flex items-center justify-center h-96">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  </div>
                }
                error={
                  <div className="flex flex-col items-center justify-center h-96">
                    <FileText className="w-12 h-12 text-gray-300 mb-4" />
                    <p className="text-gray-500">Failed to load PDF</p>
                  </div>
                }
              >
                <div className="relative shadow-xl">
                  <Page
                    pageNumber={currentPage}
                    scale={scale}
                    className={isDarkMode ? 'invert' : ''}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                  />
                  
                  {/* Annotation layer overlay */}
                  <AnnotationLayer
                    annotations={annotations.filter(a => a.pageNumber === currentPage)}
                    scale={scale}
                    onAnnotationClick={() => {
                      // Handle annotation click - show edit options
                    }}
                    onDeleteAnnotation={deleteAnnotation}
                  />
                </div>
              </Document>
            )}
          </div>
        </div>

        {/* Annotations sidebar */}
        {showSidebar && (
          <AnnotationSidebar
            annotations={annotations}
            onAnnotationClick={jumpToAnnotation}
            onDeleteAnnotation={deleteAnnotation}
            onUpdateAnnotation={updateAnnotation}
            onExportAnnotations={() => pdfStorageService.exportAnnotationsAsMarkdown(paperId)}
            isDarkMode={isDarkMode}
          />
        )}
      </div>

      {/* Selection popover */}
      {selectedText && (
        <HighlightPopover
          position={{
            x: selectedText.rects[0].x + selectedText.rects[0].width / 2,
            y: selectedText.rects[0].y - 10,
          }}
          selectedColor={selectedColor}
          onHighlight={() => createHighlight()}
          onHighlightWithNote={(note) => createHighlight(note)}
          onColorChange={setSelectedColor}
          onClose={() => setSelectedText(null)}
        />
      )}

      {/* Reading progress indicator */}
      <div className={`h-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
        <div
          className="h-full bg-blue-500 transition-all"
          style={{ width: `${(currentPage / numPages) * 100}%` }}
        />
      </div>
    </div>
  );
};
