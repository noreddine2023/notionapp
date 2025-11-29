/**
 * PDF Download Service
 * Downloads PDFs from various sources and saves them locally
 */

import { pdfStorageService } from './pdfStorageService';

export interface DownloadProgress {
  paperId: string;
  progress: number; // 0-100
  status: 'pending' | 'downloading' | 'completed' | 'error';
  error?: string;
}

// Track active downloads
const activeDownloads = new Map<string, DownloadProgress>();
const downloadListeners = new Set<(progress: DownloadProgress) => void>();

/**
 * Subscribe to download progress updates
 */
export function onDownloadProgress(callback: (progress: DownloadProgress) => void): () => void {
  downloadListeners.add(callback);
  return () => downloadListeners.delete(callback);
}

/**
 * Notify listeners of download progress
 */
function notifyProgress(progress: DownloadProgress): void {
  activeDownloads.set(progress.paperId, progress);
  downloadListeners.forEach(cb => cb(progress));
}

/**
 * Get current download status for a paper
 */
export function getDownloadStatus(paperId: string): DownloadProgress | null {
  return activeDownloads.get(paperId) || null;
}

/**
 * Download PDF from URL with progress tracking
 */
export async function downloadPdf(
  paperId: string,
  pdfUrl: string,
  fileName?: string
): Promise<boolean> {
  // Check if already downloaded
  const hasLocal = await pdfStorageService.hasLocalPdf(paperId);
  if (hasLocal) {
    notifyProgress({
      paperId,
      progress: 100,
      status: 'completed',
    });
    return true;
  }
  
  // Check if already downloading
  const existing = activeDownloads.get(paperId);
  if (existing && existing.status === 'downloading') {
    return false;
  }
  
  notifyProgress({
    paperId,
    progress: 0,
    status: 'downloading',
  });
  
  try {
    // Try to use a CORS proxy if direct access fails
    let response: Response;
    
    try {
      response = await fetch(pdfUrl, {
        mode: 'cors',
        credentials: 'omit',
      });
    } catch {
      // If direct fetch fails, try without CORS restrictions
      // Note: This requires the server to allow CORS or use a proxy
      console.log('Direct fetch failed, attempting alternative...');
      
      // Try through a different approach - some academic APIs allow CORS
      response = await fetch(pdfUrl);
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    // Get content length for progress tracking
    const contentLength = response.headers.get('Content-Length');
    const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
    
    // Read response as stream if possible
    if (response.body && totalBytes > 0) {
      const reader = response.body.getReader();
      const chunks: BlobPart[] = [];
      let receivedBytes = 0;
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value as BlobPart);
        receivedBytes += value.length;
        
        const progress = Math.round((receivedBytes / totalBytes) * 100);
        notifyProgress({
          paperId,
          progress,
          status: 'downloading',
        });
      }
      
      // Combine chunks into blob
      const blob = new Blob(chunks, { type: 'application/pdf' });
      
      // Save to IndexedDB
      const name = fileName || extractFileName(pdfUrl, paperId);
      await pdfStorageService.savePdf(paperId, blob, name, 'api');
      
      notifyProgress({
        paperId,
        progress: 100,
        status: 'completed',
      });
      
      return true;
    } else {
      // Fallback: read entire response at once
      const blob = await response.blob();
      
      // Verify it's a PDF
      if (!blob.type.includes('pdf') && !pdfUrl.endsWith('.pdf')) {
        throw new Error('Downloaded file is not a PDF');
      }
      
      const name = fileName || extractFileName(pdfUrl, paperId);
      await pdfStorageService.savePdf(paperId, blob, name, 'api');
      
      notifyProgress({
        paperId,
        progress: 100,
        status: 'completed',
      });
      
      return true;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Download failed';
    console.error('PDF download error:', error);
    
    notifyProgress({
      paperId,
      progress: 0,
      status: 'error',
      error: errorMessage,
    });
    
    return false;
  }
}

/**
 * Upload PDF file
 */
export async function uploadPdf(
  paperId: string,
  file: File
): Promise<boolean> {
  try {
    // Validate file type
    if (!file.type.includes('pdf') && !file.name.endsWith('.pdf')) {
      throw new Error('File is not a PDF');
    }
    
    // Save to IndexedDB
    await pdfStorageService.savePdf(paperId, file, file.name, 'upload');
    
    notifyProgress({
      paperId,
      progress: 100,
      status: 'completed',
    });
    
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';
    console.error('PDF upload error:', error);
    
    notifyProgress({
      paperId,
      progress: 0,
      status: 'error',
      error: errorMessage,
    });
    
    return false;
  }
}

/**
 * Cancel active download (if possible)
 */
export function cancelDownload(paperId: string): void {
  // Note: Can't actually cancel fetch in all browsers
  // Just mark as cancelled
  const existing = activeDownloads.get(paperId);
  if (existing && existing.status === 'downloading') {
    notifyProgress({
      paperId,
      progress: 0,
      status: 'error',
      error: 'Download cancelled',
    });
  }
}

/**
 * Clear download status
 */
export function clearDownloadStatus(paperId: string): void {
  activeDownloads.delete(paperId);
}

/**
 * Extract filename from URL
 */
function extractFileName(url: string, fallbackId: string): string {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    
    if (lastPart && lastPart.endsWith('.pdf')) {
      return lastPart;
    }
  } catch {
    // URL parsing failed
  }
  
  return `${fallbackId}.pdf`;
}

/**
 * Create object URL for PDF blob
 */
export async function getPdfObjectUrl(paperId: string): Promise<string | null> {
  const blob = await pdfStorageService.getPdf(paperId);
  if (!blob) return null;
  return URL.createObjectURL(blob);
}

/**
 * Revoke object URL when done
 */
export function revokePdfObjectUrl(url: string): void {
  URL.revokeObjectURL(url);
}

export const pdfDownloadService = {
  downloadPdf,
  uploadPdf,
  cancelDownload,
  clearDownloadStatus,
  getDownloadStatus,
  onDownloadProgress,
  getPdfObjectUrl,
  revokePdfObjectUrl,
};
