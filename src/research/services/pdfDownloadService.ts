/**
 * PDF Download Service
 * Fetches PDFs from various sources for view-only display (not stored locally)
 */

// Removed: import { pdfStorageService } from './pdfStorageService';
// PDFs are no longer stored locally - only viewed

export interface DownloadProgress {
  paperId: string;
  progress: number; // 0-100
  status: 'pending' | 'downloading' | 'completed' | 'error';
  error?: string;
  statusMessage?: string; // Human-readable status message (e.g., "Connecting...", "Trying alternative server...")
  attemptNumber?: number; // Current attempt number
  totalAttempts?: number; // Total number of attempts that will be made
}

// CORS proxies to try in order
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
];

// Track active downloads with timestamps to detect stale downloads
interface ActiveDownload extends DownloadProgress {
  startedAt: number;
}
const activeDownloads = new Map<string, ActiveDownload>();
const downloadListeners = new Set<(progress: DownloadProgress) => void>();

// Timeout for stale downloads (30 seconds)
const STALE_DOWNLOAD_TIMEOUT_MS = 30000;

// Cache for successfully downloaded PDF object URLs
const pdfCache = new Map<string, string>();

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
  const activeDownload: ActiveDownload = {
    ...progress,
    startedAt: activeDownloads.get(progress.paperId)?.startedAt || Date.now(),
  };
  activeDownloads.set(progress.paperId, activeDownload);
  downloadListeners.forEach(cb => cb(progress));
}

/**
 * Check if a download is stale (stuck for too long)
 */
function isDownloadStale(paperId: string): boolean {
  const download = activeDownloads.get(paperId);
  if (!download || download.status !== 'downloading') {
    return false;
  }
  return Date.now() - download.startedAt > STALE_DOWNLOAD_TIMEOUT_MS;
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
 * Fetch PDF from URL and return a temporary object URL for viewing
 * PDFs are NOT stored locally - they are fetched fresh each time
 * @param paperId - Paper ID
 * @param pdfUrl - URL to fetch PDF from
 * @param _fileName - Unused (for API compatibility)
 * @param maxRetries - Max retries per proxy attempt
 * @param forceRefresh - Force a new download even if cached or in progress
 * @returns Object URL for the PDF blob, or null if fetch failed
 */
export async function downloadPdf(
  paperId: string,
  pdfUrl: string,
  _fileName?: string,
  maxRetries: number = 1,
  forceRefresh: boolean = false
): Promise<string | null> {
  console.log('[pdfDownloadService] Fetching PDF for viewing, paperId:', paperId, 'from:', pdfUrl);
  
  // Check cache first (unless forcing refresh)
  if (!forceRefresh) {
    const cachedUrl = pdfCache.get(paperId);
    if (cachedUrl) {
      console.log('[pdfDownloadService] Returning cached PDF for paperId:', paperId);
      notifyProgress({
        paperId,
        progress: 100,
        status: 'completed',
        statusMessage: 'Loaded from cache',
      });
      return cachedUrl;
    }
  }
  
  // Check if already downloading (unless stale or forcing)
  const existing = activeDownloads.get(paperId);
  if (existing && existing.status === 'downloading') {
    if (!forceRefresh && !isDownloadStale(paperId)) {
      console.log('[pdfDownloadService] Fetch already in progress for paperId:', paperId);
      return null;
    }
    // Clear stale download
    console.log('[pdfDownloadService] Clearing stale download for paperId:', paperId);
    activeDownloads.delete(paperId);
  }
  
  // Calculate total attempts for progress reporting
  const totalAttempts = (1 + CORS_PROXIES.length) * (maxRetries + 1);
  
  notifyProgress({
    paperId,
    progress: 0,
    status: 'downloading',
    statusMessage: 'Connecting to server...',
    attemptNumber: 1,
    totalAttempts,
  });
  
  let lastError: Error | null = null;
  let currentAttemptCount = 0;
  
  // Try direct fetch first, then CORS proxies
  const fetchAttempts: { fn: () => Promise<Response>; name: string }[] = [
    { fn: () => fetchWithProxy(pdfUrl), name: 'Direct' },
    ...CORS_PROXIES.map((proxy, i) => ({
      fn: () => fetchWithProxy(pdfUrl, proxy),
      name: `Proxy ${i + 1}`,
    })),
  ];
  
  for (let attempt = 0; attempt < fetchAttempts.length; attempt++) {
    const { fn: fetchFn, name: attemptName } = fetchAttempts[attempt];
    
    for (let retry = 0; retry <= maxRetries; retry++) {
      currentAttemptCount++;
      const statusMessage = retry === 0 
        ? `${attemptName}: Connecting...`
        : `${attemptName}: Retry ${retry}...`;
        
      try {
        notifyProgress({
          paperId,
          progress: Math.min(5 + (currentAttemptCount * 15), 80),
          status: 'downloading',
          statusMessage,
          attemptNumber: currentAttemptCount,
          totalAttempts,
        });
        
        const response = await fetchFn();
        
        // Get content length for progress tracking
        const contentLength = response.headers.get('Content-Length');
        const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
        
        let blob: Blob;
        
        // Read response as stream if possible for progress tracking
        if (response.body && totalBytes > 0) {
          const reader = response.body.getReader();
          const chunks: BlobPart[] = [];
          let receivedBytes = 0;
          
          notifyProgress({
            paperId,
            progress: 80,
            status: 'downloading',
            statusMessage: 'Downloading PDF...',
            attemptNumber: currentAttemptCount,
            totalAttempts,
          });
          
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) break;
            
            chunks.push(value as BlobPart);
            receivedBytes += value.length;
            
            const progress = 80 + Math.round((receivedBytes / totalBytes) * 19); // 80-99%
            notifyProgress({
              paperId,
              progress: Math.min(progress, 99),
              status: 'downloading',
              statusMessage: `Downloading... ${Math.round((receivedBytes / totalBytes) * 100)}%`,
              attemptNumber: currentAttemptCount,
              totalAttempts,
            });
          }
          
          // Combine chunks into blob
          blob = new Blob(chunks, { type: 'application/pdf' });
        } else {
          // Fallback: read entire response at once
          notifyProgress({
            paperId,
            progress: 85,
            status: 'downloading',
            statusMessage: 'Downloading PDF...',
            attemptNumber: currentAttemptCount,
            totalAttempts,
          });
          
          blob = await response.blob();
        }
        
        // Validate it's a PDF
        if (!isPdfResponse(blob, pdfUrl)) {
          throw new Error('Downloaded file is not a valid PDF');
        }
        
        // Create object URL for viewing (not stored locally)
        const objectUrl = URL.createObjectURL(blob);
        
        // Cache the PDF URL
        pdfCache.set(paperId, objectUrl);
        
        console.log('[pdfDownloadService] PDF fetched successfully for viewing, paperId:', paperId);
        notifyProgress({
          paperId,
          progress: 100,
          status: 'completed',
          statusMessage: 'PDF loaded successfully',
        });
        
        return objectUrl;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Fetch failed');
        console.warn(`[pdfDownloadService] PDF fetch attempt ${currentAttemptCount}/${totalAttempts} failed:`, lastError.message);
        
        // If not a network error, don't retry this proxy
        if (lastError.message.includes('HTTP error')) {
          break;
        }
        
        // Wait before retrying (reduced from 1000ms to 500ms for faster feedback)
        if (retry < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 500 * (retry + 1)));
        }
      }
    }
  }
  
  // All attempts failed
  const errorMessage = lastError?.message || 'Failed to load PDF after all attempts';
  console.error('[pdfDownloadService] PDF fetch failed for paperId:', paperId, 'error:', errorMessage);
  
  notifyProgress({
    paperId,
    progress: 0,
    status: 'error',
    error: errorMessage,
    statusMessage: 'Failed to load PDF. Click retry to try again.',
  });
  
  return null;
}

