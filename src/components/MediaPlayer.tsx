import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { PlayerConfig, OfflineVideo, DownloadProgress, EventHooks, Ad } from '../types';
import { usePlayerState } from '../hooks/usePlayerState';
import { useEnhancedPlayerState } from '../hooks/useEnhancedPlayerState';
import { usePictureInPicture } from '../hooks/usePictureInPicture';
import { DRMManager } from '../utils/drmManager';
import { AdManager } from '../utils/adManager';
import { StreamingManager } from '../utils/streamingManager';
import { OfflineManager } from '../utils/offlineManager';
import PlayerControls from './PlayerControls';
import AdOverlay from './AdOverlay';
import InteractiveAdOverlay from './InteractiveAdOverlay';
import ReplayOverlay from './ReplayOverlay';
import SettingsMenu from './SettingsMenu';
import SubtitleOverlay from './SubtitleOverlay';
import ThumbnailPreview from './ThumbnailPreview';
import DownloadControls from './DownloadControls';
import './MediaPlayer.css';

interface MediaPlayerProps {
  config: PlayerConfig;
}

const MediaPlayer: React.FC<MediaPlayerProps> = ({ config }) => {
  // Enhanced DASH/HLS handling with proper error management
  const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  const isPageRefresh = performance.navigation?.type === 1 || navigationEntry?.type === 'reload';
  
  // Intelligently detect and configure content type
  const fixedConfig = { ...config };
  
  if (fixedConfig.src.url.includes('.mpd')) {
    fixedConfig.src.mimeType = 'application/dash+xml';
  } else if (fixedConfig.src.url.includes('.m3u8')) {
    fixedConfig.src.mimeType = 'application/x-mpegURL';
  } else {
    fixedConfig.src.mimeType = fixedConfig.src.mimeType || 'video/mp4';
  }
  
  config = fixedConfig;
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const drmManagerRef = useRef<DRMManager>();
  const adManagerRef = useRef<AdManager>();
  const streamingManagerRef = useRef<StreamingManager>();
  const offlineManagerRef = useRef<OfflineManager>();
  const isInitializedRef = useRef<boolean>(false);
  const resumeTimeRef = useRef<number>(0);
  
  // CRITICAL: Guard against concurrent handleEnded execution
  const handleEndedInProgressRef = useRef<boolean>(false);
  
  // CRITICAL: AbortController for event listener cleanup
  const transitionAbortControllerRef = useRef<AbortController | null>(null);
  
  // CRITICAL: Track current format to avoid string-based detection issues
  const currentFormatRef = useRef<'mp4' | 'dash' | 'hls' | null>(null);
  
  // CRITICAL: Cooldown to prevent immediate mid-roll re-trigger after resume
  const resumeCooldownUntilRef = useRef<number>(0);
  
  // CRITICAL: Position-based guard to prevent mid-roll re-trigger until video advances past resume point
  const resumeGuardUntilPositionRef = useRef<number | null>(null);
  const lastResumeTargetRef = useRef<number>(0);
  
  // CRITICAL: Synchronous blocking flag for StreamingManager initialization during ads
  // This ref provides immediate (non-async) blocking to prevent DASH/HLS init during MP4 ads
  // React state updates are async, but refs are synchronous - this prevents timing races
  const blockStreamingInitRef = useRef<boolean>(false);
  
  // CRITICAL: Ad chain management for consecutive mid-rolls at the same playAt time
  // Prevents content from resuming between chained ads (e.g., two ads at 25s)
  const adChainActiveRef = useRef<boolean>(false);
  const adChainIndexRef = useRef<number>(0);
  const midrollQueueRef = useRef<Map<number, Ad[]>>(new Map());
  const seekAfterChainRef = useRef<number>(0);
  
  // CRITICAL: Normalize URLs to avoid absolute vs relative mismatches
  const normalizeUrl = useCallback((u?: string): string => {
    if (!u) return '';
    try { 
      return new URL(u, window.location.href).href; 
    } catch { 
      return u || ''; 
    }
  }, []);
  // Use enhanced analytics if configured, otherwise use standard analytics
  const useEnhanced = config.analytics?.enhancedAnalytics === true;
  const standardHook = usePlayerState(useEnhanced ? undefined : config.analytics?.onEvent);
  const enhancedHook = useEnhancedPlayerState(config, useEnhanced ? config.analytics?.onEvent : undefined);
  
  const { state, updateState, trackEvent, enhancedTracking } = useEnhanced ? enhancedHook : { ...standardHook, enhancedTracking: null };
  const { isPiPSupported, isPiPActive, togglePiP } = usePictureInPicture(videoRef);
  
  // Thumbnail preview state
  const [thumbnailState, setThumbnailState] = useState({
    isVisible: false,
    hoveredTime: 0,
    relativeX: 0,
    seekBarWidth: 0
  });

  // Offline state management
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [showDownloadOverlay, setShowDownloadOverlay] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);

  // Helper function to safely call event hooks
  const callEventHook = useCallback((hookName: keyof EventHooks, ...args: any[]) => {
    if (config.events && config.events[hookName]) {
      try {
        config.events[hookName]!(...args);
      } catch (error) {
        console.error(`Event hook ${hookName} failed:`, error);
      }
    }
  }, [config.events]);

  // Helper function to update analytics manager context
  const updateAnalyticsContext = useCallback((type: 'ad' | 'content', data?: any) => {
    if (enhancedTracking?.getAnalyticsManager()) {
      const manager = enhancedTracking.getAnalyticsManager();
      if (type === 'ad' && data?.id) {
        manager!.setCurrentAd(data.id);
      } else if (type === 'content') {
        manager!.setCurrentContent();
      }
    }
  }, [enhancedTracking]);

  // Helper function to safely switch video sources with COMPLETE MediaSource cleanup
  type LoadIntent = 'ad' | 'content' | undefined;
  const switchVideoSource = useCallback(
    async (newSrc: string, mimeType?: string, skipStaleStateCheck = false, force = false, intent: LoadIntent = undefined) => {
    const video = videoRef.current;
    if (!video) return;

    // CRITICAL: Normalize URLs to avoid absolute vs relative mismatches
    const normalizedNew = normalizeUrl(newSrc);
    const normalizedConfig = normalizeUrl(config.src.url);
    
    // CRITICAL: Detect content type using normalized URLs
    const isMainContentByType = normalizedNew.includes('.mpd') || 
                         normalizedNew.includes('.m3u8') || 
                         normalizedNew === normalizedConfig;
    
    // 🔑 Explicit intent wins; otherwise fall back to URL/type detection
    // This prevents misclassification when phase hasn't updated yet
    const isMainContent = intent ? intent === 'content' : isMainContentByType;
    const isAd = intent ? intent === 'ad' : !isMainContent;
    
    // CRITICAL: Detect format switching using currentFormatRef (more reliable than video.src)
    const currentIsStreaming = currentFormatRef.current === 'dash' || currentFormatRef.current === 'hls';
    const newIsStreaming = normalizedNew.includes('.mpd') || normalizedNew.includes('.m3u8');
    const isFormatSwitch = currentIsStreaming !== newIsStreaming;
    
    const isTransitionToContent = isMainContent && state.playbackPhase !== 'content';
    const isTransitionToAd = isAd && (state.playbackPhase === 'content' || !state.currentAd);

    console.log('🔄 SWITCHING VIDEO SOURCE:', { 
      from: video.src || 'none', 
      to: newSrc, 
      mimeType,
      intent,
      currentPhase: state.playbackPhase,
      hasCurrentAd: !!state.currentAd,
      isMainContent,
      isAd,
      isFormatSwitch,
      currentIsStreaming,
      newIsStreaming,
      isTransitionToContent,
      isTransitionToAd,
      timestamp: new Date().toISOString()
    });
    
    // CRITICAL: ABSOLUTE BLOCKING GUARD - Prevent DASH/HLS load while ad is active
    // ONLY check synchronous ref (not async state.currentAd) because:
    // 1. We clear blockStreamingInitRef.current = false FIRST (immediate)
    // 2. Then updateState({ currentAd: null }) (async, delayed)
    // 3. Then switchVideoSource runs (would see stale state.currentAd)
    // So we MUST only check the ref, which is always up-to-date
    // 
    // EXCEPTION: `force=true` bypasses this guard for explicit resume calls
    // to prevent race conditions where the ref is momentarily true
    if (isMainContent && blockStreamingInitRef.current && !force) {
      console.warn('🚫 BLOCKING main content load during active ad:', {
        blockingRefActive: blockStreamingInitRef.current,
        attemptedSrc: newSrc,
        force
      });
      console.warn('🚫 Main content will load AFTER ad completes - aborting this load');
      return; // CRITICAL: Prevent DASH initialization until ad finishes
    }
    
    if (force && blockStreamingInitRef.current) {
      console.log('⚡ FORCED content load - bypassing block guard (explicit resume)', {
        blockingRefWas: blockStreamingInitRef.current,
        reason: 'Mid-roll resume with force=true'
      });
    }
    
    // CRITICAL: Validate we're not loading ad as main content
    if (isAd && state.playbackPhase === 'content' && !state.currentAd) {
      console.warn('⚠️ Loading MP4 during content phase - this might be incorrect');
    }
    
    if (isTransitionToContent) {
      console.log('🎬 CRITICAL TRANSITION: Ad (MP4) → Main Content (DASH/HLS)');
      console.log('🔄 Full MSE pipeline reset required');
    } else if (isTransitionToAd) {
      console.log('📺 CRITICAL TRANSITION: Main Content (DASH/HLS) → Ad (MP4)');
      console.log('🔄 Full MSE pipeline reset required');
    }
    
    if (isFormatSwitch) {
      console.log('⚠️ FORMAT SWITCH DETECTED: MP4 ↔ DASH/HLS - Extended cleanup');
    }

    try {
      // CRITICAL: Complete MediaSource cleanup to prevent SourceBuffer conflicts
      
      // 1. Pause video immediately
      video.pause();
      
      // 2. CRITICAL: Destroy streaming manager completely and set to undefined
      //    This ensures clean recreation for format switches
      if (streamingManagerRef.current) {
        console.log('🧹 DESTROYING STREAMING MANAGER (dash.js/hls.js + SourceBuffers)');
        
        // CRITICAL: Set to IDLE before cleanup to stop all operations
        streamingManagerRef.current.setPlaybackState('IDLE');
        
        await streamingManagerRef.current.cleanup(); // Destroy dash/hls instances
        streamingManagerRef.current = undefined; // Clear ref for recreation
        console.log('✅ Streaming manager destroyed');
      }

      // 3. Force complete MediaSource reset
      console.log('🔄 RESETTING MEDIASOURCE');
      video.pause(); // Ensure paused
      video.src = ''; // Clear src (more reliable than removeAttribute)
      if (video.srcObject) {
        video.srcObject = null;
      }
      video.load(); // This completely resets MediaSource and all SourceBuffers
      
      // 4. Wait for complete reset with extended delay for format switches
      // This is critical to prevent "SourceBuffer removed" errors during transitions
      const cleanupDelay = isFormatSwitch ? 350 : 150;
      console.log(`⏳ Waiting ${cleanupDelay}ms for buffer operations to settle...`, {
        isFormatSwitch,
        currentFormat: currentFormatRef.current,
        newFormat: newIsStreaming ? (normalizedNew.includes('.mpd') ? 'dash' : 'hls') : 'mp4',
        reason: isFormatSwitch ? 'Format switch MP4↔DASH/HLS' : 'Standard cleanup'
      });
      await new Promise(resolve => setTimeout(resolve, cleanupDelay));

      // 5. Detect content type and set proper MIME type
      let detectedMimeType = mimeType;
      if (!detectedMimeType) {
        if (newSrc.includes('.mpd')) {
          detectedMimeType = 'application/dash+xml';
        } else if (newSrc.includes('.m3u8')) {
          detectedMimeType = 'application/x-mpegURL';
        } else {
          detectedMimeType = 'video/mp4';
        }
      }

      console.log('🎯 LOADING NEW SOURCE:', { url: newSrc, mimeType: detectedMimeType });

      // 6. CRITICAL: Load new source with deterministic StreamingManager lifecycle
      const isStreamingEnabled = config.streaming?.enabled !== false;
      
      if (newIsStreaming && isStreamingEnabled) {
        // CRITICAL: Streaming content - ensure StreamingManager exists
        console.log('🎬 Loading streaming content (DASH/HLS)');
        
        if (!streamingManagerRef.current) {
          console.log('🔧 Creating new StreamingManager instance');
          // Create new streaming manager with error handler
          const handleStreamingErrorForSwitch = (error: any) => {
            console.log('🔧 Streaming error during source switch:', error);
            if (error.type === 'streaming_fatal') {
              console.error('❌ Fatal streaming error during switch:', error);
            }
          };
          streamingManagerRef.current = new StreamingManager(video, handleStreamingErrorForSwitch);
        }
        
        // CRITICAL: Set state to CONTENT before loading
        if (isMainContent) {
          console.log('🎬 Setting StreamingManager state: CONTENT');
          streamingManagerRef.current.setPlaybackState('CONTENT');
          
          // CRITICAL: Force CONTENT state to prevent any ad misclassification
          // BUT: Skip this check if we're explicitly transitioning (skipStaleStateCheck=true)
          // because the caller already cleared the state and we'd trigger unwanted cleanup
          if (!skipStaleStateCheck && (state.currentAd || state.playbackPhase !== 'content')) {
            console.log('🔧 FORCING CONTENT state before loading DASH/HLS (clear any stale ad)');
            updateState({
              currentAd: null,
              playbackPhase: 'content',
              showSkipButton: false
            });
            
            // Wait for React state update to flush before continuing
            // This prevents switchVideoSource from seeing stale state.currentAd
            await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)));
          } else if (skipStaleStateCheck) {
            console.log('✅ Skipping stale state check - already cleared by caller');
          }
        }
        
        await streamingManagerRef.current.loadSource(newSrc, detectedMimeType);
        
        // Track current format
        currentFormatRef.current = normalizedNew.includes('.mpd') ? 'dash' : 'hls';
        console.log('✅ STREAMING MANAGER LOADED SOURCE:', currentFormatRef.current);
        
      } else {
        // CRITICAL: Direct content (MP4 ads OR disabled streaming)
        console.log('🎬 Loading MP4 content (direct playback)');
        
        // CRITICAL: If switching to ad, pause streaming first
        if (isAd && streamingManagerRef.current) {
          console.log('📺 Setting StreamingManager state: AD');
          streamingManagerRef.current.setPlaybackState('AD');
        }
        
        // Ensure no streaming manager exists for MP4
        if (streamingManagerRef.current) {
          console.log('🧹 Cleaning up streaming manager for MP4 playback');
          await streamingManagerRef.current.cleanup();
          streamingManagerRef.current = undefined;
        }
        
        video.src = newSrc;
        video.load();
        currentFormatRef.current = 'mp4';
        console.log('✅ DIRECT VIDEO SRC SET: mp4');
      }
      
    } catch (error) {
      console.error('❌ ERROR SWITCHING VIDEO SOURCE:', error);
      // Fallback: Force direct assignment with complete reset
      video.pause();
      video.removeAttribute('src');
      video.load();
      await new Promise(resolve => setTimeout(resolve, 150));
      video.src = newSrc;
      video.load();
    }
  }, [normalizeUrl, config.src.url, config.streaming?.enabled, state.playbackPhase, state.currentAd, updateState]);

  // Helper to validate if we should be in ad mode
  const validateAdState = useCallback(() => {
    const hasValidAd = state.currentAd && state.playbackPhase !== 'content';
    const hasAdsConfig = config.ads && (
      (config.ads.preRoll && config.ads.preRoll.length > 0) ||
      (config.ads.midRoll && config.ads.midRoll.length > 0) ||
      (config.ads.postRoll && config.ads.postRoll.length > 0)
    );
    
    // CRITICAL: Use normalized URLs and currentFormatRef for reliable detection
    const currentSrc = normalizeUrl(videoRef.current?.src);
    const configSrc = normalizeUrl(config.src.url);
    const currentFormat = currentFormatRef.current;
    
    // Detect main content using normalized URLs and format ref
    const isMainContent = videoRef.current?.src && (
      currentSrc.includes('.mpd') || 
      currentSrc.includes('.m3u8') ||
      currentSrc === configSrc ||
      currentFormat === 'dash' ||
      currentFormat === 'hls'
    );
    
    // If we think we have an ad but no ad config exists, force content mode
    if (hasValidAd && !hasAdsConfig) {
      console.warn('⚠️ Invalid ad state detected - no ads configured, forcing content mode');
      updateState({ 
        currentAd: null, 
        playbackPhase: 'content',
        showSkipButton: false 
      });
      return false;
    }
    
    // CRITICAL: If current video source is main content but state says it's an ad, fix it
    if (hasValidAd && isMainContent) {
      console.warn('⚠️ Main content misclassified as ad - correcting state', {
        currentSrc,
        configSrc,
        currentFormat,
        hasValidAd
      });
      updateState({ 
        currentAd: null, 
        playbackPhase: 'content',
        showSkipButton: false 
      });
      return false;
    }
    
    return hasValidAd;
  }, [state.currentAd, state.playbackPhase, config.ads, config.src.url, updateState, normalizeUrl]);

  // Create enhanced trackEvent function that routes through analytics manager
  const enhancedTrackEvent = useCallback((type: string, payload?: any) => {
    if (useEnhanced && enhancedTracking?.getAnalyticsManager()) {
      // Route through enhanced analytics manager
      // The EnhancedAnalyticsManager.logEvent() already calls config.analytics.onEvent
      // via sendToAnalytics(), so we don't call it again here to avoid duplicates
      const manager = enhancedTracking.getAnalyticsManager();
      manager!.logEvent(
        type.startsWith('on') ? type : `on${type.charAt(0).toUpperCase()}${type.slice(1)}`,
        payload
      );
    } else {
      // Use legacy trackEvent
      trackEvent(type as any, payload);
    }
  }, [useEnhanced, enhancedTracking, trackEvent]);

  // Initialize managers only once using useMemo
  useMemo(() => {
    if (!drmManagerRef.current) {
      drmManagerRef.current = new DRMManager();
    }
    if (!adManagerRef.current) {
      adManagerRef.current = new AdManager(config.ads, enhancedTrackEvent);
    }
    if (!offlineManagerRef.current && config.offline) {
      offlineManagerRef.current = new OfflineManager(config.offline);
    }
    return true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps = only runs once

  // Validate ad state on every render to prevent content being treated as ads
  useEffect(() => {
    validateAdState();
  }, [validateAdState]);

  // Initialize streaming manager when video element is ready
  // CRITICAL: Only create StreamingManager when in PURE content mode
  useEffect(() => {
    if (!videoRef.current) return;
    
    // 🚫 ABSOLUTE SYNCHRONOUS GUARD: Check ref FIRST (before async state)
    // Refs are synchronous, state is async - this prevents timing races
    if (blockStreamingInitRef.current) {
      console.log('🚫 Streaming init blocked by synchronous ref flag (ad is active)');
      return;
    }
    
    // 🚫 STRICT GUARD: Only create StreamingManager in pure content mode
    // PHASE 5: Gate content resumption - prevent StreamingManager init during ads OR ad chains
    // This prevents DASH/HLS from buffering during ANY ad playback (pre-roll, mid-roll, post-roll)
    if (state.playbackPhase !== 'content' || state.currentAd || adChainActiveRef.current) {
      console.log('⏸️  Blocking StreamingManager init (only allowed in pure content mode):', {
        phase: state.playbackPhase,
        hasAd: !!state.currentAd,
        adChainActive: adChainActiveRef.current
      });
      return;
    }
    
    if (!streamingManagerRef.current) {
      console.log('🎬 Creating StreamingManager (content mode only)');
      // Create streaming manager with error callback for critical errors only
      const handleStreamingError = (error: any) => {
        console.log('🔧 Streaming error received:', {
          type: error.type,
          source: error.source,
          currentPhase: state.playbackPhase,
          hasAd: !!state.currentAd,
          currentSrc: videoRef.current?.src,
          currentFormat: currentFormatRef.current
        });
        
        // CRITICAL: Ignore unsupported settings warnings (like enableLowLatencyMode)
        // These are non-fatal and should NEVER trigger fallback or state changes
        // ABSOLUTE BLOCK: Return immediately without any state updates
        if (error.message?.includes('is not supported') ||
            error.message?.includes('enableLowLatencyMode') ||
            error.message?.includes('Settings parameter') ||
            error.message?.includes('parameter not supported')) {
          console.warn('⚠️ Ignored non-fatal DASH warning (no action taken):', error.message);
          return; // CRITICAL: Early return - don't process this as an error
        }
        
        // CRITICAL: Detect if current source is main content using normalized URLs
        const currentSrc = normalizeUrl(videoRef.current?.src);
        const configSrc = normalizeUrl(config.src.url);
        const isMainContent = currentSrc.includes('.mpd') || 
                             currentSrc.includes('.m3u8') || 
                             currentSrc === configSrc ||
                             currentFormatRef.current === 'dash' ||
                             currentFormatRef.current === 'hls';
        
        // Handle different error types
        if (error.type === 'streaming_fatal') {
          // Fatal error - only update UI, don't interfere with ad/content flow
          console.error('❌ Fatal streaming error:', error);
          
          // Check if we're currently in ad playback - if so, DON'T reload content
          if (state.currentAd || state.playbackPhase !== 'content') {
            console.warn('⚠️ Streaming error during ad phase - maintaining ad flow');
            // Just log the error, don't update state or interfere with ad sequence
            trackEvent('streaming_error_during_ad', error);
            return; // Critical: Don't update error state during ads
          }
          
          // CRITICAL: If error is for main content, verify it's not being treated as ad
          if (isMainContent && state.currentAd) {
            console.error('🚨 ERROR RECOVERY PREVENTED: Main content has ad state!');
            console.error('🚨 Clearing ad state before error handling...');
            updateState({ 
              currentAd: null, 
              playbackPhase: 'content',
              showSkipButton: false 
            });
          }
          
          // Only show error for main content failures
          console.error('❌ Main content streaming error - showing error message');
          updateState({ 
            error: error.message || `Streaming error: ${error.source || 'Unknown'}`, 
            buffering: false 
          });
          trackEvent('streaming_error', error);
          
        } else if (error.type === 'streaming_fallback') {
          // Fallback mode activated - inform user but continue playback
          console.log('🔄 Fallback mode activated:', error.message);
          trackEvent('streaming_fallback', error);
          
        } else {
          // Non-fatal streaming errors - handled internally by streaming manager
          console.warn('Non-fatal streaming error (handled internally):', error);
        }
      };
      
      streamingManagerRef.current = new StreamingManager(videoRef.current, handleStreamingError);
    }
  }, [updateState, trackEvent, state.currentAd, state.playbackPhase, config.src.url, normalizeUrl]);

  // Connect video element to enhanced analytics manager
  useEffect(() => {
    if (videoRef.current && enhancedTracking?.setVideoElement) {
      enhancedTracking.setVideoElement(videoRef.current);
    }
  }, [enhancedTracking]);

  // Check for offline video availability
  useEffect(() => {
    const checkOfflineAvailability = async () => {
      if (!offlineManagerRef.current) return;
      
      // Generate video ID from URL for consistency
      const videoId = btoa(config.src.url).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
      const isAvailable = await offlineManagerRef.current.isVideoAvailableOffline(videoId);
      
      if (isAvailable) {
        const offlineVideo = await offlineManagerRef.current.getOfflineVideo(videoId);
        if (offlineVideo) {
          setIsOfflineMode(true);
          // Load offline video
          const blob = await offlineManagerRef.current.getOfflineVideoBlob(videoId);
          if (blob && videoRef.current) {
            const offlineUrl = URL.createObjectURL(blob);
            videoRef.current.src = offlineUrl;
            enhancedTrackEvent('offline_play', { videoId, title: offlineVideo.title });
          }
        }
      }
    };

    checkOfflineAvailability();
  }, [config.src.url, trackEvent]);

  // Setup video element and load source
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isOfflineMode) return; // Skip online setup if in offline mode

    const setupVideo = async () => {
      try {
        // Setup DRM if configured
        if (config.src.drm) {
          await drmManagerRef.current?.setupDRM(video, config.src.drm);
        }

        // Apply UI config BEFORE loading any content
        if (config.ui) {
          video.autoplay = config.ui.autoplay || false;
          video.muted = config.ui.muted || false;
          video.loop = config.ui.loop || false;
          updateState({ volume: video.volume, muted: video.muted });
        }

        // Initialize default subtitle track
        if (config.src.subtitles && config.src.subtitles.length > 0) {
          const defaultSubtitle = config.src.subtitles.find(sub => sub.isDefault) || config.src.subtitles[0];
          if (defaultSubtitle) {
            // Set default subtitle in state
            updateState({ currentSubtitle: defaultSubtitle });
          }
        }

        // CRITICAL: ABSOLUTE GUARD - Prevent ANY content loading during ad playback
        // BUT: Allow first-time initialization even if state says 'preroll' (from page refresh)
        // This catches cases where setupVideo runs while ad is ACTIVELY PLAYING (hot reload, config change, etc.)
        const isActiveAdPlayback = blockStreamingInitRef.current || state.currentAd;
        const isFirstInit = !isInitializedRef.current;
        
        if (isActiveAdPlayback && !isFirstInit) {
          return; // Don't load anything during active ad playback
        }
        
        // CRITICAL: Check for pre-roll ads on EVERY setupVideo call, not just first
        // This prevents DASH from loading if ads are configured (e.g., after hot reload)
        if (!isInitializedRef.current) {
          console.log('🎬 First initialization - setting up player state');
          isInitializedRef.current = true;
          
          // CRITICAL: Always reset ad manager to avoid stale state (safe idempotent operation)
          // This ensures clean state after refresh, hot reload, or any initialization
          if (adManagerRef.current) {
            console.log('🔄 Resetting ad manager for clean initialization (always safe)');
            adManagerRef.current.reset();
          }
          
          // Check for pre-roll ads for ALL content types (including DASH/HLS)
            const hasAdsConfig = config.ads && config.ads.preRoll && config.ads.preRoll.length > 0;
            const preRollAd = hasAdsConfig ? adManagerRef.current?.getPreRollAd() : null;
          
          console.log('🎬 Initialization check:', { 
            contentType: config.src.mimeType,
            contentUrl: config.src.url,
            hasAdsConfig, 
            hasPreRollAd: !!preRollAd,
            preRollAdUrl: preRollAd?.url || 'none',
            isPageRefresh,
            blockingFlagSet: blockStreamingInitRef.current,
            timestamp: new Date().toISOString()
          });
            
            if (preRollAd && hasAdsConfig) {
            // CRITICAL: Pre-roll ad exists - ONLY load ad, DO NOT load main content yet
            // Main content will be loaded after ad ends/skips in handleEnded/handleSkipAd
            console.log('🎬 Loading ONLY pre-roll ad (main content deferred):', {
              adId: preRollAd.id,
              adUrl: preRollAd.url,
              adDuration: preRollAd.duration
            });
            
            // CRITICAL: Set synchronous blocking flag BEFORE any async operations
            // This prevents StreamingManager creation during ad playback (refs are synchronous!)
            blockStreamingInitRef.current = true;
            console.log('🚫 Synchronous blocking flag SET - StreamingManager init blocked');
            
            // CRITICAL: FORCED cleanup of StreamingManager before pre-roll ad starts
            // This prevents DASH/HLS buffering in background during MP4 ad playback
            // Clear ALL streaming-related state to ensure clean ad playback
            if (streamingManagerRef.current) {
              console.log('🧹 FORCED cleanup of StreamingManager before pre-roll ad');
              await streamingManagerRef.current.cleanup();
              streamingManagerRef.current = undefined;
              currentFormatRef.current = null; // Clear format tracking
              console.log('✅ StreamingManager fully destroyed - ready for ad');
            }
            
              updateState({ 
                currentAd: preRollAd, 
                adProgress: 0,
                playbackPhase: 'preroll',
              isPlaying: false
              });
              
              // Update analytics context and call event hook
              updateAnalyticsContext('ad', preRollAd);
              callEventHook('onAdStarted', preRollAd);
              
            // Load ONLY ad source (ads are always MP4, not DASH/HLS)
            // Do NOT load main content - it will initialize after ad ends
              await switchVideoSource(preRollAd.url, undefined, false, false, 'ad');
            console.log('✅ Pre-roll ad loaded, main content deferred until ad completes');
              video.play().catch(() => {}); // Auto-play may be blocked
            
            // CRITICAL: Hard return to prevent main content initialization
            // Without this, the else branch below might execute due to timing
            return;
            } else {
            // No pre-roll ads - start main content directly
            console.log('🎬 No pre-roll ads, loading main content directly:', {
              contentUrl: config.src.url,
              contentType: config.src.mimeType
            });
              updateState({ 
                playbackPhase: 'content',
                currentAd: null,
                isPlaying: false
              });
              updateAnalyticsContext('content');
              
            // Load main content (handles DASH/HLS/MP4 automatically)
            await switchVideoSource(config.src.url, config.src.mimeType);
            console.log('✅ Main content loaded successfully');
            }
        }

      } catch (error) {
        updateState({ error: (error as Error).message });
        enhancedTrackEvent('error', { error: (error as Error).message });
      }
    };

    setupVideo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.src, config.ui]);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      updateState({ duration: video.duration });
    };

    const handleTimeUpdate = async () => {
      const currentTime = video.currentTime;
      const previousTime = state.previousTime;
      
      // Detect if this is a seek (jump in time > 1 second)
      const isSeek = Math.abs(currentTime - previousTime) > 1;
      
      updateState({ currentTime, previousTime: currentTime });

      // Handle different phases
      if (state.playbackPhase === 'content' && !state.currentAd) {
        // We're in main content, update main content time and check for mid-roll ads
        updateState({ mainContentTime: currentTime });
        
        // CRITICAL: Suppress mid-roll checks for a short window after resuming content
        // This prevents "resume → seek → instant mid-roll again" loops
        if (performance.now() < resumeCooldownUntilRef.current) {
          console.log('🔒 Mid-roll detection suppressed (time-based cooldown active)');
          return;
        }
        
        // CRITICAL: Position-based guard - suppress mid-rolls until video advances past resume point
        // This prevents re-triggering on the first timeupdate after resume (before time advances)
        if (resumeGuardUntilPositionRef.current != null &&
            currentTime < resumeGuardUntilPositionRef.current) {
          // Keep tracking time but don't evaluate mid-rolls yet
          console.log('🔒 Mid-roll detection suppressed (position guard:', resumeGuardUntilPositionRef.current, ')');
          return;
        } else if (resumeGuardUntilPositionRef.current != null &&
                   currentTime >= resumeGuardUntilPositionRef.current) {
          console.log('✅ Resume position guard passed at', currentTime,
            '(target was', resumeGuardUntilPositionRef.current, ')');
          resumeGuardUntilPositionRef.current = null;
        }
        
        if (adManagerRef.current) {
          let midRollResult = null;
          
          if (isSeek) {
            // Check for missed mid-roll ads during seek
            // console.log('🎯 Seek detected from', previousTime, 'to', currentTime, '- checking for missed ads');
            midRollResult = adManagerRef.current.checkMissedMidRollAds(previousTime, currentTime);
          } else {
            // Normal time progression - check for regular mid-roll ads
            midRollResult = adManagerRef.current.getMidRollAd(currentTime);
          }
          
          if (midRollResult) {
            const { ad: midRollAd, chainInfo } = midRollResult;
            
            // PHASE 3: Store chain info and set chain active flag
            if (chainInfo.chainIndex === 0) {
              // First ad in chain - store resume point ONCE
              seekAfterChainRef.current = currentTime;
              adChainActiveRef.current = chainInfo.isChained; // Set to true if multiple ads
              adChainIndexRef.current = 0;
              
              // Store the chain info in the midrollQueueRef for MediaPlayer
              const cueAds = Array.from({ length: chainInfo.chainLength }, (_, i) => ({
                cuePoint: chainInfo.cuePoint,
                chainLength: chainInfo.chainLength,
                chainIndex: i
              }));
              midrollQueueRef.current.set(chainInfo.cuePoint, cueAds as any);
              
              console.log(`🔗 PHASE 3: Ad chain started - ${chainInfo.chainLength} ads at cue ${chainInfo.cuePoint}s, resumePoint: ${currentTime.toFixed(2)}s`);
            }
            
            // Store current main content time before switching to ad
            // Store resume time in a ref to avoid state race conditions
            resumeTimeRef.current = seekAfterChainRef.current; // Use stored chain resume point
            
            // CRITICAL: Set synchronous blocking flag BEFORE any async operations
            // This prevents StreamingManager re-creation during ad playback (refs are synchronous!)
            blockStreamingInitRef.current = true;
            console.log('🚫 Synchronous blocking flag SET - StreamingManager init blocked');
            
            // CRITICAL: FORCED cleanup of StreamingManager before mid-roll ad (ONLY for first ad in chain)
            // This prevents DASH/HLS buffering in background during MP4 ad playback
            // Clear ALL streaming-related state to ensure clean ad playback
            if (streamingManagerRef.current && chainInfo.chainIndex === 0) {
              console.log('🧹 FORCED cleanup of StreamingManager before mid-roll ad');
              await streamingManagerRef.current.cleanup();
              streamingManagerRef.current = undefined;
              currentFormatRef.current = null; // Clear format tracking
              console.log('✅ StreamingManager fully destroyed - ready for mid-roll ad');
            }
            
            // 👇 Explicitly leave content phase so we don't misclassify the next load
            updateState({ 
              currentAd: midRollAd,
              mainContentTime: currentTime,
              adProgress: 0,
              playbackPhase: 'midroll'
            });
            video.pause();
            await switchVideoSource(midRollAd.url, undefined, false, false, 'ad');
            if (state.isPlaying) {
              // Wait for load to complete before playing
              const playAfterLoad = async () => {
                await new Promise(resolve => {
                  const onLoadedData = () => {
                    video.removeEventListener('loadeddata', onLoadedData);
                    resolve(undefined);
                  };
                  video.addEventListener('loadeddata', onLoadedData);
                });
                await video.play().catch((error: any) => {});
              };
              playAfterLoad();
            }
          }
        }
      }

      // Handle ad progress and skip button (for any ad)
      if (state.currentAd) {
        const adProgress = Math.min((currentTime / state.currentAd.duration) * 100, 100);
        updateState({ adProgress });

        // Check if ad should end based on current time vs ad duration
        if (currentTime >= state.currentAd.duration && state.isPlaying) {
          // Ad has reached its end time, trigger ended event manually
          video.pause();
          handleEnded();
        }

        if (state.currentAd.skippable && state.currentAd.skipAfter) {
          const showSkip = currentTime >= state.currentAd.skipAfter;
          updateState({ showSkipButton: showSkip });
        }
      }
    };

    const handlePlay = () => {
      updateState({ isPlaying: true, buffering: false });
      enhancedTrackEvent('play', { currentTime: video.currentTime });
      
      // Call event hook
      callEventHook('onPlayStarted', { 
        url: config.src.url, 
        currentTime: video.currentTime,
        isAd: !!state.currentAd 
      });
    };

    const handlePause = () => {
      updateState({ isPlaying: false });
      enhancedTrackEvent('pause', { currentTime: video.currentTime });
      
      // Call event hook
      callEventHook('onPause', { 
        url: config.src.url, 
        currentTime: video.currentTime,
        isAd: !!state.currentAd 
      });
    };

    const handleVolumeChange = () => {
      updateState({ volume: video.volume, muted: video.muted });
      enhancedTrackEvent('volumechange', { volume: video.volume, muted: video.muted });
    };

    const handleSeeking = () => {
      // CRITICAL: Block seeking during ads - reset to current position
      if (state.currentAd) {
        const lastValidTime = video.currentTime;
        console.log('⚠️ Seek attempt blocked during ad - resetting to:', lastValidTime);
        // Cancel the seek by resetting to the stored time on next tick
        requestAnimationFrame(() => {
          if (state.currentAd && video.currentTime !== lastValidTime) {
            video.currentTime = lastValidTime;
          }
        });
        return;
      }
      
      updateState({ buffering: true });
    };

    const handleSeeked = () => {
      // CRITICAL: Double-check - if a seek completed during an ad, it shouldn't have
      if (state.currentAd) {
        console.warn('⚠️ Unexpected seek completed during ad playback');
        return;
      }
      
      const currentTime = video.currentTime;
      updateState({ buffering: false });
      enhancedTrackEvent('seek', { currentTime });
      
      // Update previous time to current time after seek to prevent false seek detection
      updateState({ previousTime: currentTime });
    };

    const handleWaiting = () => {
      updateState({ buffering: true });
      enhancedTrackEvent('buffering_start');
    };

    const handleCanPlay = () => {
      updateState({ buffering: false });
      enhancedTrackEvent('buffering_end');
    };

    const handleEnded = async () => {
      // CRITICAL: Guard against concurrent execution
      if (handleEndedInProgressRef.current) {
        console.log('⚠️ handleEnded already running, skipping concurrent call');
        return;
      }
      
      handleEndedInProgressRef.current = true;
      
      try {
      if (state.currentAd) {
        // Ad ended
        adManagerRef.current?.onAdComplete(state.currentAd.id);
        
        // Call event hooks for ad completion
        callEventHook('onAdCompleted', state.currentAd);
        callEventHook('onItemCompleted', state.currentAd);
        
        if (state.playbackPhase === 'preroll') {
          // Check for more pre-roll ads
          const nextPreRollAd = adManagerRef.current?.getPreRollAd();
          
          if (nextPreRollAd) {
            updateState({ 
              currentAd: nextPreRollAd, 
              showSkipButton: false, 
              adProgress: 0,
              playbackPhase: 'preroll'  // Ensure phase stays as preroll
            });
            
            // Update analytics context and call event hook for new ad started
            updateAnalyticsContext('ad', nextPreRollAd);
            callEventHook('onAdStarted', nextPreRollAd);
            
              await switchVideoSource(nextPreRollAd.url, undefined, false, false, 'ad');
            // Wait for load to complete before playing
            await new Promise(resolve => {
              const onLoadedData = () => {
                video.removeEventListener('loadeddata', onLoadedData);
                resolve(undefined);
              };
              video.addEventListener('loadeddata', onLoadedData);
            });
            await video.play().catch(error => {});
          } else {
              // All pre-roll ads done, use shared transition function
              await transitionToMainContent('completed');
            }
          } else if (state.playbackPhase === 'content' || state.playbackPhase === 'midroll') {
            // PHASE 4: Check if there's another ad in the chain
            if (adChainActiveRef.current && adManagerRef.current) {
              const cuePoint = Math.floor(seekAfterChainRef.current);
              const currentChainIndex = adChainIndexRef.current;
              const nextAdResult = adManagerRef.current.getNextAdInChain(cuePoint, currentChainIndex);
              
              if (nextAdResult) {
                const { ad: nextAd, chainInfo } = nextAdResult;
                
                // Update chain index
                adChainIndexRef.current = chainInfo.chainIndex;
                
                // Update state with next ad (stay in midroll phase)
                updateState({ 
                  currentAd: nextAd, 
                  showSkipButton: false, 
                  adProgress: 0,
                  playbackPhase: 'midroll'  // Stay in midroll phase during chain
                });
                
                console.log(`🔗 PHASE 4: Loading next ad in chain (${chainInfo.chainIndex + 1}/${chainInfo.chainLength}) - MP4→MP4 transition`);
                
                // Update analytics context and call event hook for new ad started
                updateAnalyticsContext('ad', nextAd);
                callEventHook('onAdStarted', nextAd);
                
                // MP4→MP4 transition (no content init)
                await switchVideoSource(nextAd.url, undefined, false, false, 'ad');
                
                // Wait for load to complete before playing
                await new Promise(resolve => {
                  const onLoadedData = () => {
                    video.removeEventListener('loadeddata', onLoadedData);
                    resolve(undefined);
                  };
                  video.addEventListener('loadeddata', onLoadedData);
                });
                await video.play().catch(error => {});
                
                // Chain continues - don't resume content yet
                return;
              } else {
                // No more ads in chain - mark chain as complete
                adChainActiveRef.current = false;
                console.log(`✅ PHASE 4: Ad chain completed - resuming content at ${seekAfterChainRef.current.toFixed(2)}s`);
              }
            }
            
            // Mid-roll ad completed (or chain completed), return to main content
            const resumeTime = seekAfterChainRef.current || resumeTimeRef.current;
            console.log('✅ Mid-roll ad completed - resuming main content');
            console.log('📺 Resuming at time:', resumeTime);
            
            // CRITICAL: Set position guard to prevent mid-roll re-trigger until video advances
            lastResumeTargetRef.current = resumeTime;
            resumeGuardUntilPositionRef.current = resumeTime + 0.75;
            console.log('🔒 Position guard set: suppress mid-rolls until', resumeGuardUntilPositionRef.current);
            
            // CRITICAL: Abort any previous transition event listeners
            if (transitionAbortControllerRef.current) {
              transitionAbortControllerRef.current.abort();
            }
            transitionAbortControllerRef.current = new AbortController();
            const signal = transitionAbortControllerRef.current.signal;
            
            // CRITICAL: Clear synchronous blocking flag FIRST (immediate effect)
            blockStreamingInitRef.current = false;
            console.log('✅ Synchronous blocking flag CLEARED - StreamingManager can now init');
            
            // CRITICAL: Force-clear ad state BEFORE switching back
            updateState({ currentAd: null, showSkipButton: false, buffering: true, playbackPhase: 'content' });
            
            // CRITICAL: Set time-based cooldown to prevent immediate mid-roll re-trigger
            resumeCooldownUntilRef.current = performance.now() + 1200;
            console.log('🔒 Time-based cooldown activated (1200ms)');
            
            // CRITICAL: Call onContentResumeRequested hook
            callEventHook('onContentResumeRequested', {
              url: config.src.url,
              resumeTime: resumeTime,
              reason: 'ad_completed'
            });
            
            // CRITICAL: Double-flush state through two RAF ticks to avoid stale phase in effects/guards
            await new Promise(r => requestAnimationFrame(() => r(undefined)));
            await new Promise(r => requestAnimationFrame(() => r(undefined)));
            
            // Belt-and-suspenders: Ensure block flag is clear before content resume
            if (blockStreamingInitRef.current) {
              console.log('⚡ Clearing stale block flag before content resume');
              blockStreamingInitRef.current = false;
            }
            
            console.log('🔄 Switching back to main content (DASH/HLS)');
            await switchVideoSource(config.src.url, config.src.mimeType, true, true, 'content'); // Skip stale check + force + content
            
            if (signal.aborted) return;
            
            // CRITICAL: Wait for video to be seekable at the specific resume time
            console.log('⏳ Waiting for video to be seekable at resume time:', resumeTime);
            await waitForSeekableTime(resumeTime, signal);
            
            if (signal.aborted) return;
            
            // CRITICAL: Record current time BEFORE seeking
            const timeBeforeSeek = video.currentTime;
            console.log('📍 Current position before seek:', timeBeforeSeek);
          
          // Now set the resume time
          console.log('⏩ Setting resume time:', resumeTime);
          video.currentTime = resumeTime;
          
            // CRITICAL: Wait for seek to complete before playing
            console.log('⏳ Waiting for seek to complete...');
            await new Promise<void>((resolve) => {
              if (signal.aborted) {
                resolve();
                return;
              }
              
              const onSeeked = () => {
                if (!signal.aborted) {
                  console.log('✅ Seek completed to:', video.currentTime);
                  resolve();
                }
              };
              
              // Only skip seek wait if we were ALREADY at the target position BEFORE setting it
              if (Math.abs(timeBeforeSeek - resumeTime) < 0.5) {
                console.log('✅ Already at resume position (no seek needed)');
                resolve();
                return;
              }
              
              console.log('⏳ Seeking from', timeBeforeSeek, 'to', resumeTime);
              video.addEventListener('seeked', onSeeked, { once: true, signal });
              
          setTimeout(() => {
                if (!signal.aborted) {
                  console.warn('⚠️ Seek timeout - proceeding anyway at:', video.currentTime);
                  video.removeEventListener('seeked', onSeeked);
                  resolve();
                }
          }, 2000);
            });
            
            if (signal.aborted) return;
            
            // CRITICAL: Pause video during buffer delay to prevent timeupdate from triggering mid-rolls
            video.pause();
            console.log('⏸️  Paused video to prevent mid-roll re-trigger during buffer delay');
            
            // CRITICAL: Give DASH.js time to request and buffer segments after seek
            // Without this delay, video.play() fails because no data is buffered yet
            console.log('⏳ Giving DASH 800ms to buffer segments after seek...');
            await new Promise(resolve => setTimeout(resolve, 800));
            
            if (signal.aborted) return;
            
            // DETERMINISTIC: Start playback - DASH should have buffered by now
            console.log('▶️ Calling play() at resume time:', video.currentTime);
            const playErr = await video.play().catch(e => e);
            
            if (playErr && String(playErr?.name).includes('NotAllowed')) {
              console.warn('⚠️ Autoplay blocked after mid-roll completion — awaiting user gesture');
            updateState({ buffering: false, isPlaying: false });
              return; // UI will show Play; user click will resume
            }
            
            // Wait for playback to actually start (playing event OR time advancing)
            await waitForResumeStart(signal);
            
            if (!signal.aborted) {
              const actuallyPlaying = !video.paused && video.readyState >= 2;
              updateState({ buffering: false, isPlaying: actuallyPlaying });
              console.log('✅ Resume settled; playing:', actuallyPlaying);
            }
          
          enhancedTrackEvent('seek', { currentTime: resumeTime, reason: 'midroll_complete_resume' });
        } else if (state.playbackPhase === 'postroll') {
          // Check for more post-roll ads
          const nextPostRollAd = adManagerRef.current?.getPostRollAd();
          if (nextPostRollAd) {
              updateState({ currentAd: nextPostRollAd, showSkipButton: false, adProgress: 0, playbackPhase: 'postroll' });
            
            // Call event hook for new ad started
            callEventHook('onAdStarted', nextPostRollAd);
            
              await switchVideoSource(nextPostRollAd.url, undefined, false, false, 'ad');
            // Wait for load to complete before playing
            await new Promise(resolve => {
              const onLoadedData = () => {
                video.removeEventListener('loadeddata', onLoadedData);
                resolve(undefined);
              };
              video.addEventListener('loadeddata', onLoadedData);
            });
            await video.play().catch(error => {});
          } else {
            // All post-roll ads done
              updateState({ isPlaying: false, currentAd: null, showReplay: true, buffering: false, playbackPhase: 'content' });
            enhancedTrackEvent('complete', { reason: 'all_ads_finished' });
          }
        }
      } else {
        // Main content ended, start post-roll
        const postRollAd = adManagerRef.current?.getPostRollAd();
        if (postRollAd) {
            console.log('🎬 STARTING POST-ROLL AD:', {
              adId: postRollAd.id,
              settingPhase: 'postroll'
            });
            
          updateState({ 
            currentAd: postRollAd, 
            showSkipButton: false, 
            playbackPhase: 'postroll',
            adProgress: 0
          });
          
          // Update analytics context and call event hook for new ad started
          updateAnalyticsContext('ad', postRollAd);
          callEventHook('onAdStarted', postRollAd);
          
            await switchVideoSource(postRollAd.url, undefined, false, false, 'ad');
          // Wait for load to complete before playing
          await new Promise(resolve => {
            const onLoadedData = () => {
              video.removeEventListener('loadeddata', onLoadedData);
              resolve(undefined);
            };
            video.addEventListener('loadeddata', onLoadedData);
          });
          await video.play().catch(error => {});
        } else {
          // No post-roll ads, video is complete - show replay
          updateState({ isPlaying: false, showReplay: true });
          enhancedTrackEvent('complete', { reason: 'main_content_ended' });
          
          // Call event hook for main content completion
          callEventHook('onItemCompleted', { 
            id: 'main_content',
            url: config.src.url,
            type: 'content'
          });
        }
        }
      } finally {
        // CRITICAL: Always reset guard to allow future executions
        handleEndedInProgressRef.current = false;
      }
    };

    const handleError = () => {
      const video = videoRef.current;
      if (!video || !video.error) return;
      
      const error = video.error.message || 'Unknown video error';
      const errorCode = video.error.code;
      
      // CRITICAL: Ignore "Empty src attribute" errors - these are expected during source switching
      // When we call video.src = '' to reset MediaSource, browser fires MEDIA_ERR_SRC_NOT_SUPPORTED
      // This is intentional cleanup, not a real error
      if (error.includes('Empty src') || error.includes('empty src') || 
          (errorCode === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED && !video.src)) {
        console.log('🔧 Ignoring expected empty src error during source reset');
        return;
      }
      
      // Check if this is a streaming-related buffer error that should be ignored
      const isStreamingBufferError = error.includes('SourceBuffer') || 
                                   error.includes('buffer') ||
                                   error.includes('MediaSource') ||
                                   error.includes('getAllBufferRanges') ||
                                   error.includes('removed from the parent') ||
                                   errorCode === MediaError.MEDIA_ERR_DECODE;
      
      // During ad transitions or ad playback, handle errors carefully
      const isDuringAdPhase = state.currentAd || state.playbackPhase !== 'content';
      
      if (isStreamingBufferError && isDuringAdPhase) {
        // Log buffer error but don't update player state or interfere with ad sequence
        console.warn('🔧 Streaming buffer error during ad phase (auto-ignored):', {
          error,
          code: errorCode,
          phase: state.playbackPhase,
          hasAd: !!state.currentAd,
          timestamp: Date.now()
        });
        return; // Critical: Don't propagate to avoid ad sequence interference
      }
      
      // Also ignore SourceBuffer errors during content switching (handled by streaming manager)
      if (isStreamingBufferError) {
        console.warn('🔧 SourceBuffer error (auto-handled by streaming manager):', {
          error,
          code: errorCode,
          timestamp: Date.now()
        });
        return; // These are handled by the streaming manager's retry logic
      }
      
      // For critical errors during ad playback, maintain ad flow
      if (isDuringAdPhase) {
        console.error('❌ Critical error during ad playback:', { error, code: errorCode });
        // Log the error but DON'T switch to main content or interfere with ad sequence
        enhancedTrackEvent('error_during_ad', { error, code: errorCode, adId: state.currentAd?.id });
        callEventHook('onError', { 
          error,
          code: errorCode,
          url: config.src.url,
          isAd: true,
          adId: state.currentAd?.id
        });
        return; // Don't update error state to prevent content loading
      }
      
      // Only show error UI for main content failures
      console.error('❌ Critical main content error:', { error, code: errorCode });
      updateState({ error, buffering: false });
      enhancedTrackEvent('error', { error, code: errorCode });
      
      // Call event hook for critical content errors
      callEventHook('onError', { 
        error,
        code: errorCode,
        url: config.src.url,
        isAd: false 
      });
    };

    // Add event listeners
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('seeking', handleSeeking);
    video.addEventListener('seeked', handleSeeked);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('seeking', handleSeeking);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.src, state.currentAd, state.isPlaying, updateState, trackEvent]);

  // Helper function to wait for video to be seekable to a specific time
  const waitForSeekableTime = useCallback(async (targetTime: number, signal: AbortSignal): Promise<boolean> => {
    const video = videoRef.current;
    if (!video) return false;
    
    return new Promise<boolean>((resolve) => {
      if (signal.aborted) {
        resolve(false);
        return;
      }
      
      const isSeekable = () => {
        const ready = video.readyState >= 2 && 
                     video.duration > 0 && 
                     video.seekable.length > 0;
        
        if (!ready) return false;
        
        // Check if targetTime is within any seekable range
        for (let i = 0; i < video.seekable.length; i++) {
          const start = video.seekable.start(i);
          const end = video.seekable.end(i);
          if (targetTime >= start && targetTime <= end) {
            console.log('✅ Target time is seekable:', {
              targetTime,
              seekableRange: `${start.toFixed(2)}s - ${end.toFixed(2)}s`,
              readyState: video.readyState
            });
            return true;
          }
        }
        
        console.log('⏳ Target time not yet in seekable range:', {
          targetTime,
          seekableRanges: Array.from({ length: video.seekable.length }, (_, i) => 
            `${video.seekable.start(i).toFixed(2)}s - ${video.seekable.end(i).toFixed(2)}s`
          ),
          readyState: video.readyState
        });
        return false;
      };
      
      // Check immediately
      if (isSeekable()) {
        resolve(true);
        return;
      }
      
      // Listen for events that update seekable ranges
      const onCanPlay = () => {
        if (!signal.aborted && isSeekable()) {
          cleanup();
          resolve(true);
        }
      };
      
      const onProgress = () => {
        if (!signal.aborted && isSeekable()) {
          cleanup();
          resolve(true);
        }
      };
      
      const onLoadedData = () => {
        if (!signal.aborted && isSeekable()) {
          cleanup();
          resolve(true);
        }
      };
      
      const cleanup = () => {
        video.removeEventListener('canplay', onCanPlay);
        video.removeEventListener('progress', onProgress);
        video.removeEventListener('loadeddata', onLoadedData);
      };
      
      video.addEventListener('canplay', onCanPlay, { signal });
      video.addEventListener('progress', onProgress, { signal });
      video.addEventListener('loadeddata', onLoadedData, { signal });
      
      // Fallback timeout - proceed anyway after 5 seconds
      setTimeout(() => {
        if (!signal.aborted) {
          cleanup();
          console.warn('⚠️ Seekable timeout - proceeding anyway', {
            targetTime,
            currentReadyState: video.readyState,
            seekableRanges: video.seekable.length
          });
          resolve(true);
        }
      }, 5000);
    });
  }, []);

  // Helper function to wait for buffered data at current position
  // DASH/HLS needs buffered data before video.play() can actually start playback
  const waitForBufferedData = useCallback((targetTime: number, signal: AbortSignal): Promise<void> => {
    const video = videoRef.current;
    if (!video) return Promise.resolve();
    
    return new Promise<void>((resolve) => {
      if (signal.aborted) return resolve();

      const isReady = () => {
        // Check 1: readyState indicates enough data to play
        if (video.readyState >= 3) { // HAVE_FUTURE_DATA
          console.log('✅ Video ready to play (readyState:', video.readyState, ')');
          return true;
        }

        // Check 2: Buffered ranges (with 1.5s tolerance for DASH segment boundaries)
        const buffered = video.buffered;
        for (let i = 0; i < buffered.length; i++) {
          const start = buffered.start(i);
          const end = buffered.end(i);
          // More lenient check - DASH buffers in segments, might not include exact position
          if (targetTime >= start - 1.5 && targetTime <= end + 0.5) {
            console.log('✅ Resume position is buffered:', {
              targetTime,
              bufferedRange: `${start.toFixed(2)}s - ${end.toFixed(2)}s`,
              readyState: video.readyState
            });
            return true;
          }
        }
        return false;
      };

      // Check immediately
      if (isReady()) {
        resolve();
        return;
      }

      console.log('⏳ Waiting for data to buffer at resume position:', targetTime);

      const onProgress = () => {
        if (!signal.aborted && isReady()) {
          cleanup();
          resolve();
        }
      };

      const onCanPlay = () => {
        if (!signal.aborted) {
          console.log('✅ canplay event fired - video ready');
          cleanup();
          resolve();
        }
      };

      const cleanup = () => {
        video.removeEventListener('progress', onProgress);
        video.removeEventListener('canplay', onCanPlay);
      };

      video.addEventListener('progress', onProgress, { signal });
      video.addEventListener('canplay', onCanPlay, { once: true, signal });

      // Reduced timeout to 1 second - if nothing happens, try to play anyway
      setTimeout(() => {
        if (!signal.aborted) {
          cleanup();
          console.warn('⚠️ Buffer wait timeout - attempting play anyway (readyState:', video.readyState, ')');
          resolve();
        }
      }, 1000);
    });
  }, []);

  // Helper function to wait for resume playback to actually start
  // Waits for either 'playing' event OR timeupdate showing time advancement
  const waitForResumeStart = useCallback((signal: AbortSignal): Promise<void> => {
    const video = videoRef.current;
    if (!video) return Promise.resolve();
    
    return new Promise<void>((resolve) => {
      if (signal.aborted) return resolve();

      let lastTime = video.currentTime;
      let resolved = false;

      const onPlaying = () => {
        if (!signal.aborted && !resolved) { 
          resolved = true; 
          cleanup();
          console.log('✅ Resume started (playing event)');
          resolve(); 
        }
      };
      
      const onTimeUpdate = () => {
        if (!signal.aborted && !resolved) {
          const advanced = video.currentTime > lastTime + 0.05; // >50ms movement
          lastTime = video.currentTime;
          if (advanced) { 
            resolved = true; 
            cleanup();
            console.log('✅ Resume started (time advancing)');
            resolve(); 
          }
        }
      };
      
      const onCanPlay = () => {
        if (!signal.aborted && !resolved && video.readyState >= 3) { 
          // HAVE_FUTURE_DATA - can start playing
        }
      };

      const cleanup = () => {
        video.removeEventListener('playing', onPlaying);
        video.removeEventListener('timeupdate', onTimeUpdate);
        video.removeEventListener('canplay', onCanPlay);
      };

      video.addEventListener('playing', onPlaying, { once: true, signal });
      video.addEventListener('timeupdate', onTimeUpdate, { signal });
      video.addEventListener('canplay', onCanPlay, { signal });

      // Extended timeout to 4 seconds - DASH needs time to buffer segments after seek
      setTimeout(() => { 
        if (!signal.aborted && !resolved) { 
          cleanup();
          console.warn('⚠️ Resume start timeout after 4s - DASH may still be buffering');
          resolve(); 
        } 
      }, 4000);
    });
  }, []);

  // CRITICAL: Shared function to transition from ad to main content
  // This eliminates code duplication between handleEnded and handleSkipAd
  const transitionToMainContent = useCallback(async (reason: 'completed' | 'skipped') => {
    const video = videoRef.current;
    if (!video) return;
    
    console.log(`✅ Pre-roll ${reason} - transitioning to main content`);
    console.log(`🎬 Pre-roll ad ${reason} → Initializing main DASH/HLS content NOW`);
    console.log('📺 Main content details:', {
      url: config.src.url,
      mimeType: config.src.mimeType,
      isDASH: config.src.url.includes('.mpd'),
      isHLS: config.src.url.includes('.m3u8')
    });
    
    // CRITICAL: Validate we're loading main content (DASH/HLS), not MP4
    const isValidMainContent = config.src.url.includes('.mpd') || 
                              config.src.url.includes('.m3u8');
    
    if (!isValidMainContent) {
      console.warn('⚠️ Main content URL does not appear to be DASH/HLS:', config.src.url);
    }
    
    // CRITICAL: Abort any previous transition event listeners
    if (transitionAbortControllerRef.current) {
      transitionAbortControllerRef.current.abort();
    }
    transitionAbortControllerRef.current = new AbortController();
    const signal = transitionAbortControllerRef.current.signal;
    
    // CRITICAL: Clear synchronous blocking flag FIRST (immediate effect)
    blockStreamingInitRef.current = false;
    console.log('✅ Synchronous blocking flag CLEARED - StreamingManager can now init');
    
    // CRITICAL: Clear ad state BEFORE loading main content
    console.log('🔧 Clearing ad state before loading main content');
    updateState({ 
      currentAd: null, 
      showSkipButton: false, 
      playbackPhase: 'content',
      buffering: true // Set buffering during transition
    });
    updateAnalyticsContext('content');
    
    // CRITICAL: Call onContentResumeRequested hook
    callEventHook('onContentResumeRequested', {
      url: config.src.url,
      resumeTime: state.mainContentTime,
      reason: reason === 'completed' ? 'ad_completed' : 'ad_skipped'
    });
    
    // CRITICAL: Wait for React state update to flush
    await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)));
    
    console.log('📺 Loading main content (DASH/HLS) after pre-roll');
    await switchVideoSource(config.src.url, config.src.mimeType, true, true, 'content'); // Skip stale check + force + content
    
    // DETERMINISTIC: Wait for content to be ready with proper cleanup
    console.log('⏳ Waiting for main content to be ready...');
    await new Promise<void>((resolve) => {
      if (signal.aborted) {
        resolve();
        return;
      }
      
      let resolved = false;
      
      const onLoadedData = () => {
        if (!resolved && !signal.aborted) {
          resolved = true;
          video.removeEventListener('loadeddata', onLoadedData);
          console.log('✅ Main content loaded');
          resolve();
        }
      };
      
      video.addEventListener('loadeddata', onLoadedData, { signal });
      
      // Timeout after 3 seconds if loadeddata never fires
      setTimeout(() => {
        if (!resolved && !signal.aborted) {
          resolved = true;
          video.removeEventListener('loadeddata', onLoadedData);
          console.log('⚠️ Timeout waiting for loadeddata - starting anyway');
          resolve();
        }
      }, 3000);
      
      // Also check if video is already ready
      if (video.readyState >= 2) { // HAVE_CURRENT_DATA or better
        if (!resolved && !signal.aborted) {
          resolved = true;
          video.removeEventListener('loadeddata', onLoadedData);
          console.log('✅ Main content already ready - starting immediately');
          resolve();
        }
      }
    });
    
    if (signal.aborted) return;
    
    video.currentTime = state.mainContentTime;
    
    // DETERMINISTIC: Clear buffering when playback actually starts
    console.log('🔄 Setting up buffering clear on playback start');
    
    const clearBufferingOnPlaying = () => {
      if (!signal.aborted) {
        console.log('✅ Playback started - clearing buffering state');
        updateState({ buffering: false, isPlaying: true });
      }
    };
    
    video.addEventListener('playing', clearBufferingOnPlaying, { once: true, signal });
    
    // Fallback timeout to clear buffering if playing event doesn't fire
    setTimeout(() => {
      if (!signal.aborted) {
        console.log('🔧 Timeout fallback - force clearing buffering state');
        updateState({ buffering: false });
      }
    }, 2000);
    
    console.log('▶️ Starting main content playback');
    video.play().catch(error => {
      console.warn('⚠️ Auto-play blocked:', error);
      if (!signal.aborted) {
        updateState({ buffering: false, isPlaying: false });
      }
    });
  }, [config.src, state.mainContentTime, updateState, updateAnalyticsContext, callEventHook, switchVideoSource]);

  // Player control handlers
  const handlePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (state.isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  }, [state.isPlaying]);

  const handleSeek = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    // CRITICAL: Block seeking during ads (pre-roll, mid-roll, post-roll)
    if (state.currentAd) {
      console.log('⚠️ Seeking blocked during ad playback');
      return;
    }

    video.currentTime = time;
  }, [state.currentAd]);

  const handleVolumeChange = useCallback((volume: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = volume;
  }, []);

  const handleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
  }, []);

  const handleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!state.fullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [state.fullscreen]);

  const handleSkipAd = useCallback(async () => {
    if (!state.currentAd) return;

    console.log('🔍 SKIP AD DEBUG:', {
      playbackPhase: state.playbackPhase,
      currentAdId: state.currentAd?.id,
      adType: state.currentAd
    });

    adManagerRef.current?.onAdSkip(state.currentAd.id);
    
    // Call event hook
    callEventHook('onSkip', state.currentAd);
    
    const video = videoRef.current;
    if (video) {
      // Ensure pause completes before proceeding
      try {
        video.pause();
        // Wait a bit to ensure pause is processed
        await new Promise(resolve => setTimeout(resolve, 50));
        
        if (state.playbackPhase === 'preroll') {
          // Check for more pre-roll ads
          const nextPreRollAd = adManagerRef.current?.getPreRollAd();
          if (nextPreRollAd) {
            updateState({ 
              currentAd: nextPreRollAd, 
              showSkipButton: false, 
              adProgress: 0,
              playbackPhase: 'preroll'  // Ensure phase stays as preroll
            });
            
            // Update analytics context and call event hook for new ad started
            updateAnalyticsContext('ad', nextPreRollAd);
            callEventHook('onAdStarted', nextPreRollAd);
            
            await switchVideoSource(nextPreRollAd.url, undefined, false, false, 'ad');
            // Wait for load to complete before playing
            await new Promise(resolve => {
              const onLoadedData = () => {
                video.removeEventListener('loadeddata', onLoadedData);
                resolve(undefined);
              };
              video.addEventListener('loadeddata', onLoadedData);
            });
            await video.play().catch(error => {});
          } else {
            // All pre-roll ads done, use shared transition function
            await transitionToMainContent('skipped');
          }
        } else if (state.playbackPhase === 'content' || state.playbackPhase === 'midroll') {
          // PHASE 4: Check if there's another ad in the chain
          if (adChainActiveRef.current && adManagerRef.current) {
            const cuePoint = Math.floor(seekAfterChainRef.current);
            const currentChainIndex = adChainIndexRef.current;
            const nextAdResult = adManagerRef.current.getNextAdInChain(cuePoint, currentChainIndex);
            
            if (nextAdResult) {
              const { ad: nextAd, chainInfo } = nextAdResult;
              
              // Update chain index
              adChainIndexRef.current = chainInfo.chainIndex;
              
              // Update state with next ad (stay in midroll phase)
              updateState({ 
                currentAd: nextAd, 
                showSkipButton: false, 
                adProgress: 0,
                playbackPhase: 'midroll'  // Stay in midroll phase during chain
              });
              
              console.log(`🔗 PHASE 4: Loading next ad in chain after skip (${chainInfo.chainIndex + 1}/${chainInfo.chainLength}) - MP4→MP4 transition`);
              
              // Update analytics context and call event hook for new ad started
              updateAnalyticsContext('ad', nextAd);
              callEventHook('onAdStarted', nextAd);
              
              // MP4→MP4 transition (no content init)
              await switchVideoSource(nextAd.url, undefined, false, false, 'ad');
              
              // Wait for load to complete before playing
              await new Promise(resolve => {
                const onLoadedData = () => {
                  video.removeEventListener('loadeddata', onLoadedData);
                  resolve(undefined);
                };
                video.addEventListener('loadeddata', onLoadedData);
              });
              await video.play().catch(error => {});
              
              // Chain continues - don't resume content yet
              return;
            } else {
              // No more ads in chain - mark chain as complete
              adChainActiveRef.current = false;
              console.log(`✅ PHASE 4: Ad chain completed after skip - resuming content at ${seekAfterChainRef.current.toFixed(2)}s`);
            }
          }
          
          // Mid-roll ad skipped (or chain completed), return to main content
          const resumeTime = seekAfterChainRef.current || resumeTimeRef.current;
          console.log('✅ Mid-roll ad skipped - resuming main content');
          console.log('📺 Resuming at time:', resumeTime);
          
          // CRITICAL: Set position guard to prevent mid-roll re-trigger until video advances
          lastResumeTargetRef.current = resumeTime;
          resumeGuardUntilPositionRef.current = resumeTime + 0.75;
          console.log('🔒 Position guard set: suppress mid-rolls until', resumeGuardUntilPositionRef.current);
          
          // CRITICAL: Abort any previous transition event listeners
          if (transitionAbortControllerRef.current) {
            transitionAbortControllerRef.current.abort();
          }
          transitionAbortControllerRef.current = new AbortController();
          const signal = transitionAbortControllerRef.current.signal;
            
            // CRITICAL: Clear synchronous blocking flag FIRST (immediate effect)
            blockStreamingInitRef.current = false;
            console.log('✅ Synchronous blocking flag CLEARED - StreamingManager can now init');
            
          // CRITICAL: Force-clear ad state BEFORE switching back
          updateState({ currentAd: null, showSkipButton: false, buffering: true, playbackPhase: 'content' });
          
          // CRITICAL: Set time-based cooldown to prevent immediate mid-roll re-trigger
          resumeCooldownUntilRef.current = performance.now() + 1200;
          console.log('🔒 Time-based cooldown activated (1200ms)');
          
          // CRITICAL: Call onContentResumeRequested hook
          callEventHook('onContentResumeRequested', {
            url: config.src.url,
            resumeTime: resumeTime,
            reason: 'ad_skipped'
          });
          
          // CRITICAL: Double-flush state through two RAF ticks to avoid stale phase in effects/guards
          await new Promise(r => requestAnimationFrame(() => r(undefined)));
          await new Promise(r => requestAnimationFrame(() => r(undefined)));
          
          // Belt-and-suspenders: Ensure block flag is clear before content resume
          if (blockStreamingInitRef.current) {
            console.log('⚡ Clearing stale block flag before content resume');
            blockStreamingInitRef.current = false;
          }
          
          console.log('🔄 Switching back to main content (DASH/HLS) after skip');
          await switchVideoSource(config.src.url, config.src.mimeType, true, true, 'content'); // Skip stale check + force + content
          
          if (signal.aborted) return;
          
          // CRITICAL: Wait for video to be seekable at the specific resume time
          console.log('⏳ Waiting for video to be seekable at resume time:', resumeTime);
          await waitForSeekableTime(resumeTime, signal);
          
          if (signal.aborted) return;
          
          // CRITICAL: Record current time BEFORE seeking
          const timeBeforeSeek = video.currentTime;
          console.log('📍 Current position before seek:', timeBeforeSeek);
          
          // Now set the resume time
          console.log('⏩ Setting resume time:', resumeTime);
          video.currentTime = resumeTime;
          
          // CRITICAL: Wait for seek to complete before playing
          console.log('⏳ Waiting for seek to complete...');
          await new Promise<void>((resolve) => {
            if (signal.aborted) {
              resolve();
              return;
            }
            
            const onSeeked = () => {
              if (!signal.aborted) {
                console.log('✅ Seek completed to:', video.currentTime);
                resolve();
              }
            };
            
            // Only skip seek wait if we were ALREADY at the target position BEFORE setting it
            // Don't trust video.currentTime after setting it - it updates synchronously but seek is async
            if (Math.abs(timeBeforeSeek - resumeTime) < 0.5) {
              console.log('✅ Already at resume position (no seek needed)');
              resolve();
              return;
            }
            
            console.log('⏳ Seeking from', timeBeforeSeek, 'to', resumeTime);
            video.addEventListener('seeked', onSeeked, { once: true, signal });
            
            // Timeout fallback
          setTimeout(() => {
              if (!signal.aborted) {
                console.warn('⚠️ Seek timeout - proceeding anyway at:', video.currentTime);
                video.removeEventListener('seeked', onSeeked);
                resolve();
              }
          }, 2000);
          });
          
          if (signal.aborted) return;
          
          // CRITICAL: Pause video during buffer delay to prevent timeupdate from triggering mid-rolls
          video.pause();
          console.log('⏸️  Paused video to prevent mid-roll re-trigger during buffer delay');
          
          // CRITICAL: Give DASH.js time to request and buffer segments after seek
          // Without this delay, video.play() fails because no data is buffered yet
          console.log('⏳ Giving DASH 800ms to buffer segments after seek...');
          await new Promise(resolve => setTimeout(resolve, 800));
          
          if (signal.aborted) return;
          
          // DETERMINISTIC: Start playback - DASH should have buffered by now
          console.log('▶️ Calling play() at resume time:', video.currentTime);
          const playErr = await video.play().catch(e => e);
          
          if (playErr && String(playErr?.name).includes('NotAllowed')) {
            console.warn('⚠️ Autoplay blocked after skip — awaiting user gesture');
            updateState({ buffering: false, isPlaying: false });
            return; // UI will show Play; user click will resume
          }
          
          // Wait for playback to actually start (playing event OR time advancing)
          await waitForResumeStart(signal);
          
          if (!signal.aborted) {
            const actuallyPlaying = !video.paused && video.readyState >= 2;
            updateState({ buffering: false, isPlaying: actuallyPlaying });
            console.log('✅ Resume settled; playing:', actuallyPlaying);
          }
          
          enhancedTrackEvent('seek', { currentTime: resumeTime, reason: 'midroll_skip_resume' });
        } else if (state.playbackPhase === 'postroll') {
          // Check for more post-roll ads
          const nextPostRollAd = adManagerRef.current?.getPostRollAd();
          if (nextPostRollAd) {
            updateState({ currentAd: nextPostRollAd, showSkipButton: false, adProgress: 0, playbackPhase: 'postroll' });
            
            // Call event hook for new ad started
            callEventHook('onAdStarted', nextPostRollAd);
            
            await switchVideoSource(nextPostRollAd.url, undefined, false, false, 'ad');
            // Wait for load to complete before playing
            await new Promise(resolve => {
              const onLoadedData = () => {
                video.removeEventListener('loadeddata', onLoadedData);
                resolve(undefined);
              };
              video.addEventListener('loadeddata', onLoadedData);
            });
            await video.play().catch(error => {});
          } else {
            // All post-roll ads done
            updateState({ isPlaying: false, currentAd: null, showSkipButton: false, showReplay: true, buffering: false, playbackPhase: 'content' });
            enhancedTrackEvent('complete', { reason: 'all_ads_skipped' });
          }
        }
      } catch (error) {
        enhancedTrackEvent('error', { error: (error as Error).message });
      }
    }
  }, [state.currentAd, state.playbackPhase, state.mainContentTime, config.src, updateState, enhancedTrackEvent, callEventHook, updateAnalyticsContext, switchVideoSource, transitionToMainContent, waitForSeekableTime, waitForResumeStart]);

  const handleAdClick = useCallback((url?: string) => {
    if (!state.currentAd) return;

    adManagerRef.current?.onAdClick(state.currentAd.id, url);
    
    if (url) {
      window.open(url, '_blank');
    }
  }, [state.currentAd]);

  const handleInteractiveAdAction = useCallback((action: string, data: any) => {
    if (!state.currentAd) return;

    adManagerRef.current?.onAdInteraction(state.currentAd.id, action, data);
  }, [state.currentAd]);

  const handleReplay = useCallback(async () => {
    
    // Reset all managers and state
    adManagerRef.current?.reset();
    isInitializedRef.current = false; // Reset initialization flag for replay
    resumeTimeRef.current = 0; // Reset resume time
    updateState({
      showReplay: false,
      currentAd: null,
      isPlaying: false,
      currentTime: 0,
      mainContentTime: 0,
      previousTime: 0,
      playbackPhase: 'preroll',
      showSkipButton: false,
      interactiveAdActive: false,
      error: null
    });

    // Start over with pre-roll ads
    const video = videoRef.current;
    if (video) {
      const preRollAd = adManagerRef.current?.getPreRollAd();
      if (preRollAd) {
        updateState({ 
          currentAd: preRollAd, 
          adProgress: 0,
          playbackPhase: 'preroll'  // Set correct phase for pre-roll ads
        });
        await switchVideoSource(preRollAd.url, undefined, false, false, 'ad');
        video.play().catch(error => {});
      } else {
        // No pre-roll ads, start main content
        updateState({ playbackPhase: 'content' });
        await switchVideoSource(config.src.url, config.src.mimeType);
        video.currentTime = 0;
        video.play().catch(error => {});
      }
    }

    enhancedTrackEvent('replay', { timestamp: Date.now() });
  }, [config.src, updateState, trackEvent]);

  const [clickIndicator, setClickIndicator] = useState<{ show: boolean; icon: string }>({ show: false, icon: '' });

  const handleVideoClick = useCallback((event: React.MouseEvent) => {
    // Prevent click from bubbling to controls
    event.stopPropagation();
    
    // Show click indicator for both ads and content
    const newPlayState = !state.isPlaying;
    setClickIndicator({ show: true, icon: newPlayState ? '▶️' : '⏸️' });
    
    // Hide indicator after animation
    setTimeout(() => {
      setClickIndicator({ show: false, icon: '' });
    }, 300);
    
    // Toggle play/pause for both ads and content
    handlePlayPause();
  }, [state.isPlaying, handlePlayPause]);

  // Settings handlers
  const handleSettings = useCallback(() => {
    updateState({ showSettings: !state.showSettings });
    enhancedTrackEvent(state.showSettings ? 'settings_close' : 'settings_open', {});
  }, [state.showSettings, updateState, trackEvent]);

  const handleQualityChange = useCallback((quality: any) => {
    const oldQuality = state.currentQuality;
    updateState({ currentQuality: quality });
    enhancedTrackEvent('quality_change', { quality });
    
    // Call event hook
    callEventHook('onQualityChange', oldQuality, quality);
  }, [updateState, trackEvent, state.currentQuality, callEventHook]);

  // Simplified subtitle management - using custom overlay instead of HTML5 tracks

  const handleSubtitleChange = useCallback((subtitle: any) => {
    updateState({ currentSubtitle: subtitle });
    enhancedTrackEvent('subtitle_change', { subtitle });
    
    // Call event hook
    callEventHook('onSubtitleChange', subtitle);
  }, [updateState, trackEvent, callEventHook]);

  const handleSpeedChange = useCallback((speed: number) => {
    updateState({ playbackSpeed: speed });
    enhancedTrackEvent('speed_change', { speed });
    
    const video = videoRef.current;
    if (video) {
      video.playbackRate = speed;
    }
  }, [updateState, trackEvent]);

  // Handle download functionality
  const handleDownload = useCallback(() => {
    if (!config.offline?.downloadEnabled || isOfflineMode) return;
    setShowDownloadOverlay(true);
  }, [config.offline?.downloadEnabled, isOfflineMode]);

  const handleDownloadStart = useCallback(() => {
    const videoId = btoa(config.src.url).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
    enhancedTrackEvent('download_start', { videoId, url: config.src.url });
  }, [config.src.url, trackEvent]);

  const handleDownloadComplete = useCallback((offlineVideo: OfflineVideo) => {
    enhancedTrackEvent('download_complete', { 
      videoId: offlineVideo.id, 
      size: offlineVideo.size,
      title: offlineVideo.title 
    });
    setDownloadProgress(null);
    setShowDownloadOverlay(false);
  }, [trackEvent]);

  const handleDownloadError = useCallback((error: Error) => {
    enhancedTrackEvent('download_failed', { error: error.message });
    setDownloadProgress(null);
    console.error('Download failed:', error);
  }, [trackEvent]);

  // Handle thumbnail hover (optimized to prevent unnecessary updates)
  const handleThumbnailHover = useCallback((hoveredTime: number, relativeX: number, seekBarWidth: number, isVisible: boolean) => {
    setThumbnailState({
      isVisible,
      hoveredTime,
      relativeX,
      seekBarWidth
    });
  }, []);

  // Pre-warm thumbnail system when video loads
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoadedMetadata = () => {
      // Main video metadata loaded - thumbnail system ready
    };

    // Listen for metadata load to enable immediate thumbnails
    if (video.readyState >= 1) {
      onLoadedMetadata();
    } else {
      video.addEventListener('loadedmetadata', onLoadedMetadata);
    }

    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
  }, []);


  // No complex subtitle management needed - using custom overlay

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      updateState({ fullscreen: !!document.fullscreenElement });
      enhancedTrackEvent('fullscreen', { fullscreen: !!document.fullscreenElement });
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [updateState, trackEvent]);

  // Cleanup
  useEffect(() => {
    return () => {
      // Abort any in-flight transitions
      if (transitionAbortControllerRef.current) {
        transitionAbortControllerRef.current.abort();
      }
      drmManagerRef.current?.cleanup();
      streamingManagerRef.current?.cleanup();
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`media-player ${state.fullscreen ? 'fullscreen' : ''} ${config.ui?.theme || 'dark'}`}
    >
      <div className="video-container" onClick={handleVideoClick}>
        <video
          ref={videoRef}
          className="video-element"
          playsInline
          preload="metadata"
          crossOrigin="anonymous"
          onContextMenu={(e) => {
            // Block right-click context menu during ads to prevent native seeking
            if (state.currentAd) {
              e.preventDefault();
              console.log('⚠️ Context menu blocked during ad playback');
            }
          }}
        />
        
        {state.buffering && (
          <div className="buffering-overlay">
            <div className="spinner"></div>
          </div>
        )}

        {clickIndicator.show && (
          <div className="click-indicator">
            {clickIndicator.icon}
          </div>
        )}

        {state.error && (
          <div className="error-overlay">
            <div className="error-message">
              <h3>Playback Error</h3>
              <p>{state.error}</p>
            </div>
          </div>
        )}

        {state.currentAd && (
          <AdOverlay
            ad={state.currentAd}
            progress={state.adProgress}
            showSkipButton={state.showSkipButton}
            onSkip={handleSkipAd}
            onClick={handleAdClick}
            isPlaying={state.isPlaying}
            onPlayPause={handlePlayPause}
          />
        )}

        {state.currentAd?.interactive && (
          <InteractiveAdOverlay
            ad={state.currentAd}
            onAction={handleInteractiveAdAction}
          />
        )}

        {state.showReplay && (
          <ReplayOverlay onReplay={handleReplay} />
        )}

        {/* Custom Subtitle Overlay - bypasses CORS issues */}
        <SubtitleOverlay
          subtitle={state.currentSubtitle}
          currentTime={state.currentTime}
          isVisible={!state.currentAd && !!state.currentSubtitle}
        />
      </div>

      {(config.ui?.showControls !== false) && !state.currentAd && (
        <PlayerControls
          state={state}
          onPlayPause={handlePlayPause}
          onSeek={handleSeek}
          onVolumeChange={handleVolumeChange}
          onMute={handleMute}
          onFullscreen={handleFullscreen}
          onPictureInPicture={togglePiP}
          onSettings={handleSettings}
          onDownload={handleDownload}
          isPiPSupported={isPiPSupported}
          isPiPActive={isPiPActive}
          isAd={!!state.currentAd}
          showDownload={config.ui?.showDownload && config.offline?.downloadEnabled}
          chapters={config.src.chapters}
          onThumbnailHover={handleThumbnailHover}
        />
      )}

      {state.showSettings && config.ui?.showSettings && (
        <SettingsMenu
          state={state}
          qualities={config.src.qualities}
          subtitles={config.src.subtitles}
          onQualityChange={handleQualityChange}
          onSubtitleChange={handleSubtitleChange}
          onSpeedChange={handleSpeedChange}
          onClose={handleSettings}
        />
      )}

      {/* Download Overlay */}
      {showDownloadOverlay && config.offline && (
        <div className="download-overlay">
          <div className="download-modal">
            <DownloadControls
              videoId={btoa(config.src.url).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16)}
              videoTitle={config.src.url.split('/').pop() || 'Video'}
              videoUrl={config.src.url}
              mimeType={config.src.mimeType || 'video/mp4'}
              quality={state.currentQuality || undefined}
              subtitles={config.src.subtitles}
              offlineConfig={config.offline}
              onDownloadStart={handleDownloadStart}
              onDownloadComplete={handleDownloadComplete}
              onDownloadError={handleDownloadError}
            />
            <button 
              className="download-close"
              onClick={() => setShowDownloadOverlay(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Thumbnail Preview */}
      <ThumbnailPreview
        videoElement={videoRef.current}
        isVisible={thumbnailState.isVisible}
        hoveredTime={thumbnailState.hoveredTime}
        relativeX={thumbnailState.relativeX}
        seekBarWidth={thumbnailState.seekBarWidth}
        duration={state.duration}
      />
    </div>
  );
};

export default MediaPlayer;
