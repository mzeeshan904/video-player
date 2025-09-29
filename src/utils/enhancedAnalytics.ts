import { PlayerConfig, AnalyticsEvent } from '../types';

// 📊 Enhanced Analytics Event Structure
export interface EnhancedAnalyticsEvent {
  sessionId: string;
  contentId: string;
  eventName: string;
  timestamp: number;
  userId: string;
  
  contentMetadata: {
    title: string;
    duration: number;
    contentType: 'content' | 'ad';
    protocol: number;
    contentUri: string;
    startTimeInSeconds: number;
    showSeekbar: boolean;
    skippable: boolean;
    isAd: boolean;
    isSkippable: boolean;
    hasSeekbar: boolean;
  };

  playerData: {
    currentTime: number;
    duration: number;
    bandwidth: number;
    isPaused: boolean;
    isFullscreen: boolean;
    volume: number;
    playbackRate: number;
    quality: string;
    buffered: TimeRanges | null;
  };

  sessionDuration: number;
  engagementScore: number;

  engagementMetrics: {
    totalWatchTime: number;
    uniqueViewTime: number;
    replayCount: number;
    seekCount: number;
    pauseCount: number;
    resumeCount: number;
    qualityChangeCount: number;
    volumeChangeCount: number;
    fullscreenCount: number;
    interactionCount: number;
    averageViewingSession: number;
    contentCompletionRate: number;
    engagementScore: number;
  };

  performanceMetrics: {
    initialLoadTime: number;
    bufferingTime: number;
    bufferingCount: number;
    averageBitrate: number;
    bitrateChanges: number;
    errorCount: number;
    rebufferRatio: number;
    startupTime: number;
    videoStartFailures: number;
    averageFrameRate: number;
    droppedFrames: number;
  };

  qualityMetrics: {
    currentBandwidth: number;
    bandwidthHistory: Array<{ timestamp: number; bandwidth: number }>;
    qualityHistory: Array<{ timestamp: number; quality: string; bandwidth: number }>;
  };

  deviceInfo: {
    userAgent: string;
    screenWidth: number;
    screenHeight: number;
    connectionType: string;
    deviceMemory: number;
  };

  // Additional player state info
  playlistLength: number;
  position: number;
  bandwidth: number;
  isPaused: boolean;
  isFullscreen: boolean;
  playbackState: 'playing' | 'paused' | 'buffering' | 'ended' | 'error';
  isAd: boolean;
}

// 🎯 Event Name Mappings
export const EVENT_NAMES = {
  // Playback Events
  PLAY: 'onPlay',
  PAUSE: 'onPause', 
  RESUME: 'onResume',
  SEEK: 'onSeek',
  REPLAY: 'onReplay',
  COMPLETE: 'onComplete',
  
  // Ad Events
  AD_START: 'onAdStart',
  AD_COMPLETE: 'onAdComplete', 
  AD_SKIP: 'onAdSkip',
  AD_ERROR: 'onAdError',
  
  // Quality & Performance
  QUALITY_CHANGE: 'onQualityChange',
  BUFFERING_START: 'onBufferingStart',
  BUFFERING_END: 'onBufferingEnd',
  ERROR: 'onError',
  
  // User Interaction
  VOLUME_CHANGE: 'onVolumeChange',
  FULLSCREEN_ENTER: 'onFullscreenEnter',
  FULLSCREEN_EXIT: 'onFullscreenExit',
  PLAYBACK_RATE_CHANGE: 'onPlaybackRateChange',
  SUBTITLE_TOGGLE: 'onSubtitleToggle',
} as const;

// 📈 Analytics Manager Class
export class EnhancedAnalyticsManager {
  private sessionId: string;
  private contentId: string;
  private userId: string;
  private sessionStartTime: number;
  private config: PlayerConfig;
  private videoElement: HTMLVideoElement | null = null;
  
