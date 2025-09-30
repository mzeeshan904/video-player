import { useState, useCallback, useRef, useEffect } from 'react';
import { PlayerState, AnalyticsEvent, PlayerConfig } from '../types';
import { EnhancedAnalyticsManager, EVENT_NAMES } from '../utils/enhancedAnalytics';

// Map legacy event types to enhanced event names
const mapLegacyTypeToEnhancedEventName = (legacyType: string): string => {
  const mapping: Record<string, string> = {
    'play': EVENT_NAMES.PLAY,
    'pause': EVENT_NAMES.PAUSE,
    'seek': EVENT_NAMES.SEEK,
    'volumechange': EVENT_NAMES.VOLUME_CHANGE,
    'fullscreen': EVENT_NAMES.FULLSCREEN_ENTER,
    'error': EVENT_NAMES.ERROR,
    'complete': EVENT_NAMES.COMPLETE,
    'buffering_start': EVENT_NAMES.BUFFERING_START,
    'buffering_end': EVENT_NAMES.BUFFERING_END,
    'ad_start': EVENT_NAMES.AD_START,
    'ad_complete': EVENT_NAMES.AD_COMPLETE,
    'ad_skip': EVENT_NAMES.AD_SKIP,
    'ad_click': 'onAdClick',
    'quality_change': EVENT_NAMES.QUALITY_CHANGE,
    'subtitle_change': EVENT_NAMES.SUBTITLE_TOGGLE,
    'speed_change': EVENT_NAMES.PLAYBACK_RATE_CHANGE,
    'replay': EVENT_NAMES.REPLAY,
  };
  
  return mapping[legacyType] || `on${legacyType.charAt(0).toUpperCase()}${legacyType.slice(1)}`;
};

export const useEnhancedPlayerState = (
  config: PlayerConfig,
  onAnalyticsEvent?: (event: AnalyticsEvent) => void
) => {
  const [state, setState] = useState<PlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    muted: false,
    fullscreen: false,
    buffering: false,
    error: null,
    currentAd: null,
    adProgress: 0,
    showSkipButton: false,
    interactiveAdActive: false,
    playbackPhase: 'preroll',
    mainContentTime: 0,
    previousTime: 0,
    showReplay: false,
    // Settings state
    currentQuality: null,
    currentSubtitle: null,
    playbackSpeed: 1,
    showSettings: false,
  });

  // Enhanced analytics manager
  const analyticsManagerRef = useRef<EnhancedAnalyticsManager | null>(null);
  const previousStateRef = useRef<PlayerState>(state);

  // Initialize enhanced analytics if enabled
  useEffect(() => {
    if (config.analytics?.enhancedAnalytics && !analyticsManagerRef.current) {
      analyticsManagerRef.current = new EnhancedAnalyticsManager(
        config,
        config.analytics.userId || ''
      );
    }
  }, [config]);

  // ✅ Re-enabled automatic state change tracking for core events
  // This ensures analytics work even without manual MediaPlayer calls
  useEffect(() => {
    const prevState = previousStateRef.current;
    const manager = analyticsManagerRef.current;
    
    if (!manager) return;

    // Track core playback state changes
    if (state.isPlaying !== prevState.isPlaying) {
      if (state.isPlaying) {
        manager.logEvent('onPlay', { currentTime: state.currentTime });
      } else if (!state.isPlaying && prevState.isPlaying) {
        manager.logEvent('onPause', { currentTime: state.currentTime });
      }
    }

    // Track seeking
    if (Math.abs(state.currentTime - prevState.currentTime) > 1 && 
        !state.isPlaying && !prevState.isPlaying) {
      manager.logEvent('onSeek', { currentTime: state.currentTime });
    }

    // Track buffering
    if (state.isBuffering !== prevState.isBuffering) {
      if (state.isBuffering) {
        manager.logEvent('onBuffering_start');
      } else {
        manager.logEvent('onBuffering_end');
      }
    }

    // Track volume changes
    if (state.volume !== prevState.volume) {
      manager.logEvent('onVolume_change', { volume: state.volume });
    }

    // Track quality changes
    if (state.currentQuality !== prevState.currentQuality) {
      manager.logEvent('onQuality_change', { quality: state.currentQuality });
    }

    // Track fullscreen changes
    if (state.isFullscreen !== prevState.isFullscreen) {
      manager.logEvent(state.isFullscreen ? 'onFullscreen_enter' : 'onFullscreen_exit');
    }

    // Track errors
    if (state.error && state.error !== prevState.error) {
      manager.logEvent('onError', { error: state.error });
    }

    // Track completion
    if (state.currentTime >= state.duration && state.duration > 0 && 
        prevState.currentTime < prevState.duration) {
      manager.logEvent('onComplete');
    }

    previousStateRef.current = state;
  }, [state]);

  const updateState = useCallback((updates: Partial<PlayerState>) => {
    setState((prev: PlayerState) => ({ ...prev, ...updates }));
  }, []);

  const trackEvent = useCallback((type: AnalyticsEvent['type'], payload?: any) => {
    if (analyticsManagerRef.current) {
      // Use enhanced analytics manager to generate comprehensive events
      // The EnhancedAnalyticsManager.logEvent() already calls config.analytics.onEvent
      // so we don't need to call onAnalyticsEvent again here to avoid duplicates
      analyticsManagerRef.current.logEvent(
        mapLegacyTypeToEnhancedEventName(type),
        payload
      );
    } else {
      // Fallback to legacy event if enhanced analytics not available
      const event: AnalyticsEvent = {
        type,
        timestamp: Date.now(),
        payload,
      };

      if (onAnalyticsEvent) {
        onAnalyticsEvent(event);
      }
    }
  }, [onAnalyticsEvent]);

  // Enhanced tracking methods
  const enhancedTracking = {
    setVideoElement: (video: HTMLVideoElement) => {
      analyticsManagerRef.current?.setVideoElement(video);
    },
    
    trackCustomEvent: (eventName: string, payload?: any) => {
      analyticsManagerRef.current?.logEvent(eventName, payload);
    },
    
    getAnalyticsManager: () => analyticsManagerRef.current,
  };

  return {
    state,
    updateState,
    trackEvent,
    enhancedTracking,
  };
};