/**
 * Process uploaded PDF file and return object URL for viewing
 * Note: Uploaded PDFs are NOT stored locally - they exist only for the current session
 * If the user refreshes or closes, they will need to re-upload the PDF
 * @returns Object URL for the PDF blob, or null if processing failed
 */
export async function uploadPdf(
  paperId: string,
  file: File
): Promise<string | null> {
  try {
    // Validate file type
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error('File is not a PDF');
    }
    
    // Read file as ArrayBuffer first to ensure it's valid
    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
    
    // Create object URL for viewing (not stored locally)
    const objectUrl = URL.createObjectURL(blob);
    
    notifyProgress({
      paperId,
      progress: 100,
      status: 'completed',
    });
    
    return objectUrl;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';
    console.error('PDF upload error:', error);
    
    notifyProgress({
      paperId,
      progress: 0,
      status: 'error',
      error: errorMessage,
    });
    
    return null;
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
      statusMessage: 'Download cancelled',
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
 * Get cached PDF URL for a paper (if available)
 */
export function getCachedPdfUrl(paperId: string): string | null {
  return pdfCache.get(paperId) || null;
}

/**
 * Clear cached PDF URL for a paper
 */
export function clearCachedPdf(paperId: string): void {
  const cachedUrl = pdfCache.get(paperId);
  if (cachedUrl) {
    URL.revokeObjectURL(cachedUrl);
    pdfCache.delete(paperId);
  }
}

/**
 * @deprecated No longer used - PDF blobs are not stored locally
 * Create object URL for PDF blob
 */
export async function getPdfObjectUrl(_paperId: string): Promise<string | null> {
  console.log('[pdfDownloadService] getPdfObjectUrl is deprecated - use downloadPdf() which returns object URL directly');
  return null;
}

/**
 * Revoke object URL when done
 */
export function revokePdfObjectUrl(url: string): void {
  // Remove from cache if it's a cached URL
  for (const [paperId, cachedUrl] of pdfCache.entries()) {
    if (cachedUrl === url) {
      pdfCache.delete(paperId);
      break;
    }
  }
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
  getCachedPdfUrl,
  clearCachedPdf,
};
