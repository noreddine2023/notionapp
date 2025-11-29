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

// CORS proxies to try in order
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
];

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
 * Check if a response is a valid PDF
 */
function isPdfResponse(blob: Blob, url: string): boolean {
  // Check MIME type
  if (blob.type.includes('pdf')) return true;
  
  // Check URL extension
  if (url.toLowerCase().endsWith('.pdf')) return true;
  
  // Check blob size - PDFs are typically at least a few KB
  if (blob.size < 100) return false;
  
  return true;
}

/**
 * Try to fetch a PDF with optional CORS proxy
 */
async function fetchWithProxy(url: string, proxyUrl?: string): Promise<Response> {
  const targetUrl = proxyUrl ? `${proxyUrl}${encodeURIComponent(url)}` : url;
  
  const response = await fetch(targetUrl, {
    mode: 'cors',
    credentials: 'omit',
    headers: {
      'Accept': 'application/pdf, */*',
    },
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }
  
  return response;
}

/**
 * Download PDF from URL with progress tracking
 */
export async function downloadPdf(
  paperId: string,
  pdfUrl: string,
  fileName?: string,
  maxRetries: number = 2
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
  
  let lastError: Error | null = null;
  
  // Try direct fetch first, then CORS proxies
  const fetchAttempts = [
    () => fetchWithProxy(pdfUrl), // Direct fetch
    ...CORS_PROXIES.map(proxy => () => fetchWithProxy(pdfUrl, proxy)),
  ];
  
  for (let attempt = 0; attempt < fetchAttempts.length; attempt++) {
    for (let retry = 0; retry <= maxRetries; retry++) {
      try {
        notifyProgress({
          paperId,
          progress: 5 + (attempt * 20), // Show some progress while trying
          status: 'downloading',
        });
        
        const response = await fetchAttempts[attempt]();
        
        // Get content length for progress tracking
        const contentLength = response.headers.get('Content-Length');
        const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
        
        let blob: Blob;
        
        // Read response as stream if possible for progress tracking
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
              progress: Math.min(progress, 99), // Keep at 99 until saved
              status: 'downloading',
            });
          }
          
          // Combine chunks into blob
          blob = new Blob(chunks, { type: 'application/pdf' });
        } else {
          // Fallback: read entire response at once
          notifyProgress({
            paperId,
            progress: 50,
            status: 'downloading',
          });
          
          blob = await response.blob();
        }
        
        // Validate it's a PDF
        if (!isPdfResponse(blob, pdfUrl)) {
          throw new Error('Downloaded file is not a valid PDF');
        }
        
        // Save to IndexedDB
        const name = fileName || extractFileName(pdfUrl, paperId);
        await pdfStorageService.savePdf(paperId, blob, name, 'api');
        
        notifyProgress({
          paperId,
          progress: 100,
          status: 'completed',
        });
        
        return true;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Download failed');
        console.warn(`PDF download attempt ${attempt + 1}/${fetchAttempts.length}, retry ${retry + 1}/${maxRetries + 1} failed:`, lastError.message);
        
        // If not a network error, don't retry
        if (lastError.message.includes('HTTP error')) {
          break;
        }
        
        // Wait before retrying
        if (retry < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (retry + 1)));
        }
      }
    }
  }
  
  // All attempts failed
  const errorMessage = lastError?.message || 'Download failed after all attempts';
  console.error('PDF download error:', errorMessage);
  
  notifyProgress({
    paperId,
    progress: 0,
    status: 'error',
    error: errorMessage,
  });
  
  return false;
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