  // Engagement tracking
  private engagementMetrics = {
    totalWatchTime: 0,
    uniqueViewTime: 0,
    replayCount: 0,
    seekCount: 0,
    pauseCount: 0,
    resumeCount: 0,
    qualityChangeCount: 0,
    volumeChangeCount: 0,
    fullscreenCount: 0,
    interactionCount: 0,
    averageViewingSession: 0,
    contentCompletionRate: 0,
    engagementScore: 0,
  };

  // Performance tracking
  private performanceMetrics = {
    initialLoadTime: 0,
    bufferingTime: 0,
    bufferingCount: 0,
    averageBitrate: 0,
    bitrateChanges: 0,
    errorCount: 0,
    rebufferRatio: 0,
    startupTime: 0,
    videoStartFailures: 0,
    averageFrameRate: 0,
    droppedFrames: 0,
  };

  // Quality tracking
  private qualityMetrics = {
    currentBandwidth: 0,
    bandwidthHistory: [] as Array<{ timestamp: number; bandwidth: number }>,
    qualityHistory: [] as Array<{ timestamp: number; quality: string; bandwidth: number }>,
  };

  // Session tracking
  private lastPlayTime = 0;
  private totalPauseTime = 0;
  private bufferingStartTime = 0;
  private watchedIntervals: Array<{ start: number; end: number }> = [];

  constructor(config: PlayerConfig, userId: string = '') {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.contentId = `content_${Date.now()}`;
    this.userId = userId;
    this.sessionStartTime = Date.now();
    this.config = config;
    this.performanceMetrics.startupTime = Date.now() - this.sessionStartTime;
  }

  // 🎬 Initialize with video element
  public setVideoElement(video: HTMLVideoElement): void {
    this.videoElement = video;
    this.setupPerformanceTracking();
  }

