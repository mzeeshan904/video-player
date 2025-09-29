import React, { useState, useEffect, useCallback } from 'react';
import { OfflineManager } from '../utils/offlineManager';
import { DownloadProgress, OfflineVideo, OfflineConfig, VideoQuality, SubtitleTrack } from '../types';

interface DownloadControlsProps {
  videoId: string;
  videoTitle: string;
  videoUrl: string;
  mimeType: string;
  quality?: VideoQuality;
  subtitles?: SubtitleTrack[];
  offlineConfig: OfflineConfig;
  onDownloadStart?: () => void;
  onDownloadComplete?: (offlineVideo: OfflineVideo) => void;
  onDownloadError?: (error: Error) => void;
}

const DownloadControls: React.FC<DownloadControlsProps> = ({
  videoId,
  videoTitle,
  videoUrl,
  mimeType,
  quality,
  subtitles,
  offlineConfig,
  onDownloadStart,
  onDownloadComplete,
  onDownloadError
}) => {
  const [offlineManager] = useState(() => new OfflineManager(offlineConfig));
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [storageInfo, setStorageInfo] = useState<{used: number; quota: number; available: number} | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  // Check if download is supported and if video is already downloaded
  useEffect(() => {
    const checkStatus = async () => {
      setIsSupported(offlineManager.isDownloadSupported());
      
      if (offlineManager.isDownloadSupported()) {
        const existingVideo = await offlineManager.getOfflineVideo(videoId);
        setIsDownloaded(!!existingVideo);
        
        const storage = await offlineManager.getStorageInfo();
        setStorageInfo(storage);
      }
    };

    checkStatus();
  }, [offlineManager, videoId]);

  // Handle download progress
  const handleProgress = useCallback((progress: DownloadProgress) => {
    setDownloadProgress(progress);
    
    if (progress.status === 'completed') {
      setIsDownloaded(true);
      setDownloadProgress(null);
    } else if (progress.status === 'failed' || progress.status === 'cancelled') {
      setDownloadProgress(null);
    }
  }, []);

  // Start download
  const handleDownload = async () => {
    if (!offlineManager.isDownloadSupported()) {
      const error = new Error('Downloads are not supported in this browser');
      onDownloadError?.(error);
      return;
    }

    try {
      onDownloadStart?.();
      
      const offlineVideo = await offlineManager.downloadVideo(
        videoId,
        videoTitle,
        videoUrl,
        mimeType,
        quality,
        subtitles,
        handleProgress
      );
      
      onDownloadComplete?.(offlineVideo);
      
      // Update storage info
      const storage = await offlineManager.getStorageInfo();
      setStorageInfo(storage);
      
    } catch (error) {
      onDownloadError?.(error as Error);
      setDownloadProgress(null);
    }
  };

  // Cancel download
  const handleCancelDownload = () => {
    const cancelled = offlineManager.cancelDownload(videoId);
    if (cancelled) {
      setDownloadProgress(null);
    }
  };

  // Delete downloaded video
  const handleDelete = async () => {
    try {
      await offlineManager.deleteOfflineVideo(videoId);
      setIsDownloaded(false);
      
      // Update storage info
      const storage = await offlineManager.getStorageInfo();
      setStorageInfo(storage);
    } catch (error) {
      onDownloadError?.(error as Error);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Format time remaining
  const formatTimeRemaining = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  if (!isSupported) {
    return (
      <div className="download-controls download-not-supported">
        <span className="download-message">Downloads not supported in this browser</span>
      </div>
    );
  }

  return (
    <div className="download-controls">
      {/* Download Status */}
      {downloadProgress && (
        <div className="download-progress-container">
          <div className="download-progress-bar">
            <div 
              className="download-progress-fill" 
              style={{ width: `${downloadProgress.percentage}%` }}
            />
          </div>
          <div className="download-progress-info">
            <span className="download-percentage">{downloadProgress.percentage}%</span>
            {downloadProgress.speed && downloadProgress.timeRemaining && (
              <span className="download-details">
                {formatFileSize(downloadProgress.speed)}/s • {formatTimeRemaining(downloadProgress.timeRemaining)} remaining
              </span>
            )}
            <button 
              className="download-cancel-btn"
              onClick={handleCancelDownload}
              title="Cancel download"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Download Actions */}
      <div className="download-actions">
        {!isDownloaded && !downloadProgress && (
          <button 
            className="download-btn download-start"
            onClick={handleDownload}
            title="Download for offline viewing"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 15.575c-.2 0-.375-.063-.525-.188L6.7 10.6c-.383-.383-.388-.962-.013-1.337.375-.375.954-.375 1.329 0l3.984 3.984 3.984-3.984c.375-.375.954-.375 1.329 0 .375.375.375.954 0 1.329l-4.775 4.788c-.15.15-.325.225-.538.195Z"/>
              <path d="M12 21c-.275 0-.5-.225-.5-.5v-11c0-.275.225-.5.5-.5s.5.225.5.5v11c0 .275-.225.5-.5.5Z"/>
            </svg>
            Download
          </button>
        )}

        {isDownloaded && (
          <div className="download-downloaded">
            <button 
              className="download-btn download-delete"
              onClick={handleDelete}
              title="Delete downloaded video"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
              Delete
            </button>
            <span className="download-status">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              Downloaded
            </span>
          </div>
        )}
      </div>

      {/* Storage Info */}
      {storageInfo && (
        <div className="download-storage-info">
          <div className="storage-bar">
            <div 
              className="storage-used" 
              style={{ 
                width: storageInfo.quota > 0 ? 
                  `${(storageInfo.used / storageInfo.quota) * 100}%` : '0%' 
              }}
            />
          </div>
          <span className="storage-text">
            {formatFileSize(storageInfo.used * 1024 * 1024)} of {formatFileSize(storageInfo.quota * 1024 * 1024)} used
          </span>
        </div>
      )}
    </div>
  );
};

export default DownloadControls;
