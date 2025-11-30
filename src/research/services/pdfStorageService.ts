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

// ============= PDF Storage Operations =============

/**
 * Normalize paperId to ensure consistency
 * Trims whitespace from the paperId
 */
function normalizePaperId(paperId: string): string {
  return paperId.trim();
}

/**
 * Save PDF to IndexedDB
 */
export async function savePdf(
  paperId: string,
  pdfBlob: Blob,
  fileName: string,
  source: 'api' | 'upload' = 'api'
): Promise<void> {
  const normalizedId = normalizePaperId(paperId);
  console.log('[pdfStorageService] Saving PDF with paperId:', normalizedId, 'size:', pdfBlob.size, 'source:', source);
  
  const db = await getDB();
  const storage: PdfStorage = {
    paperId: normalizedId,
    pdfBlob,
    fileName,
    fileSize: pdfBlob.size,
    downloadedAt: new Date(),
    source,
  };
  await db.put(PDF_STORE, storage);
  
  // Verify the save was successful
  const verification = await db.get(PDF_STORE, normalizedId);
  console.log('[pdfStorageService] Verification - PDF saved:', !!verification, 'size:', verification?.fileSize);
  
  if (!verification) {
    throw new Error('Failed to save PDF to storage');
  }
}

/**
 * Get PDF from IndexedDB
 */
export async function getPdf(paperId: string): Promise<Blob | null> {
  const normalizedId = normalizePaperId(paperId);
  console.log('[pdfStorageService] Getting PDF with paperId:', normalizedId);
  
  const db = await getDB();
  const storage = await db.get(PDF_STORE, normalizedId);
  console.log('[pdfStorageService] Found PDF:', !!storage, 'size:', storage?.fileSize);
  
  return storage?.pdfBlob || null;
}

/**
 * Get PDF storage info
 */
export async function getPdfInfo(paperId: string): Promise<Omit<PdfStorage, 'pdfBlob'> | null> {
  const normalizedId = normalizePaperId(paperId);
  const db = await getDB();
  const storage = await db.get(PDF_STORE, normalizedId);
  if (!storage) return null;
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { pdfBlob, ...info } = storage;
  return info;
}

/**
 * Delete PDF from IndexedDB
 */
export async function deletePdf(paperId: string): Promise<void> {
  const normalizedId = normalizePaperId(paperId);
  const db = await getDB();
  await db.delete(PDF_STORE, normalizedId);
}

/**
 * Check if PDF exists locally
 */
export async function hasLocalPdf(paperId: string): Promise<boolean> {
  const normalizedId = normalizePaperId(paperId);
  console.log('[pdfStorageService] Checking if PDF exists for paperId:', normalizedId);
  
  const db = await getDB();
  const storage = await db.get(PDF_STORE, normalizedId);
  const exists = !!storage && !!storage.pdfBlob && storage.pdfBlob.size > 0;
  console.log('[pdfStorageService] PDF exists:', exists, 'size:', storage?.fileSize);
  
  return exists;
}

/**
 * Get all stored PDFs
 */
export async function getAllPdfs(): Promise<Array<Omit<PdfStorage, 'pdfBlob'>>> {
  const db = await getDB();
  const all = await db.getAll(PDF_STORE);
  return all.map(({ pdfBlob: _pdfBlob, ...info }) => info);
}

/**
 * Get storage usage statistics
 */
export async function getStorageUsage(): Promise<{
  used: number;
  pdfCount: number;
  annotationCount: number;
}> {
  const db = await getDB();
  const pdfs = await db.getAll(PDF_STORE);
  const annotations = await db.getAll(ANNOTATION_STORE);
  
  const totalSize = pdfs.reduce((sum, pdf) => sum + pdf.fileSize, 0);
  
  return {
    used: totalSize,
    pdfCount: pdfs.length,
    annotationCount: annotations.length,
  };
}

/**
 * Clear all PDFs to free space
 */
export async function clearAllPdfs(): Promise<void> {
  const db = await getDB();
  await db.clear(PDF_STORE);
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
  // PDF operations
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
};
