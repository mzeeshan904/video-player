import React, { useRef, useEffect, useState, useCallback } from 'react';

interface ThumbnailPreviewProps {
  videoElement: HTMLVideoElement | null;
  isVisible: boolean;
  hoveredTime: number;
  relativeX: number; // Position relative to seek bar
  seekBarWidth: number;
  duration: number;
}

const ThumbnailPreview: React.FC<ThumbnailPreviewProps> = ({
  videoElement,
  isVisible,
  hoveredTime,
  relativeX,
  seekBarWidth,
  duration
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenVideoRef = useRef<HTMLVideoElement>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const cacheRef = useRef<Map<number, string>>(new Map());
  const activeRequestRef = useRef<number>(0);
  const isMetadataLoadedRef = useRef<boolean>(false);
  const throttledGenerateRef = useRef<NodeJS.Timeout>();
  const pendingTimeRef = useRef<number>(-1);

  // Debug logging disabled for production
  const debug = (message: string, data?: any) => {
    // Disabled for clean console
    // console.log(`🖼️ Thumbnail: ${message}`, data || '');
  };

  // Enhanced cache key generation (0.5 second precision)
  const getCacheKey = (time: number): number => Math.round(time * 2) / 2;

  // Generate thumbnail with proper race condition handling
  const generateThumbnail = useCallback(async (targetTime: number) => {
    if (!videoElement || !canvasRef.current || !hiddenVideoRef.current) {
      debug('Cannot generate thumbnail - missing core dependencies', {
        hasVideo: !!videoElement,
        hasCanvas: !!canvasRef.current,
        hasHiddenVideo: !!hiddenVideoRef.current
      });
      return;
    }

    // Check if we can use main video as fallback
    const sourceVideo = isMetadataLoadedRef.current ? hiddenVideoRef.current : 
                       (videoElement.readyState >= 2 ? videoElement : null);
    
    if (!sourceVideo) {
      debug('❌ No video ready for thumbnail generation', { 
        mainVideoReadyState: videoElement.readyState,
        hiddenVideoReadyState: hiddenVideoRef.current.readyState,
        hiddenVideoSrc: hiddenVideoRef.current.src,
        mainVideoSrc: videoElement.src
      });
      setIsLoading(false);
      return;
    }
    
    debug('Using video for thumbnail', { 
      usingHidden: sourceVideo === hiddenVideoRef.current,
      videoSrc: sourceVideo.src,
      readyState: sourceVideo.readyState 
    });
    
    const requestId = Date.now();
    activeRequestRef.current = requestId;
    
    debug('Generating thumbnail', { targetTime, requestId });
    
    // Check cache first
    const cacheKey = getCacheKey(targetTime);
    if (cacheRef.current.has(cacheKey)) {
      debug('Using cached thumbnail', { cacheKey });
      setThumbnailUrl(cacheRef.current.get(cacheKey)!);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        debug('No canvas context available');
        return;
      }

      // Set canvas dimensions based on video aspect ratio
      const aspectRatio = sourceVideo.videoWidth / sourceVideo.videoHeight || 16/9;
      canvas.width = 160;
      canvas.height = Math.round(160 / aspectRatio);

      debug('Canvas dimensions set', { width: canvas.width, height: canvas.height, aspectRatio });

      // Clamp target time to valid range
      const clampedTime = Math.max(0, Math.min(targetTime, duration - 0.1));
      
      debug('Seeking to time', { targetTime, clampedTime, currentTime: sourceVideo.currentTime });

      // Only seek if it's the hidden video (don't interfere with main video)
      if (sourceVideo === hiddenVideoRef.current) {
        // Set up seek promise
        const seekPromise = new Promise<void>((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            debug('Seek timeout');
            reject(new Error('Seek timeout'));
          }, 1000);

          const onSeeked = () => {
            debug('Seek completed', { currentTime: sourceVideo.currentTime, requestId });
            clearTimeout(timeoutId);
            sourceVideo.removeEventListener('seeked', onSeeked);
            sourceVideo.removeEventListener('error', onError);
            resolve();
          };

          const onError = (event: Event) => {
            debug('Seek error', event);
            clearTimeout(timeoutId);
            sourceVideo.removeEventListener('seeked', onSeeked);
            sourceVideo.removeEventListener('error', onError);
            reject(new Error('Seek failed'));
          };

          sourceVideo.addEventListener('seeked', onSeeked);
          sourceVideo.addEventListener('error', onError);
        });

        // Perform seek
        sourceVideo.currentTime = clampedTime;

        // Wait for seek to complete
        await seekPromise;
      } else {
        debug('Using main video at current time', { currentTime: sourceVideo.currentTime });
      }

      // Check if this request is still active (race condition protection)
      if (activeRequestRef.current !== requestId) {
        debug('Request cancelled - newer request active', { requestId, activeRequest: activeRequestRef.current });
        return;
      }

      debug('Drawing frame to canvas', { currentTime: sourceVideo.currentTime });

      // Draw frame to canvas
      ctx.drawImage(sourceVideo, 0, 0, canvas.width, canvas.height);
      
      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      
      // Cache the result
      cacheRef.current.set(cacheKey, dataUrl);
      
      debug('Thumbnail generated and cached', { cacheKey, dataUrlLength: dataUrl.length });
      
      // Clean cache if it gets too large (keep last 30 thumbnails)
      if (cacheRef.current.size > 30) {
        const keys = Array.from(cacheRef.current.keys()).sort((a, b) => Number(a) - Number(b));
        keys.slice(0, -30).forEach(key => cacheRef.current.delete(key));
        debug('Cache cleaned', { remainingItems: cacheRef.current.size });
      }
      
      // Only update if this request is still active
      if (activeRequestRef.current === requestId) {
        setThumbnailUrl(dataUrl);
        debug('Thumbnail URL set');
      }
    } catch (error) {
      debug('Failed to generate thumbnail', error);
      if (activeRequestRef.current === requestId) {
        setThumbnailUrl('');
      }
    } finally {
      if (activeRequestRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, [videoElement, duration]);

  // Initialize hidden video - ENSURE SOURCE IS SET
  useEffect(() => {
    const hiddenVideo = hiddenVideoRef.current;
    if (!videoElement || !hiddenVideo) {
      debug('Missing video elements', { hasVideoElement: !!videoElement, hasHiddenVideo: !!hiddenVideo });
      return;
    }

    if (!videoElement.src) {
      debug('Main video has no source yet', { src: videoElement.src });
      return;
    }

    debug('Initializing hidden video', { 
      mainVideoSrc: videoElement.src,
      mainVideoReadyState: videoElement.readyState,
      hiddenVideoSrc: hiddenVideo.src 
    });

    // FORCE set the source
    hiddenVideo.src = videoElement.src;
    hiddenVideo.preload = 'metadata';
    hiddenVideo.muted = true;
    hiddenVideo.crossOrigin = videoElement.crossOrigin || 'anonymous';
    
    // Verify source was set
    debug('Source set to hidden video', { 
      hiddenVideoSrc: hiddenVideo.src,
      matches: hiddenVideo.src === videoElement.src 
    });
    
    // Reset metadata state
    isMetadataLoadedRef.current = false;

    const onMetadataLoaded = () => {
      debug('✅ Hidden video metadata loaded!', {
        duration: hiddenVideo.duration,
        videoWidth: hiddenVideo.videoWidth,
        videoHeight: hiddenVideo.videoHeight,
        readyState: hiddenVideo.readyState
      });
      isMetadataLoadedRef.current = true;
    };

    const onCanPlay = () => {
      debug('✅ Hidden video can play - ready for thumbnails');
      isMetadataLoadedRef.current = true;
    };

    const onError = (e: Event) => {
      debug('❌ Hidden video error', {
        error: e,
        networkState: hiddenVideo.networkState,
        readyState: hiddenVideo.readyState
      });
      isMetadataLoadedRef.current = false;
    };

    // Add event listeners BEFORE loading
    hiddenVideo.addEventListener('loadedmetadata', onMetadataLoaded);
    hiddenVideo.addEventListener('canplay', onCanPlay);
    hiddenVideo.addEventListener('error', onError);

    // Force load
    hiddenVideo.load();

    return () => {
      hiddenVideo.removeEventListener('loadedmetadata', onMetadataLoaded);
      hiddenVideo.removeEventListener('canplay', onCanPlay);
      hiddenVideo.removeEventListener('error', onError);
    };
  }, [videoElement, videoElement?.src]);

  // Throttled thumbnail generation with final update guarantee
  useEffect(() => {
    if (!isVisible || hoveredTime <= 0) {
      // Clear any pending generation when not visible or invalid time
      if (throttledGenerateRef.current) {
        clearTimeout(throttledGenerateRef.current);
        throttledGenerateRef.current = undefined;
      }
      pendingTimeRef.current = -1;
      setIsLoading(false);
      setThumbnailUrl(''); // Clear thumbnail when not visible
      return;
    }

    debug('Hover time changed', { hoveredTime, isVisible });

    // Store the latest time
    pendingTimeRef.current = hoveredTime;

    // Clear existing timeout
    if (throttledGenerateRef.current) {
      clearTimeout(throttledGenerateRef.current);
    }

    // Check cache immediately for instant response
    const cacheKey = getCacheKey(hoveredTime);
    if (cacheRef.current.has(cacheKey)) {
      debug('Using cached thumbnail immediately', { cacheKey });
      setThumbnailUrl(cacheRef.current.get(cacheKey)!);
      setIsLoading(false);
      return;
    }

    // If metadata not loaded, show loading immediately
    if (!isMetadataLoadedRef.current) {
      debug('Metadata not ready, showing loading state');
      setIsLoading(true);
      setThumbnailUrl('');
    }

    // Set new timeout for throttled generation
    throttledGenerateRef.current = setTimeout(() => {
      const timeToGenerate = pendingTimeRef.current;
      if (timeToGenerate > 0) { // Only generate for valid times
        debug('Executing throttled generation', { timeToGenerate });
        generateThumbnail(timeToGenerate);
      }
      throttledGenerateRef.current = undefined;
    }, 80); // 80ms throttle

    return () => {
      if (throttledGenerateRef.current) {
        clearTimeout(throttledGenerateRef.current);
      }
    };
  }, [isVisible, hoveredTime, generateThumbnail]);

  // Calculate positioning only when visible and valid
  const previewWidth = 160;
  const previewHeight = Math.round(160 / (16/9));
  
  let leftOffset = 10; // Default safe position
  
  // Only calculate position when actually visible and valid
  if (isVisible && seekBarWidth > 0 && hoveredTime > 0) {
    // Center on cursor but clamp to container bounds
    leftOffset = relativeX - previewWidth / 2;
    
    // Edge handling
    const margin = 10;
    if (leftOffset < margin) {
      leftOffset = margin;
    } else if (leftOffset + previewWidth > seekBarWidth - margin) {
      leftOffset = seekBarWidth - previewWidth - margin;
    }
    
    // Only log when actually calculating meaningful positions
    debug('Position calculated', { 
      relativeX, 
      seekBarWidth, 
      previewWidth, 
      leftOffset,
      hoveredTime 
    });
  }

  // Format time for display
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Hidden video for thumbnail generation */}
      <video
        ref={hiddenVideoRef}
        style={{ display: 'none' }}
        muted
        playsInline
        preload="auto"
        crossOrigin="anonymous"
      />
      
      {/* Hidden canvas for frame extraction */}
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
      />
      
      {/* Thumbnail preview container */}
      <div
        className="thumbnail-preview"
        style={{
          left: `${leftOffset}px`,
          bottom: '50px',
        }}
      >
        <div className="thumbnail-container">
          {isLoading ? (
            <div className="thumbnail-loading">
              <div className="loading-spinner"></div>
              <div className="debug-text">Loading...</div>
            </div>
          ) : thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={`Preview at ${formatTime(hoveredTime)}`}
              className="thumbnail-image"
            />
          ) : (
            <div className="thumbnail-placeholder">
              <span>Preview</span>
              <div className="debug-text">Waiting for metadata...</div>
            </div>
          )}
          
          <div className="thumbnail-time">
            {formatTime(hoveredTime)}
          </div>
        </div>
      </div>
    </>
  );
};

export default ThumbnailPreview;