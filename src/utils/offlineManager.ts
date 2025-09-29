import { 
  OfflineConfig, 
  OfflineVideo, 
  OfflineSubtitle, 
  DownloadProgress, 
  OfflineStorage,
  VideoQuality,
  SubtitleTrack 
} from '../types';

export class OfflineManager {
  private config: OfflineConfig;
  private dbName = 'MediaPlayerOfflineDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private downloadCallbacks: Map<string, (progress: DownloadProgress) => void> = new Map();
  private activeDownloads: Map<string, AbortController> = new Map();

  constructor(config: OfflineConfig) {
    this.config = config;
    this.initDB();
  }

  // Initialize IndexedDB
  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create videos store
        if (!db.objectStoreNames.contains('videos')) {
          const videoStore = db.createObjectStore('videos', { keyPath: 'id' });
          videoStore.createIndex('downloadedAt', 'downloadedAt', { unique: false });
          videoStore.createIndex('expiresAt', 'expiresAt', { unique: false });
        }

        // Create video blobs store
        if (!db.objectStoreNames.contains('videoBlobs')) {
          db.createObjectStore('videoBlobs', { keyPath: 'id' });
        }

        // Create storage info store
        if (!db.objectStoreNames.contains('storageInfo')) {
          db.createObjectStore('storageInfo', { keyPath: 'id' });
        }
      };
    });
  }

  // Check if download is supported
  public isDownloadSupported(): boolean {
    return 'indexedDB' in window && 'fetch' in window && 'AbortController' in window;
  }

  // Check storage quota
  public async getStorageInfo(): Promise<{ used: number; quota: number; available: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const used = estimate.usage || 0;
      const quota = estimate.quota || 0;
      return {
        used: Math.round(used / (1024 * 1024)), // MB
        quota: Math.round(quota / (1024 * 1024)), // MB
        available: Math.round((quota - used) / (1024 * 1024)) // MB
      };
    }
    return { used: 0, quota: 0, available: 0 };
  }

  // Check if network allows download
  private async checkNetworkConditions(): Promise<boolean> {
    if (!this.config.allowMeteredConnection && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection && connection.effectiveType && 
          ['slow-2g', '2g'].includes(connection.effectiveType)) {
        return false;
      }
    }
    return true;
  }

  // Download video with progress tracking
  public async downloadVideo(
    videoId: string,
    title: string,
    url: string,
    mimeType: string,
    quality?: VideoQuality,
    subtitles?: SubtitleTrack[],
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<OfflineVideo> {
    
    if (!this.isDownloadSupported()) {
      throw new Error('Offline downloads are not supported in this browser');
    }

    if (!await this.checkNetworkConditions()) {
      throw new Error('Network conditions do not allow downloads');
    }

    // Check if already downloading
    if (this.activeDownloads.has(videoId)) {
      throw new Error('Video is already being downloaded');
    }

    // Check if already downloaded
    const existing = await this.getOfflineVideo(videoId);
    if (existing) {
      throw new Error('Video is already downloaded');
    }

    // Check storage limits
    await this.enforceStorageLimits();

    const abortController = new AbortController();
    this.activeDownloads.set(videoId, abortController);

    if (onProgress) {
      this.downloadCallbacks.set(videoId, onProgress);
    }

    try {
      // Start download
      const startTime = Date.now();
      const response = await fetch(url, { 
        signal: abortController.signal,
        headers: {
          'Range': 'bytes=0-' // Support resume if server supports it
        }
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }

      const contentLength = parseInt(response.headers.get('content-length') || '0');
      
      // Check file size limit
      if (this.config.maxFileSize && contentLength > this.config.maxFileSize * 1024 * 1024) {
        throw new Error(`File size exceeds limit of ${this.config.maxFileSize}MB`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Unable to read response stream');
      }

      const chunks: Uint8Array[] = [];
      let downloadedBytes = 0;

      // Progress tracking
      const updateProgress = (loaded: number, total: number) => {
        const percentage = total > 0 ? Math.round((loaded / total) * 100) : 0;
        const elapsed = (Date.now() - startTime) / 1000;
        const speed = elapsed > 0 ? loaded / elapsed : 0;
        const timeRemaining = speed > 0 ? (total - loaded) / speed : 0;

        const progress: DownloadProgress = {
          videoId,
          loaded,
          total,
          percentage,
          speed,
          timeRemaining,
          status: 'downloading'
        };

        if (onProgress) {
          onProgress(progress);
        }
      };

      // Read stream
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        downloadedBytes += value.length;
        updateProgress(downloadedBytes, contentLength);
      }

      // Combine chunks into blob
      const videoBlob = new Blob(chunks, { type: mimeType });
      const videoUrl = URL.createObjectURL(videoBlob);

      // Download subtitles
      const offlineSubtitles: OfflineSubtitle[] = [];
      if (subtitles) {
        for (const subtitle of subtitles) {
          try {
            const subResponse = await fetch(subtitle.url);
            const subContent = await subResponse.text();
            offlineSubtitles.push({
              id: subtitle.id,
              label: subtitle.label,
              language: subtitle.language,
              data: subContent
            });
          } catch (error) {
            console.warn(`Failed to download subtitle ${subtitle.label}:`, error);
          }
        }
      }

      // Create offline video object
      const offlineVideo: OfflineVideo = {
        id: videoId,
        title,
        url: videoUrl,
        originalUrl: url,
        mimeType,
        size: videoBlob.size,
        downloadedAt: Date.now(),
        expiresAt: this.config.expiryDays ? 
          Date.now() + (this.config.expiryDays * 24 * 60 * 60 * 1000) : undefined,
        quality,
        subtitles: offlineSubtitles
      };

      // Store in IndexedDB
      await this.storeOfflineVideo(offlineVideo, videoBlob);

      // Final progress update
      if (onProgress) {
        onProgress({
          videoId,
          loaded: downloadedBytes,
          total: contentLength,
          percentage: 100,
          status: 'completed'
        });
      }

      return offlineVideo;

    } catch (error) {
      // Update progress with error
      if (onProgress) {
        onProgress({
          videoId,
          loaded: 0,
          total: 0,
          percentage: 0,
          status: error.name === 'AbortError' ? 'cancelled' : 'failed'
        });
      }
      throw error;
    } finally {
      this.activeDownloads.delete(videoId);
      this.downloadCallbacks.delete(videoId);
    }
  }

  // Cancel download
  public cancelDownload(videoId: string): boolean {
    const controller = this.activeDownloads.get(videoId);
    if (controller) {
      controller.abort();
      return true;
    }
    return false;
  }

  // Store offline video in IndexedDB
  private async storeOfflineVideo(offlineVideo: OfflineVideo, videoBlob: Blob): Promise<void> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['videos', 'videoBlobs', 'storageInfo'], 'readwrite');
      
      transaction.onerror = () => reject(transaction.error);
      transaction.oncomplete = () => resolve();

      // Store video metadata
      const videoStore = transaction.objectStore('videos');
      videoStore.add(offlineVideo);

      // Store video blob
      const blobStore = transaction.objectStore('videoBlobs');
      blobStore.add({ id: offlineVideo.id, blob: videoBlob });

      // Update storage info
      const storageStore = transaction.objectStore('storageInfo');
      const storageRequest = storageStore.get('totalSize');
      
      storageRequest.onsuccess = () => {
        const currentSize = storageRequest.result?.size || 0;
        storageStore.put({
          id: 'totalSize',
          size: currentSize + videoBlob.size,
          lastUpdated: Date.now()
        });
      };
    });
  }

  // Get offline video metadata
  public async getOfflineVideo(videoId: string): Promise<OfflineVideo | null> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['videos'], 'readonly');
      const store = transaction.objectStore('videos');
      const request = store.get(videoId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  // Get offline video blob for playback
  public async getOfflineVideoBlob(videoId: string): Promise<Blob | null> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['videoBlobs'], 'readonly');
      const store = transaction.objectStore('videoBlobs');
      const request = store.get(videoId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.blob : null);
      };
    });
  }

  // Get all offline videos
  public async getAllOfflineVideos(): Promise<OfflineVideo[]> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['videos'], 'readonly');
      const store = transaction.objectStore('videos');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  // Delete offline video
  public async deleteOfflineVideo(videoId: string): Promise<boolean> {
    if (!this.db) await this.initDB();
    
    const offlineVideo = await this.getOfflineVideo(videoId);
    if (!offlineVideo) return false;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['videos', 'videoBlobs', 'storageInfo'], 'readwrite');
      
      transaction.onerror = () => reject(transaction.error);
      transaction.oncomplete = () => {
        // Revoke object URL to free memory
        URL.revokeObjectURL(offlineVideo.url);
        resolve(true);
      };

      // Delete video metadata
      const videoStore = transaction.objectStore('videos');
      videoStore.delete(videoId);

      // Delete video blob
      const blobStore = transaction.objectStore('videoBlobs');
      blobStore.delete(videoId);

      // Update storage info
      const storageStore = transaction.objectStore('storageInfo');
      const storageRequest = storageStore.get('totalSize');
      
      storageRequest.onsuccess = () => {
        const currentSize = storageRequest.result?.size || 0;
        storageStore.put({
          id: 'totalSize',
          size: Math.max(0, currentSize - offlineVideo.size),
          lastUpdated: Date.now()
        });
      };
    });
  }

  // Clean expired videos
  public async cleanupExpiredVideos(): Promise<number> {
    const now = Date.now();
    const allVideos = await this.getAllOfflineVideos();
    let deletedCount = 0;

    for (const video of allVideos) {
      if (video.expiresAt && video.expiresAt < now) {
        await this.deleteOfflineVideo(video.id);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  // Enforce storage limits
  private async enforceStorageLimits(): Promise<void> {
    const allVideos = await this.getAllOfflineVideos();
    
    // Check max downloads limit
    if (this.config.maxDownloads && allVideos.length >= this.config.maxDownloads) {
      // Delete oldest video to make space
      const oldest = allVideos.sort((a, b) => a.downloadedAt - b.downloadedAt)[0];
      if (oldest) {
        await this.deleteOfflineVideo(oldest.id);
      }
    }

    // Check storage quota limit
    if (this.config.storageQuota) {
      const totalSize = allVideos.reduce((sum, video) => sum + video.size, 0);
      const quotaBytes = this.config.storageQuota * 1024 * 1024;
      
      if (totalSize >= quotaBytes) {
        // Delete oldest videos until under quota
        const sortedVideos = allVideos.sort((a, b) => a.downloadedAt - b.downloadedAt);
        let currentSize = totalSize;
        
        for (const video of sortedVideos) {
          if (currentSize < quotaBytes) break;
          await this.deleteOfflineVideo(video.id);
          currentSize -= video.size;
        }
      }
    }
  }

  // Get storage statistics
  public async getStorageStats(): Promise<{
    videoCount: number;
    totalSize: number;
    oldestDownload: number | null;
    newestDownload: number | null;
  }> {
    const allVideos = await this.getAllOfflineVideos();
    
    return {
      videoCount: allVideos.length,
      totalSize: allVideos.reduce((sum, video) => sum + video.size, 0),
      oldestDownload: allVideos.length > 0 ? 
        Math.min(...allVideos.map(v => v.downloadedAt)) : null,
      newestDownload: allVideos.length > 0 ? 
        Math.max(...allVideos.map(v => v.downloadedAt)) : null
    };
  }

  // Check if video is available offline
  public async isVideoAvailableOffline(videoId: string): Promise<boolean> {
    const video = await this.getOfflineVideo(videoId);
    return video !== null;
  }
}
