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
  PanelRight,
  Search,
  Loader2,
  FileText,
  Hand,
  MousePointer2,
  Upload,
  ExternalLink,
} from 'lucide-react';
import { pdfStorageService } from '../services/pdfStorageService';
import { downloadPdf } from '../services/pdfDownloadService';
import { useResearchStore } from '../store/researchStore';
import type { Paper, PdfAnnotation, HighlightColor } from '../types/paper';
import { AnnotationPanel } from './AnnotationPanel';
import { AnnotationLayer } from './AnnotationLayer';
import { HighlightPopover } from './HighlightPopover';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfReaderProps {
  paperId: string;
  paper?: Paper;
  onClose: () => void;
}

type ToolMode = 'select' | 'hand' | 'highlight';

const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];
const DEFAULT_ZOOM = 1;

const HIGHLIGHT_COLORS: { color: HighlightColor; label: string; bg: string; ring: string }[] = [
  { color: 'yellow', label: 'Yellow', bg: 'bg-yellow-400', ring: 'ring-yellow-500' },
  { color: 'green', label: 'Green', bg: 'bg-green-500', ring: 'ring-green-600' },
  { color: 'blue', label: 'Blue', bg: 'bg-blue-500', ring: 'ring-blue-600' },
  { color: 'pink', label: 'Pink', bg: 'bg-pink-400', ring: 'ring-pink-500' },
  { color: 'orange', label: 'Orange', bg: 'bg-orange-400', ring: 'ring-orange-500' },
  { color: 'purple', label: 'Purple', bg: 'bg-purple-500', ring: 'ring-purple-600' },
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
  const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number } | null>(null);
  const [toolMode, setToolMode] = useState<ToolMode>('select');
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // For backwards compatibility
  const highlightMode = toolMode === 'highlight';

  const containerRef = useRef<HTMLDivElement>(null);
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const pageInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          // Verify blob is valid
          if (localBlob.size > 0) {
            objectUrl = URL.createObjectURL(localBlob);
            setPdfUrl(objectUrl);
            setIsLoading(false);
            return;
          }
        }

        // If not local, check if paper has URL and try to download
        if (paper?.pdfUrl) {
          setIsLoading(true);
          const success = await downloadPdf(paperId, paper.pdfUrl);
          
          if (success && mounted) {
            const blob = await pdfStorageService.getPdf(paperId);
            if (blob && blob.size > 0) {
              objectUrl = URL.createObjectURL(blob);
              setPdfUrl(objectUrl);
              setIsLoading(false);
              return;
            }
          }
          
          // If download failed, still try the direct URL as fallback
          if (mounted) {
            setPdfUrl(paper.pdfUrl);
            setIsLoading(false);
          }
        } else {
          // No PDF available - show upload option
          setError('No PDF available for this paper');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load PDF:', err);
        if (mounted) {
          setError('Failed to load PDF. You can try uploading a PDF file instead.');
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
        case 'h':
        case 'H':
          setToolMode('hand');
          break;
        case 'v':
        case 'V':
          setToolMode('select');
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
    // Check if it's a CORS error
    if (err.message.includes('Failed to fetch') || err.message.includes('CORS')) {
      setError('Could not load PDF from remote URL due to access restrictions. Please upload the PDF manually.');
    } else {
      setError('Failed to load PDF document. The file may be corrupted or inaccessible.');
    }
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

  // Handle panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (toolMode === 'hand') {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  }, [toolMode]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning && panStart && scrollContainerRef.current) {
      const deltaX = panStart.x - e.clientX;
      const deltaY = panStart.y - e.clientY;
      scrollContainerRef.current.scrollLeft += deltaX;
      scrollContainerRef.current.scrollTop += deltaY;
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  }, [isPanning, panStart]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setPanStart(null);
  }, []);

  // Handle text selection for highlighting
  const handleTextSelection = useCallback(async () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setSelectedText(null);
      setPopoverPosition(null);
      return;
    }

    const text = selection.toString().trim();
    if (!text) {
      setSelectedText(null);
      setPopoverPosition(null);
      return;
    }

    // Get the page container element to calculate relative positions
    const pageContainer = pageContainerRef.current;
    if (!pageContainer) {
      setSelectedText(null);
      setPopoverPosition(null);
      return;
    }

    // Get the bounding rect of the page container
    const pageRect = pageContainer.getBoundingClientRect();

    // Get selection rects and convert to coordinates relative to the PDF page
    const range = selection.getRangeAt(0);
    const clientRects = Array.from(range.getClientRects());
    
    // Filter out empty rects and convert to page-relative coordinates
    const rects = clientRects
      .filter(rect => rect.width > 0 && rect.height > 0)
      .map(rect => ({
        // Convert to coordinates relative to the page container, accounting for scale
        x: (rect.x - pageRect.x) / scale,
        y: (rect.y - pageRect.y) / scale,
        width: rect.width / scale,
        height: rect.height / scale,
      }));

    if (rects.length > 0) {
      // If highlight mode is active, immediately create highlight
      if (highlightMode) {
        const annotation = await pdfStorageService.saveAnnotation({
          paperId,
          pageNumber: currentPage,
          type: 'highlight',
          color: selectedColor,
          rects,
          textContent: text,
        });
        setAnnotations(prev => [...prev, annotation]);
        window.getSelection()?.removeAllRanges();
        setSelectedText(null);
        setPopoverPosition(null);
        return;
      }
      
      // If not in highlight mode, show popover for options
      const firstClientRect = clientRects.find(r => r.width > 0 && r.height > 0);
      if (firstClientRect) {
        setPopoverPosition({
          x: firstClientRect.x + firstClientRect.width / 2,
          y: firstClientRect.y - 10,
        });
      }
      
      setSelectedText({
        text,
        rects,
        pageNumber: currentPage,
      });
    }
  }, [highlightMode, currentPage, scale, paperId, selectedColor]);

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
    setPopoverPosition(null);
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

  // Add standalone note (without text selection)
  const addNote = useCallback(async (pageNumber: number, noteContent: string, color: HighlightColor) => {
    try {
      const annotation = await pdfStorageService.saveAnnotation({
        paperId,
        pageNumber,
        type: 'note',
        color,
        rects: [], // No highlight rects for standalone notes
        noteContent,
      });
      setAnnotations(prev => [...prev, annotation]);
    } catch (err) {
      console.error('Failed to add note:', err);
    }
  }, [paperId]);

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

  // Upload PDF handler
  const handleUploadPdf = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file is a PDF
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a valid PDF file');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      // Read file as ArrayBuffer first to ensure it's valid
      const arrayBuffer = await file.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      
      // Save to IndexedDB
      await pdfStorageService.savePdf(paperId, blob, file.name, 'upload');
      
      // Verify save was successful
      const savedBlob = await pdfStorageService.getPdf(paperId);
      if (!savedBlob || savedBlob.size === 0) {
        throw new Error('Failed to save PDF');
      }
      
      // Create object URL from the saved blob
      const url = URL.createObjectURL(savedBlob);
      setPdfUrl(url);
      setError(null);
      setIsLoading(false);
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Failed to upload PDF. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset file input
      event.target.value = '';
    }
  }, [paperId]);

  // Handle download from remote URL
  const handleDownloadFromUrl = useCallback(async () => {
    if (!paper?.pdfUrl) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await downloadPdf(paperId, paper.pdfUrl);
      if (success) {
        const blob = await pdfStorageService.getPdf(paperId);
        if (blob) {
          const url = URL.createObjectURL(blob);
          setPdfUrl(url);
          setError(null);
        }
      } else {
        setError('Download failed. Please try uploading the PDF manually.');
      }
    } catch (err) {
      console.error('Download failed:', err);
      setError('Download failed. Please try uploading the PDF manually.');
    } finally {
      setIsLoading(false);
    }
  }, [paperId, paper?.pdfUrl]);

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
    // Generate search URL based on DOI or title
    const getSearchUrl = () => {
      if (paper?.doi) {
        return `https://doi.org/${paper.doi}`;
      }
      if (paper?.title) {
        return `https://scholar.google.com/scholar?q=${encodeURIComponent(paper.title)}`;
      }
      return null;
    };
    
    const searchUrl = getSearchUrl();
    
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="text-center max-w-md p-6 bg-white rounded-xl shadow-lg">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">PDF Not Available</h2>
          <p className="text-gray-600 mb-6">
            {paper?.pdfUrl 
              ? "The PDF hasn't been downloaded yet. Download it or upload your own copy."
              : "No PDF URL found for this paper. You can upload your own PDF file."}
          </p>
          
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleUploadPdf}
            className="hidden"
          />
          
          <div className="flex flex-col gap-3">
            {/* Upload button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>Upload PDF</span>
                </>
              )}
            </button>
            
            {/* Download button - only show if paper has pdfUrl */}
            {paper?.pdfUrl && (
              <button
                onClick={handleDownloadFromUrl}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Download className="w-5 h-5" />
                <span>Download PDF</span>
              </button>
            )}
            
            {/* Search/Find PDF link - only show if we have DOI or title */}
            {searchUrl && (
              <a
                href={searchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
                <span>{paper?.doi ? 'View on DOI.org' : 'Search on Google Scholar'}</span>
              </a>
            )}
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
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
          {/* Select tool */}
          <button
            onClick={() => setToolMode('select')}
            className={`p-2 rounded-lg transition-colors ${
              toolMode === 'select'
                ? 'bg-blue-100 text-blue-700'
                : isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Select tool (V)"
          >
            <MousePointer2 className="w-5 h-5" />
          </button>
          
          {/* Hand/Pan tool */}
          <button
            onClick={() => setToolMode('hand')}
            className={`p-2 rounded-lg transition-colors ${
              toolMode === 'hand'
                ? 'bg-blue-100 text-blue-700'
                : isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Hand tool (H)"
          >
            <Hand className="w-5 h-5" />
          </button>
          
          {/* Highlight tool */}
          <div className="relative">
            <button
              onClick={() => setToolMode(toolMode === 'highlight' ? 'select' : 'highlight')}
              className={`p-2 rounded-lg transition-colors ${
                toolMode === 'highlight'
                  ? 'bg-yellow-100 text-yellow-700' 
                  : isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Highlight tool"
            >
              <Highlighter className="w-5 h-5" />
            </button>
            
            {toolMode === 'highlight' && (
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm`}
                style={{ backgroundColor: selectedColor === 'pink' ? '#f472b6' : selectedColor }}
              />
            )}
            
            {showColorPicker && (
              <div className="absolute top-full right-0 mt-2 p-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="flex gap-1.5">
                  {HIGHLIGHT_COLORS.map(({ color, label, bg, ring }) => (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        setShowColorPicker(false);
                      }}
                      className={`w-6 h-6 rounded-full ${bg} hover:scale-110 transition-all duration-150 shadow-sm ${
                        selectedColor === color ? `ring-2 ring-offset-2 ${ring}` : ''
                      }`}
                      title={label}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="h-6 w-px bg-gray-300 mx-2" />
          
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
            title="Annotations panel"
          >
            <PanelRight className="w-5 h-5" />
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
          ref={scrollContainerRef}
          className={`flex-1 overflow-auto ${
            toolMode === 'hand' 
              ? isPanning ? 'cursor-grabbing' : 'cursor-grab'
              : toolMode === 'highlight' 
                ? 'cursor-crosshair' 
                : 'cursor-text'
          }`}
          onMouseUp={toolMode !== 'hand' ? handleTextSelection : handleMouseUp}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseUp}
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
                <div ref={pageContainerRef} className="relative shadow-xl select-text">
                  <div style={isDarkMode ? { filter: 'invert(0.85) hue-rotate(180deg)' } : undefined}>
                    <Page
                      pageNumber={currentPage}
                      scale={scale}
                      renderTextLayer={toolMode !== 'hand'}
                      renderAnnotationLayer={true}
                      loading={
                        <div className="flex items-center justify-center h-96 w-96">
                          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        </div>
                      }
                      error={
                        <div className="flex flex-col items-center justify-center h-96 w-96">
                          <FileText className="w-12 h-12 text-gray-300 mb-4" />
                          <p className="text-gray-500">Failed to load page</p>
                        </div>
                      }
                    />
                  </div>
                  
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

        {/* Annotations panel on the right */}
        {showSidebar && (
          <AnnotationPanel
            annotations={annotations}
            currentPage={currentPage}
            onClose={() => setShowSidebar(false)}
            onNavigateToPage={(pageNumber) => {
              setCurrentPage(pageNumber);
            }}
            onDeleteAnnotation={deleteAnnotation}
            onUpdateAnnotation={updateAnnotation}
            onAddNote={addNote}
            isDarkMode={isDarkMode}
          />
        )}
      </div>

      {/* Selection popover */}
      {selectedText && popoverPosition && (
        <HighlightPopover
          position={popoverPosition}
          selectedColor={selectedColor}
          onHighlight={() => createHighlight()}
          onHighlightWithNote={(note) => createHighlight(note)}
          onColorChange={setSelectedColor}
          onClose={() => {
            setSelectedText(null);
            setPopoverPosition(null);
          }}
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
