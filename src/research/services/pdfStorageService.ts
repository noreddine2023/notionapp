/**
 * PDF Storage Service using IndexedDB
 * Stores PDFs, reading progress, and annotations locally
 */

import { openDB, IDBPDatabase } from 'idb';
import type { PdfStorage, ReadingProgress, PdfAnnotation } from '../types/paper';

const DB_NAME = 'research-pdf-storage';
const DB_VERSION = 1;

// Store names
const PDF_STORE = 'pdfs';
const PROGRESS_STORE = 'reading-progress';
const ANNOTATION_STORE = 'annotations';

type ResearchDB = {
  [PDF_STORE]: {
    key: string;
    value: PdfStorage;
    indexes: { 'by-date': Date };
  };
  [PROGRESS_STORE]: {
    key: string;
    value: ReadingProgress;
    indexes: { 'by-date': Date };
  };
  [ANNOTATION_STORE]: {
    key: string;
    value: PdfAnnotation;
    indexes: { 'by-paper': string; 'by-page': [string, number] };
  };
};

let dbPromise: Promise<IDBPDatabase<ResearchDB>> | null = null;

/**
 * Initialize and get database connection
 */
async function getDB(): Promise<IDBPDatabase<ResearchDB>> {
  if (!dbPromise) {
    dbPromise = openDB<ResearchDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // PDF storage
        if (!db.objectStoreNames.contains(PDF_STORE)) {
          const pdfStore = db.createObjectStore(PDF_STORE, { keyPath: 'paperId' });
          pdfStore.createIndex('by-date', 'downloadedAt');
        }
        
        // Reading progress
        if (!db.objectStoreNames.contains(PROGRESS_STORE)) {
          const progressStore = db.createObjectStore(PROGRESS_STORE, { keyPath: 'paperId' });
          progressStore.createIndex('by-date', 'lastReadAt');
        }
        
        // Annotations
        if (!db.objectStoreNames.contains(ANNOTATION_STORE)) {
          const annotationStore = db.createObjectStore(ANNOTATION_STORE, { keyPath: 'id' });
          annotationStore.createIndex('by-paper', 'paperId');
          annotationStore.createIndex('by-page', ['paperId', 'pageNumber']);
        }
      },
    });
  }
  return dbPromise;
}

// ============= PDF Storage Operations (DEPRECATED) =============
// PDF blob storage has been deprecated in favor of view-only streaming.
// PDFs are now fetched directly from source URLs without local storage.
// Only annotations and reading progress are persisted.

/**
 * Normalize paperId to ensure consistency
 * Trims whitespace from the paperId
 */
function normalizePaperId(paperId: string): string {
  return paperId.trim();
}

/**
 * @deprecated PDF blobs are no longer stored. PDFs are fetched directly from source URLs.
 * This function is kept for backwards compatibility but does nothing.
 */
export async function savePdf(
  _paperId: string,
  _pdfBlob: Blob,
  _fileName: string,
  _source: 'api' | 'upload' = 'api'
): Promise<void> {
  console.log('[pdfStorageService] savePdf is deprecated - PDFs are now view-only and not stored');
  // No-op: PDFs are no longer stored locally
}

/**
 * @deprecated PDF blobs are no longer stored. PDFs are fetched directly from source URLs.
 * This function is kept for backwards compatibility but always returns null.
 */
export async function getPdf(_paperId: string): Promise<Blob | null> {
  console.log('[pdfStorageService] getPdf is deprecated - PDFs are now view-only');
  return null;
}

/**
 * @deprecated PDF storage info is no longer available.
 */
export async function getPdfInfo(_paperId: string): Promise<Omit<PdfStorage, 'pdfBlob'> | null> {
  console.log('[pdfStorageService] getPdfInfo is deprecated');
  return null;
}

/**
 * @deprecated PDF blobs are no longer stored.
 */
export async function deletePdf(_paperId: string): Promise<void> {
  console.log('[pdfStorageService] deletePdf is deprecated');
  // No-op
}

/**
 * @deprecated PDF blobs are no longer stored locally.
 * Use hasAnnotations() to check if a paper has annotation data.
 */
export async function hasLocalPdf(_paperId: string): Promise<boolean> {
  console.log('[pdfStorageService] hasLocalPdf is deprecated - always returns false');
  return false;
}

/**
 * @deprecated PDF storage is no longer used.
 */
export async function getAllPdfs(): Promise<Array<Omit<PdfStorage, 'pdfBlob'>>> {
  console.log('[pdfStorageService] getAllPdfs is deprecated');
  return [];
}

/**
 * Get storage usage statistics (annotations only, PDFs are no longer stored)
 */
export async function getStorageUsage(): Promise<{
  used: number;
  pdfCount: number;
  annotationCount: number;
}> {
  const db = await getDB();
  const annotations = await db.getAll(ANNOTATION_STORE);
  
  return {
    used: 0, // No PDFs stored
    pdfCount: 0,
    annotationCount: annotations.length,
  };
}

/**
 * @deprecated PDF storage is no longer used.
 */
export async function clearAllPdfs(): Promise<void> {
  console.log('[pdfStorageService] clearAllPdfs is deprecated');
  // No-op
}

/**
 * Check if annotations exist for a paper
 */
export async function hasAnnotations(paperId: string): Promise<boolean> {
  const normalizedId = normalizePaperId(paperId);
  const annotations = await getAnnotationsForPaper(normalizedId);
  return annotations.length > 0;
}

// ============= Reading Progress Operations =============

/**
 * Save reading progress
 */
