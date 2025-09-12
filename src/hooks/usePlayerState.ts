import { useState, useCallback } from 'react';
import { PlayerState, AnalyticsEvent } from '../types';

export const usePlayerState = (onAnalyticsEvent?: (event: AnalyticsEvent) => void) => {
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

  const updateState = useCallback((updates: Partial<PlayerState>) => {
    setState((prev: PlayerState) => ({ ...prev, ...updates }));
  }, []);

  const trackEvent = useCallback((type: AnalyticsEvent['type'], payload?: any) => {
    const event: AnalyticsEvent = {
      type,
      timestamp: Date.now(),
      payload,
    };

    // Analytics event tracked

    // Call external analytics handler if provided
    if (onAnalyticsEvent) {
      onAnalyticsEvent(event);
    }
  }, [onAnalyticsEvent]);

  return {
    state,
    updateState,
    trackEvent,
  };
};