  // 🔧 Setup performance tracking
  private setupPerformanceTracking(): void {
    if (!this.videoElement) return;

    // Track video quality metrics
    if ('getVideoPlaybackQuality' in this.videoElement) {
      const updateQualityMetrics = () => {
        const quality = (this.videoElement as any).getVideoPlaybackQuality();
        if (quality) {
          this.performanceMetrics.droppedFrames = quality.droppedVideoFrames || 0;
          this.performanceMetrics.averageFrameRate = quality.totalVideoFrames / 
            (this.getSessionDuration() / 1000) || 0;
        }
      };

      setInterval(updateQualityMetrics, 5000); // Update every 5 seconds
    }

    // Track bandwidth changes
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        this.qualityMetrics.currentBandwidth = connection.downlink * 1000000; // Convert to bps
        
        connection.addEventListener('change', () => {
          const bandwidth = connection.downlink * 1000000;
          this.qualityMetrics.currentBandwidth = bandwidth;
          this.qualityMetrics.bandwidthHistory.push({
            timestamp: Date.now(),
            bandwidth
          });
        });
      }
    }
  }

  // 📊 Generate comprehensive analytics event
  public logEvent(eventName: string, additionalPayload?: any): EnhancedAnalyticsEvent {
    const event: EnhancedAnalyticsEvent = {
      sessionId: this.sessionId,
      contentId: this.contentId,
      eventName,
      timestamp: Date.now(),
      userId: this.userId,

      contentMetadata: this.getContentMetadata(),
      playerData: this.getPlayerData(),
      sessionDuration: this.getSessionDuration(),
      engagementScore: this.calculateEngagementScore(),
      
      engagementMetrics: { ...this.engagementMetrics },
      performanceMetrics: { ...this.performanceMetrics },
      qualityMetrics: { ...this.qualityMetrics },
      deviceInfo: this.getDeviceInfo(),

      // Additional state info
      playlistLength: this.config.ads ? 
        (this.config.ads.preRoll?.length || 0) + 
        (this.config.ads.midRoll?.length || 0) + 
        (this.config.ads.postRoll?.length || 0) + 1 : 1,
      position: this.videoElement?.currentTime || 0,
      bandwidth: this.qualityMetrics.currentBandwidth,
      isPaused: this.videoElement?.paused || false,
      isFullscreen: !!document.fullscreenElement,
      playbackState: this.getPlaybackState(),
      isAd: this.isCurrentlyPlayingAd(),
    };

    // Send to analytics backend or callback
    this.sendToAnalytics(event);
    
    return event;
  }

  // 🎯 Track specific events with metrics updates
  public trackPlay(): void {
    this.engagementMetrics.interactionCount++;
    if (this.lastPlayTime === 0) {
      this.performanceMetrics.initialLoadTime = Date.now() - this.sessionStartTime;
    }
    this.lastPlayTime = Date.now();
    this.logEvent(EVENT_NAMES.PLAY);
  }

  public trackPause(): void {
    this.engagementMetrics.pauseCount++;
    this.engagementMetrics.interactionCount++;
    if (this.lastPlayTime > 0) {
      const watchTime = Date.now() - this.lastPlayTime;
      this.engagementMetrics.totalWatchTime += watchTime;
    }
    this.logEvent(EVENT_NAMES.PAUSE);
  }

  public trackResume(): void {
    this.engagementMetrics.resumeCount++;
    this.engagementMetrics.interactionCount++;
    this.lastPlayTime = Date.now();
    this.logEvent(EVENT_NAMES.RESUME);
  }

  public trackSeek(fromTime: number, toTime: number): void {
    this.engagementMetrics.seekCount++;
    this.engagementMetrics.interactionCount++;
    this.logEvent(EVENT_NAMES.SEEK, { fromTime, toTime });
  }

  public trackBufferingStart(): void {
    this.performanceMetrics.bufferingCount++;
    this.bufferingStartTime = Date.now();
    this.logEvent(EVENT_NAMES.BUFFERING_START);
  }

  public trackBufferingEnd(): void {
    if (this.bufferingStartTime > 0) {
      const bufferingDuration = Date.now() - this.bufferingStartTime;
      this.performanceMetrics.bufferingTime += bufferingDuration;
      this.bufferingStartTime = 0;
    }
    this.logEvent(EVENT_NAMES.BUFFERING_END);
  }

  public trackQualityChange(newQuality: string, bandwidth: number): void {
    this.engagementMetrics.qualityChangeCount++;
    this.qualityMetrics.qualityHistory.push({
      timestamp: Date.now(),
      quality: newQuality,
      bandwidth
    });
    this.logEvent(EVENT_NAMES.QUALITY_CHANGE, { quality: newQuality, bandwidth });
  }

  public trackVolumeChange(volume: number): void {
    this.engagementMetrics.volumeChangeCount++;
    this.engagementMetrics.interactionCount++;
    this.logEvent(EVENT_NAMES.VOLUME_CHANGE, { volume });
  }

  public trackFullscreenChange(isFullscreen: boolean): void {
    if (isFullscreen) {
      this.engagementMetrics.fullscreenCount++;
      this.logEvent(EVENT_NAMES.FULLSCREEN_ENTER);
    } else {
      this.logEvent(EVENT_NAMES.FULLSCREEN_EXIT);
    }
    this.engagementMetrics.interactionCount++;
  }

  public trackError(error: any): void {
    this.performanceMetrics.errorCount++;
    this.logEvent(EVENT_NAMES.ERROR, { error: error.message || error });
  }

  public trackComplete(): void {
    this.engagementMetrics.contentCompletionRate = 100;
    this.logEvent(EVENT_NAMES.COMPLETE);
  }

  public trackReplay(): void {
    this.engagementMetrics.replayCount++;
    this.engagementMetrics.interactionCount++;
    this.logEvent(EVENT_NAMES.REPLAY);
  }

  // 📋 Helper methods for data collection
  private getContentMetadata() {
    const isAd = this.isCurrentlyPlayingAd();
    return {
      title: isAd ? 'Ad Content' : 'Main Content',
      duration: this.videoElement?.duration || 0,
      contentType: isAd ? 'ad' as const : 'content' as const,
      protocol: this.detectProtocol(),
      contentUri: this.config.src.url,
      startTimeInSeconds: 0,
      showSeekbar: this.config.ui?.showControls !== false,
      skippable: false,
      isAd,
      isSkippable: false,
      hasSeekbar: this.config.ui?.showControls !== false,
    };
  }

  private getPlayerData() {
    return {
      currentTime: this.videoElement?.currentTime || 0,
      duration: this.videoElement?.duration || 0,
      bandwidth: this.qualityMetrics.currentBandwidth,
      isPaused: this.videoElement?.paused || false,
      isFullscreen: !!document.fullscreenElement,
      volume: this.videoElement?.volume || 0,
      playbackRate: this.videoElement?.playbackRate || 1,
      quality: this.getCurrentQuality(),
      buffered: this.videoElement?.buffered || null,
    };
  }

  private getSessionDuration(): number {
    return Date.now() - this.sessionStartTime;
  }

  private calculateEngagementScore(): number {
    const sessionMinutes = this.getSessionDuration() / (1000 * 60);
    const watchTimeMinutes = this.engagementMetrics.totalWatchTime / (1000 * 60);
    const engagementRatio = sessionMinutes > 0 ? (watchTimeMinutes / sessionMinutes) * 100 : 0;
    
    // Add bonus points for interactions
    const interactionBonus = Math.min(this.engagementMetrics.interactionCount * 5, 30);
    
    return Math.min(Math.round(engagementRatio + interactionBonus), 100);
  }

  private getDeviceInfo() {
    const connection = (navigator as any).connection;
    return {
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      connectionType: connection?.effectiveType || '4g',
      deviceMemory: (navigator as any).deviceMemory || 8,
    };
  }

  private detectProtocol(): number {
    const url = this.config.src.url.toLowerCase();
    if (url.includes('.m3u8')) return 1; // HLS
    if (url.includes('.mpd')) return 2; // DASH
    return 12; // Regular MP4/WebM
  }

  private getCurrentQuality(): string {
    // This would be enhanced to get actual quality from streaming managers
    return 'auto';
  }

  private getPlaybackState(): 'playing' | 'paused' | 'buffering' | 'ended' | 'error' {
    if (!this.videoElement) return 'paused';
    
    if (this.videoElement.ended) return 'ended';
    if (this.videoElement.paused) return 'paused';
    if (this.videoElement.readyState < 3) return 'buffering';
    
    return 'playing';
  }

  private isCurrentlyPlayingAd(): boolean {
    // This would be enhanced to detect ad state from ad manager
    return false;
  }

  private sendToAnalytics(event: EnhancedAnalyticsEvent): void {
    // Send to external analytics service
    if (this.config.analytics?.onEvent) {
      // Convert to legacy format for backward compatibility
      const legacyEvent: AnalyticsEvent = {
        type: this.mapEventNameToLegacyType(event.eventName),
        timestamp: event.timestamp,
        payload: event,
      };
      this.config.analytics.onEvent(legacyEvent);
    }

    // Send to analytics endpoint if configured
    if (this.config.analytics?.endpoint) {
      this.sendToEndpoint(event);
    }

    // Log for debugging
    // Event logged through external callback if configured
  }

  private mapEventNameToLegacyType(eventName: string): any {
    const mapping: Record<string, string> = {
      [EVENT_NAMES.PLAY]: 'play',
      [EVENT_NAMES.PAUSE]: 'pause', 
      [EVENT_NAMES.SEEK]: 'seek',
      [EVENT_NAMES.VOLUME_CHANGE]: 'volumechange',
      [EVENT_NAMES.FULLSCREEN_ENTER]: 'fullscreen',
      [EVENT_NAMES.FULLSCREEN_EXIT]: 'fullscreen',
      [EVENT_NAMES.ERROR]: 'error',
      [EVENT_NAMES.COMPLETE]: 'complete',
      [EVENT_NAMES.BUFFERING_START]: 'buffering_start',
      [EVENT_NAMES.BUFFERING_END]: 'buffering_end',
    };
    return mapping[eventName] || eventName;
  }

  private async sendToEndpoint(event: EnhancedAnalyticsEvent): Promise<void> {
    try {
      await fetch(this.config.analytics!.endpoint!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
  }
}