export async function saveReadingProgress(
  paperId: string,
  currentPage: number,
  totalPages: number
): Promise<void> {
  const db = await getDB();
  const progress: ReadingProgress = {
    paperId,
    currentPage,
    totalPages,
    percentComplete: Math.round((currentPage / totalPages) * 100),
    lastReadAt: new Date(),
  };
  await db.put(PROGRESS_STORE, progress);
}

/**
 * Get reading progress
 */
export async function getReadingProgress(paperId: string): Promise<ReadingProgress | null> {
  const db = await getDB();
  const progress = await db.get(PROGRESS_STORE, paperId);
  return progress || null;
}

/**
 * Delete reading progress
 */
export async function deleteReadingProgress(paperId: string): Promise<void> {
  const db = await getDB();
  await db.delete(PROGRESS_STORE, paperId);
}

/**
 * Get all reading progress
 */
export async function getAllReadingProgress(): Promise<ReadingProgress[]> {
  const db = await getDB();
  return db.getAll(PROGRESS_STORE);
}

// ============= Annotation Operations =============

/**
 * Generate unique annotation ID
 */
function generateAnnotationId(): string {
  return `ann_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Save annotation
 */
export async function saveAnnotation(
  annotation: Omit<PdfAnnotation, 'id' | 'createdAt' | 'updatedAt'>
): Promise<PdfAnnotation> {
  const db = await getDB();
  const now = new Date();
  const fullAnnotation: PdfAnnotation = {
    ...annotation,
    id: generateAnnotationId(),
    createdAt: now,
    updatedAt: now,
  };
  await db.put(ANNOTATION_STORE, fullAnnotation);
  return fullAnnotation;
}

/**
 * Update annotation
 */
export async function updateAnnotation(
  id: string,
  updates: Partial<Omit<PdfAnnotation, 'id' | 'paperId' | 'createdAt'>>
): Promise<PdfAnnotation | null> {
  const db = await getDB();
  const existing = await db.get(ANNOTATION_STORE, id);
  if (!existing) return null;
  
  const updated: PdfAnnotation = {
    ...existing,
    ...updates,
    updatedAt: new Date(),
  };
  await db.put(ANNOTATION_STORE, updated);
  return updated;
}

/**
 * Delete annotation
 */
export async function deleteAnnotation(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(ANNOTATION_STORE, id);
}

/**
 * Get annotation by ID
 */
export async function getAnnotation(id: string): Promise<PdfAnnotation | null> {
  const db = await getDB();
  const annotation = await db.get(ANNOTATION_STORE, id);
  return annotation || null;
}

/**
 * Get all annotations for a paper
 */
export async function getAnnotationsForPaper(paperId: string): Promise<PdfAnnotation[]> {
  const db = await getDB();
  const index = db.transaction(ANNOTATION_STORE).store.index('by-paper');
  return index.getAll(paperId);
}

/**
 * Get annotations for a specific page
 */
export async function getAnnotationsForPage(
  paperId: string,
  pageNumber: number
): Promise<PdfAnnotation[]> {
  const db = await getDB();
  const index = db.transaction(ANNOTATION_STORE).store.index('by-page');
  return index.getAll([paperId, pageNumber]);
}

/**
 * Delete all annotations for a paper
 */
export async function deleteAnnotationsForPaper(paperId: string): Promise<void> {
  const db = await getDB();
  const annotations = await getAnnotationsForPaper(paperId);
  const tx = db.transaction(ANNOTATION_STORE, 'readwrite');
  await Promise.all(annotations.map(ann => tx.store.delete(ann.id)));
  await tx.done;
}

/**
 * Export annotations as JSON
 */
export async function exportAnnotations(paperId: string): Promise<string> {
  const annotations = await getAnnotationsForPaper(paperId);
  return JSON.stringify(annotations, null, 2);
}

/**
 * Export annotations as markdown
 */
export async function exportAnnotationsAsMarkdown(paperId: string): Promise<string> {
  const annotations = await getAnnotationsForPaper(paperId);
  
  // Sort by page number
  annotations.sort((a, b) => a.pageNumber - b.pageNumber);
  
  let markdown = '# Annotations\n\n';
  let currentPage = 0;
  
  for (const ann of annotations) {
    if (ann.pageNumber !== currentPage) {
      currentPage = ann.pageNumber;
      markdown += `\n## Page ${currentPage}\n\n`;
    }
    
    if (ann.textContent) {
      const colorEmoji: Record<string, string> = {
        yellow: '🟡',
        green: '🟢',
        blue: '🔵',
        pink: '🩷',
        orange: '🟠',
        purple: '🟣',
      };
      markdown += `${colorEmoji[ann.color] || '•'} **${ann.type}**: "${ann.textContent}"\n`;
    }
    
    if (ann.noteContent) {
      markdown += `   > Note: ${ann.noteContent}\n`;
    }
    
    markdown += '\n';
  }
  
  return markdown;
}

export const pdfStorageService = {
  // PDF operations (deprecated - kept for backwards compatibility)
  savePdf,
  getPdf,
  getPdfInfo,
  deletePdf,
  hasLocalPdf,
  getAllPdfs,
  getStorageUsage,
  clearAllPdfs,
  
  // Reading progress
  saveReadingProgress,
  getReadingProgress,
  deleteReadingProgress,
  getAllReadingProgress,
  
  // Annotations
  saveAnnotation,
  updateAnnotation,
  deleteAnnotation,
  getAnnotation,
  getAnnotationsForPaper,
  getAnnotationsForPage,
  deleteAnnotationsForPaper,
  exportAnnotations,
  exportAnnotationsAsMarkdown,
  hasAnnotations,
};
