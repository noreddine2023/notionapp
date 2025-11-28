/**
 * Paper Detail Component - Detailed view of a paper
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Quote,
  ExternalLink,
  Copy,
  Check,
  Star,
  StarOff,
  Plus,
  FileText,
  Tag,
  Users,
  Loader2,
  ChevronDown,
  Download,
  Upload,
  HardDrive,
} from 'lucide-react';
import { usePaperDetails } from '../hooks/usePaperDetails';
import { useResearchStore } from '../store/researchStore';
import { generateCitation, copyToClipboard } from '../services/citationService';
import { pdfStorageService } from '../services/pdfStorageService';
import { pdfDownloadService, DownloadProgress, onDownloadProgress } from '../services/pdfDownloadService';
import type { CitationFormat, ReadingProgress } from '../types/paper';

interface PaperDetailProps {
  paperId: string;
}

const CITATION_FORMATS: { value: CitationFormat; label: string }[] = [
  { value: 'apa', label: 'APA' },
  { value: 'mla', label: 'MLA' },
  { value: 'chicago', label: 'Chicago' },
  { value: 'harvard', label: 'Harvard' },
  { value: 'ieee', label: 'IEEE' },
  { value: 'bibtex', label: 'BibTeX' },
];

export const PaperDetail: React.FC<PaperDetailProps> = ({ paperId }) => {
  const [citationFormat, setCitationFormat] = useState<CitationFormat>('apa');
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [showAddToProject, setShowAddToProject] = useState(false);
  const [personalNotes, setPersonalNotes] = useState('');
  const [showFullAbstract, setShowFullAbstract] = useState(false);
  const [hasLocalPdf, setHasLocalPdf] = useState(false);
  const [readingProgress, setReadingProgress] = useState<ReadingProgress | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { paper, isLoading, error } = usePaperDetails(paperId);
  
  const {
    setCurrentView,
    setSelectedPaper,
    addPaperToLibrary,
    removePaperFromLibrary,
    isPaperInLibrary,
    togglePaperFavorite,
    togglePaperRead,
    setPaperNotes,
    projects,
    addPaperToProject,
    getPaperById,
  } = useResearchStore();

  const isInLibrary = isPaperInLibrary(paperId);
  const libraryPaper = getPaperById(paperId);

  // Check for local PDF and reading progress
  useEffect(() => {
    async function checkPdfStatus() {
      const hasPdf = await pdfStorageService.hasLocalPdf(paperId);
      setHasLocalPdf(hasPdf);
      
      if (hasPdf) {
        const progress = await pdfStorageService.getReadingProgress(paperId);
        setReadingProgress(progress);
      }
    }
    checkPdfStatus();
  }, [paperId]);

  // Subscribe to download progress
  useEffect(() => {
    const unsubscribe = onDownloadProgress((progress) => {
      if (progress.paperId === paperId) {
        setDownloadProgress(progress);
        if (progress.status === 'completed') {
          setHasLocalPdf(true);
        }
      }
    });
    return unsubscribe;
  }, [paperId]);

  React.useEffect(() => {
    if (libraryPaper?.personalNotes) {
      setPersonalNotes(libraryPaper.personalNotes);
    }
  }, [libraryPaper]);

  const handleBack = () => {
    setSelectedPaper(null);
    setCurrentView('search');
  };

  const handleReadPaper = () => {
    setCurrentView('pdf-reader');
  };

  const handleDownloadPdf = async () => {
    if (paper?.pdfUrl) {
      await pdfDownloadService.downloadPdf(paperId, paper.pdfUrl);
    }
  };

  const handleUploadPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await pdfDownloadService.uploadPdf(paperId, file);
      setHasLocalPdf(true);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopyTitle = async () => {
    if (paper) {
      await copyToClipboard(paper.title);
      setCopiedTitle(true);
      setTimeout(() => setCopiedTitle(false), 2000);
    }
  };

  const handleCopyCitation = async () => {
    if (paper) {
      const citation = generateCitation(paper, citationFormat);
      await copyToClipboard(citation);
      setCopiedCitation(true);
      setTimeout(() => setCopiedCitation(false), 2000);
    }
  };

  const handleSaveNotes = () => {
    if (isInLibrary) {
      setPaperNotes(paperId, personalNotes);
    }
  };

  const handleAddToProject = (projectId: string) => {
    if (!isInLibrary && paper) {
      addPaperToLibrary(paper);
    }
    addPaperToProject(paperId, projectId);
    setShowAddToProject(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
        <p className="text-sm text-gray-500">Loading paper details...</p>
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <FileText className="w-12 h-12 text-gray-300 mb-3" />
        <p className="text-sm text-gray-500">{error || 'Paper not found'}</p>
        <button
          onClick={handleBack}
          className="mt-4 text-blue-600 hover:text-blue-800 text-sm"
        >
          Go back to search
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800 mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* PDF Status Badge */}
        <div className="flex items-center gap-2 mb-3">
          {hasLocalPdf ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
              <HardDrive className="w-3 h-3" />
              PDF Available
            </span>
          ) : paper?.pdfUrl ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
              PDF Online
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
              No PDF
            </span>
          )}
          
          {readingProgress && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
              <BookOpen className="w-3 h-3" />
              {readingProgress.percentComplete}% read
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {/* Read Paper Button */}
          {hasLocalPdf ? (
            <button
              onClick={handleReadPaper}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Read Paper
            </button>
          ) : paper?.pdfUrl ? (
            downloadProgress?.status === 'downloading' ? (
              <button
                disabled
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-md"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                Downloading... {downloadProgress.progress}%
              </button>
            ) : (
              <button
                onClick={handleDownloadPdf}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            )
          ) : null}

          {/* Upload PDF */}
          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors cursor-pointer">
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Upload PDF
            <input
              type="file"
              accept=".pdf"
              onChange={handleUploadPdf}
              className="hidden"
              disabled={isUploading}
            />
          </label>

          <button
            onClick={() => {
              if (isInLibrary) {
                removePaperFromLibrary(paper.id);
              } else {
                addPaperToLibrary(paper);
              }
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
              isInLibrary
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            {isInLibrary ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {isInLibrary ? 'In Library' : 'Add to Library'}
          </button>

          {isInLibrary && (
            <button
              onClick={() => togglePaperFavorite(paper.id)}
              className={`p-1.5 rounded-md transition-colors ${
                libraryPaper?.isFavorite
                  ? 'text-yellow-500 bg-yellow-50'
                  : 'text-gray-400 hover:bg-gray-100'
              }`}
            >
              {libraryPaper?.isFavorite ? (
                <Star className="w-5 h-5 fill-current" />
              ) : (
                <StarOff className="w-5 h-5" />
              )}
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setShowAddToProject(!showAddToProject)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add to Project
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {showAddToProject && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                {projects.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-gray-500">No projects yet</p>
                ) : (
                  projects.filter(p => !p.parentId).map((project) => (
                    <button
                      key={project.id}
                      onClick={() => handleAddToProject(project.id)}
                      className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {project.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Title */}
        <div className="flex items-start gap-2 mb-4">
          <h1 className="text-xl font-bold text-gray-900 flex-1">
            {paper.title}
          </h1>
          <button
            onClick={handleCopyTitle}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            title="Copy title"
          >
            {copiedTitle ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {paper.year > 0 && (
            <span className="inline-flex items-center gap-1 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              {paper.year}
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-sm text-gray-600">
            <Quote className="w-4 h-4" />
            {paper.citationCount} citations
          </span>
          {paper.openAccess && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
              Open Access
            </span>
          )}
        </div>

        {/* Authors */}
        <div className="mb-4">
          <h3 className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
            <Users className="w-4 h-4" />
            Authors
          </h3>
          <div className="flex flex-wrap gap-2">
            {paper.authors.map((author, index) => (
              <span
                key={index}
                className="px-2 py-1 text-sm bg-gray-100 text-gray-700 rounded-md"
              >
                {author.name}
              </span>
            ))}
          </div>
        </div>

        {/* Venue */}
        {paper.venue && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-1">Published in</h3>
            <p className="text-sm text-gray-600 italic">{paper.venue}</p>
          </div>
        )}

        {/* Abstract */}
        {paper.abstract && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Abstract</h3>
            <p className={`text-sm text-gray-600 ${!showFullAbstract && 'line-clamp-5'}`}>
              {paper.abstract}
            </p>
            {paper.abstract.length > 500 && (
              <button
                onClick={() => setShowFullAbstract(!showFullAbstract)}
                className="text-sm text-blue-600 hover:text-blue-800 mt-1"
              >
                {showFullAbstract ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        )}

        {/* Keywords */}
        {paper.keywords.length > 0 && (
          <div className="mb-4">
            <h3 className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4" />
              Keywords
            </h3>
            <div className="flex flex-wrap gap-2">
              {paper.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Links */}
        <div className="mb-4 flex flex-wrap gap-3">
          {paper.pdfUrl && (
            <a
              href={paper.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              View PDF
            </a>
          )}
          {paper.doi && (
            <a
              href={`https://doi.org/${paper.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              DOI: {paper.doi}
            </a>
          )}
        </div>

        {/* Citation generator */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Generate Citation</h3>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {CITATION_FORMATS.map((format) => (
              <button
                key={format.value}
                onClick={() => setCitationFormat(format.value)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  citationFormat === format.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {format.label}
              </button>
            ))}
          </div>

          <div className="bg-white p-3 rounded-md border border-gray-200 mb-2">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
              {generateCitation(paper, citationFormat)}
            </pre>
          </div>

          <button
            onClick={handleCopyCitation}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
          >
            {copiedCitation ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Citation
              </>
            )}
          </button>
        </div>

        {/* Personal notes (only for library papers) */}
        {isInLibrary && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Personal Notes</h3>
            <textarea
              value={personalNotes}
              onChange={(e) => setPersonalNotes(e.target.value)}
              onBlur={handleSaveNotes}
              placeholder="Add your notes about this paper..."
              className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[100px]"
            />
          </div>
        )}

        {/* Mark as read */}
        {isInLibrary && (
          <button
            onClick={() => togglePaperRead(paper.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
              libraryPaper?.isRead
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            {libraryPaper?.isRead ? 'Mark as unread' : 'Mark as read'}
          </button>
        )}
      </div>
    </div>
  );
};
