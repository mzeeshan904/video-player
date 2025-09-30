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
    totalPauseDuration: number;
    pauseResumeSessions: Array<{ pauseAt: number; resumeAt?: number; pauseDuration?: number }>;
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
// Current item state interface
interface CurrentItem {
  id: string;
  type: 'content' | 'ad';
  title: string;
  duration: number;
  contentUri: string;
  isAd: boolean;
  skippable?: boolean;
  skipAfter?: number;
  adTitle?: string;
  index?: number;
  startTime?: number;
}

export class EnhancedAnalyticsManager {
  private sessionId: string;
  private contentId: string;
  private userId: string;
  private sessionStartTime: number;
  private loadStartTime: number;
  private config: PlayerConfig;
  private videoElement: HTMLVideoElement | null = null;
  
  // Current item state tracking
  private currentItem: CurrentItem;
  private adLookupCache: Map<string, any> = new Map();
  
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
    totalPauseDuration: 0,
    pauseResumeSessions: [] as Array<{ pauseAt: number; resumeAt?: number; pauseDuration?: number }>,
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
  private firstPlayTimestamp = 0;
  private lastEventTimestamp = 0;
  private lastPlayTime = 0;
  private lastPauseTime = 0;
  private totalPauseTime = 0;
  private bufferingStartTime = 0;
  private watchedIntervals: Array<{ start: number; end: number }> = [];
  private hasEverPlayed = false;
  private isPaused = false;
  private pauseResumeSessions: Array<{ pauseAt: number; resumeAt?: number; pauseDuration?: number }> = [];
  
  // Event debouncing
  private lastEventTimes: Map<string, number> = new Map();
  private readonly EVENT_DEBOUNCE_THRESHOLD = 500; // milliseconds
  private lastSeekTime = 0;
  private readonly SEEK_DEBOUNCE_THRESHOLD = 0.5; // seconds
  
  // Frame rate smoothing
  private frameRateHistory: number[] = [];
  private readonly FRAME_RATE_HISTORY_SIZE = 5;
  
  // Separate ad tracking
  private adMetrics = {
    totalAdWatchTime: 0,
    adSkipCount: 0,
    adCompletionCount: 0,
    adInteractionCount: 0,
  };
  
  // Quality tracking
  private lastQuality: string | null = null;
  private lastBandwidth = 0;
  
  // Device orientation tracking
  private lastOrientation: string | null = null;
  
  // Store last generated event for debouncing
  private lastGeneratedEvent: EnhancedAnalyticsEvent | null = null;

  constructor(config: PlayerConfig, userId: string = '') {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.contentId = `content_${Date.now()}`;
    this.userId = userId;
    this.sessionStartTime = Date.now();
    this.loadStartTime = Date.now();
    this.config = config;
    
    // Initialize with main content item
    this.currentItem = this.createContentItem();
    
    // Build ad lookup cache for fast access
    this.buildAdLookupCache();
    
    this.performanceMetrics.startupTime = Date.now() - this.sessionStartTime;
  }

  // 🎬 Initialize with video element
  public setVideoElement(video: HTMLVideoElement): void {
    this.videoElement = video;
    this.setupPerformanceTracking();
    
    // Update current item duration from video element if available
    if (video.duration && !isNaN(video.duration)) {
      this.currentItem.duration = video.duration;
    }
  }

  // 🏗️ Create content item from config
  private createContentItem(): CurrentItem {
    const src = this.config.src;
    return {
      id: 'main_content',
      type: 'content',
      title: src.url.split('/').pop() || 'Main Content',
      duration: 0, // Will be updated when video loads
      contentUri: src.url,
      isAd: false,
      startTime: Date.now()
    };
  }

  // 🗂️ Build ad lookup cache for fast access
  private buildAdLookupCache(): void {
    if (!this.config.ads) return;

    // Cache pre-roll ads
    this.config.ads.preRoll?.forEach((ad, index) => {
      this.adLookupCache.set(ad.id, {
        ...ad,
        type: 'preroll',
        index: index + 1
      });
    });

    // Cache mid-roll ads
    this.config.ads.midRoll?.forEach((ad, index) => {
      this.adLookupCache.set(ad.id, {
        ...ad,
        type: 'midroll',
        index: index + 1
      });
    });

    // Cache post-roll ads
    this.config.ads.postRoll?.forEach((ad, index) => {
      this.adLookupCache.set(ad.id, {
        ...ad,
        type: 'postroll',
        index: index + 1
      });
    });
  }

  // 🔄 Switch to ad item
  public setCurrentAd(adId: string): void {
    const adConfig = this.adLookupCache.get(adId);
    if (adConfig) {
      this.currentItem = {
        id: adId,
        type: 'ad',
        title: adConfig.type,
        duration: adConfig.duration || 0,
        contentUri: adConfig.url,
        isAd: true,
        skippable: adConfig.skippable,
        skipAfter: adConfig.skipAfter,
        adTitle: adConfig.title || `${adConfig.type} ad`,
        index: adConfig.index,
        startTime: Date.now()
      };
    }
  }

  // 🔄 Switch back to content
  public setCurrentContent(): void {
    this.currentItem = this.createContentItem();
    // Update duration from video element if available
    if (this.videoElement?.duration && !isNaN(this.videoElement.duration)) {
      this.currentItem.duration = this.videoElement.duration;
    }
  }

  // 🔧 Setup performance tracking
  private setupPerformanceTracking(): void {
    if (!this.videoElement) return;

    // Track video quality metrics
    if ('getVideoPlaybackQuality' in this.videoElement) {
      const updateQualityMetrics = () => {
        const quality = (this.videoElement as any).getVideoPlaybackQuality();
        if (quality && this.videoElement) {
          const totalFrames = quality.totalVideoFrames || 0;
          const droppedFrames = quality.droppedVideoFrames || 0;
          
          // Update dropped frames (should only increase)
          if (droppedFrames > this.performanceMetrics.droppedFrames) {
            this.performanceMetrics.droppedFrames = droppedFrames;
          }
          
          // Calculate frame rate based on actual playback time, not session time
          const currentTime = this.videoElement.currentTime || 0;
          let rawFrameRate = 0;
          
          if (currentTime > 0 && totalFrames > 0) {
            // Frame rate = total frames / current playback position (in seconds)
            rawFrameRate = totalFrames / currentTime;
          } else if (totalFrames > 0) {
            // Fallback: use total watch time if available
            const watchTimeSeconds = this.engagementMetrics.totalWatchTime / 1000;
            if (watchTimeSeconds > 0) {
              rawFrameRate = totalFrames / watchTimeSeconds;
            }
          }
          
          // Apply frame rate smoothing to avoid dramatic drops during buffering
          if (rawFrameRate > 0) {
            this.frameRateHistory.push(rawFrameRate);
            if (this.frameRateHistory.length > this.FRAME_RATE_HISTORY_SIZE) {
              this.frameRateHistory.shift(); // Remove oldest entry
            }
            
            // Use moving average for stable reporting
            const smoothedFrameRate = this.frameRateHistory.reduce((sum, rate) => sum + rate, 0) / this.frameRateHistory.length;
            this.performanceMetrics.averageFrameRate = smoothedFrameRate;
          }
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
    const currentTimestamp = Date.now();
    
    // 🚫 Event debouncing - prevent duplicate events within threshold
    if (this.shouldDebounceEvent(eventName, currentTimestamp)) {
      return this.lastGeneratedEvent!;
    }
    
    // 🕐 Track timing
    this.lastEventTimestamp = currentTimestamp;
    if (!this.firstPlayTimestamp && (eventName.toLowerCase().includes('play') || eventName === 'onPlay')) {
      this.firstPlayTimestamp = currentTimestamp;
    }
    
    // 🎯 Update metrics BEFORE generating the event
    this.updateMetricsForEvent(eventName, additionalPayload, currentTimestamp);
    
    // 📊 Calculate dynamic engagement score using improved formula
    const calculatedEngagementScore = this.calculateImprovedEngagementScore();
    this.engagementMetrics.engagementScore = calculatedEngagementScore;

    const event: EnhancedAnalyticsEvent = {
      sessionId: this.sessionId,
      contentId: this.contentId,
      eventName,
      timestamp: currentTimestamp, // ✅ Use actual Date.now()
      userId: this.userId,

      contentMetadata: this.getContentMetadata(additionalPayload),
      playerData: this.getPlayerData(additionalPayload),
      sessionDuration: this.getCorrectSessionDuration(currentTimestamp), // ✅ Fixed calculation
      engagementScore: calculatedEngagementScore,
      
      engagementMetrics: { 
        ...this.engagementMetrics,
        // ✅ Updated calculations
        averageViewingSession: this.calculateAverageViewingSession(),
        contentCompletionRate: this.calculateContentCompletionRate(),
        totalPauseDuration: this.engagementMetrics.totalPauseDuration,
        pauseResumeSessions: [...this.pauseResumeSessions],
        engagementScore: calculatedEngagementScore,
      },
      performanceMetrics: { ...this.performanceMetrics },
      qualityMetrics: { ...this.qualityMetrics },
      deviceInfo: this.getDeviceInfo(),

      // Additional state info
      playlistLength: this.config.ads ? 
        (this.config.ads.preRoll?.length || 0) + 
        (this.config.ads.midRoll?.length || 0) + 
        (this.config.ads.postRoll?.length || 0) + 1 : 1,
      position: additionalPayload?.currentTime ?? (this.videoElement?.currentTime || 0),
      bandwidth: this.qualityMetrics.currentBandwidth,
      isPaused: this.videoElement?.paused || false,
      isFullscreen: !!document.fullscreenElement,
      playbackState: this.getPlaybackState(),
      isAd: this.isCurrentlyPlayingAd(),
    };

    // Send to analytics backend or callback
    // Store for debouncing
    this.lastGeneratedEvent = event;
    
    this.sendToAnalytics(event);
    
    return event;
  }

  // 🎯 Map event names to engagement metric updates
  private updateMetricsForEvent(eventName: string, payload?: any, timestamp?: number): void {
    // Normalize event name (remove 'on' prefix if present)
    const normalizedEvent = eventName.toLowerCase().replace(/^on/, '');

    switch (normalizedEvent) {
      case 'pause':
        this.engagementMetrics.pauseCount++;
        this.engagementMetrics.interactionCount++;
        this.isPaused = true;
        
        // 🎯 Track pause timing
        this.lastPauseTime = timestamp || Date.now();
        
        // 📊 Add pause session entry
        const pauseCurrentTime = payload?.currentTime ?? (this.videoElement?.currentTime || 0);
        this.pauseResumeSessions.push({
          pauseAt: pauseCurrentTime,
        });
        
        // 📈 Update watch time if playing
        if (this.lastPlayTime > 0) {
          const watchTime = (timestamp || Date.now()) - this.lastPlayTime;
          if (this.isCurrentlyPlayingAd()) {
            this.adMetrics.totalAdWatchTime += watchTime;
          } else {
            this.engagementMetrics.totalWatchTime += watchTime;
            this.engagementMetrics.uniqueViewTime += watchTime;
          }
          this.lastPlayTime = 0;
        }
        break;

      case 'play':
        // Check if this is initial play or resume
        if (!this.hasEverPlayed) {
          // Initial play - set startupTime properly
          this.hasEverPlayed = true;
          this.engagementMetrics.interactionCount++;
          if (this.performanceMetrics.startupTime === 0) {
            this.performanceMetrics.startupTime = Date.now() - this.loadStartTime;
          }
          if (this.performanceMetrics.initialLoadTime === 0) {
            this.performanceMetrics.initialLoadTime = Date.now() - this.sessionStartTime;
          }
        } else if (this.isPaused) {
          // Resume from pause
          this.engagementMetrics.resumeCount++;
          this.engagementMetrics.interactionCount++;
          
          // 🎯 Calculate pause duration
          if (this.lastPauseTime > 0) {
            const pauseDuration = (timestamp || Date.now()) - this.lastPauseTime;
            this.engagementMetrics.totalPauseDuration += pauseDuration;
            
            // 📊 Complete the latest pause session
            const lastSession = this.pauseResumeSessions[this.pauseResumeSessions.length - 1];
            if (lastSession && !lastSession.resumeAt) {
              const resumeTime = payload?.currentTime ?? (this.videoElement?.currentTime || 0);
              lastSession.resumeAt = resumeTime;
              lastSession.pauseDuration = pauseDuration;
            }
            
            this.lastPauseTime = 0;
          }
        } else {
          this.engagementMetrics.interactionCount++;
        }
        this.isPaused = false;
        this.lastPlayTime = timestamp || Date.now();
        break;

      case 'resume':
        this.engagementMetrics.resumeCount++;
        this.engagementMetrics.interactionCount++;
        this.lastPlayTime = Date.now();
        break;

      case 'seek':
        // Debounce micro-seeks: only count if movement is significant
        const seekCurrentTime = payload?.currentTime ?? (this.videoElement?.currentTime || 0);
        const seekDistance = Math.abs(seekCurrentTime - this.lastSeekTime);
        
        if (seekDistance >= this.SEEK_DEBOUNCE_THRESHOLD) {
          this.engagementMetrics.seekCount++;
          this.engagementMetrics.interactionCount++;
          this.lastSeekTime = seekCurrentTime;
        }
        // Note: Always track the seek event for position updates, but only count significant seeks
        break;

      case 'replay':
        this.engagementMetrics.replayCount++;
        this.engagementMetrics.interactionCount++;
        this.lastPlayTime = Date.now();
        break;

      case 'qualitychange':
      case 'quality_change':
        this.engagementMetrics.qualityChangeCount++;
        this.engagementMetrics.interactionCount++;
        
        // 📊 Enhanced quality and bandwidth tracking
        const newQuality = payload?.quality || 'unknown';
        const currentBandwidth = payload?.bandwidth || this.lastBandwidth;
        
        if (newQuality !== this.lastQuality || currentBandwidth !== this.lastBandwidth) {
          this.qualityMetrics.qualityHistory.push({
            timestamp: timestamp || Date.now(),
            quality: newQuality,
            bandwidth: currentBandwidth
          });
          
          if (currentBandwidth !== this.lastBandwidth) {
            this.qualityMetrics.bandwidthHistory.push({
              timestamp: timestamp || Date.now(),
              bandwidth: currentBandwidth
            });
            
            // Update average bitrate
            const totalBandwidth = this.qualityMetrics.bandwidthHistory.reduce((sum, entry) => sum + entry.bandwidth, 0);
            this.performanceMetrics.averageBitrate = totalBandwidth / this.qualityMetrics.bandwidthHistory.length;
          }
          
          this.lastQuality = newQuality;
          this.lastBandwidth = currentBandwidth;
          this.performanceMetrics.bitrateChanges++;
        }
        break;

      case 'volumechange':
      case 'volume_change':
        this.engagementMetrics.volumeChangeCount++;
        this.engagementMetrics.interactionCount++;
        break;

      case 'fullscreen':
        this.engagementMetrics.fullscreenCount++;
        this.engagementMetrics.interactionCount++;
        break;

      case 'settings_open':
      case 'settings_close':
        this.engagementMetrics.interactionCount++;
        break;

      case 'buffering_start':
      case 'bufferingstart':
        this.performanceMetrics.bufferingCount++;
        this.bufferingStartTime = Date.now();
        break;

      case 'buffering_end':
      case 'bufferingend':
        if (this.bufferingStartTime > 0) {
          const bufferingDuration = Date.now() - this.bufferingStartTime;
          this.performanceMetrics.bufferingTime += bufferingDuration;
          this.bufferingStartTime = 0;
        }
        break;

      case 'error':
        this.performanceMetrics.errorCount++;
        break;

      case 'complete':
        // Update completion rate
        const duration = this.getContentDuration();
        if (duration > 0) {
          this.engagementMetrics.contentCompletionRate = 
            (this.engagementMetrics.uniqueViewTime / (duration * 1000)) * 100;
        }
        break;

      // Add other event mappings as needed
      default:
        // For unknown events, still count as interaction if it's a user-initiated event
        if (eventName.includes('click') || eventName.includes('skip') || 
            eventName.includes('change') || eventName.includes('toggle')) {
          this.engagementMetrics.interactionCount++;
        }
        break;
    }

    // Update average viewing session
    const sessionCount = Math.max(1, this.engagementMetrics.pauseCount + this.engagementMetrics.resumeCount + 1);
    this.engagementMetrics.averageViewingSession = this.engagementMetrics.totalWatchTime / sessionCount;
  }

  // 🎯 Track specific events (now just call logEvent which handles metrics)
  public trackPlay(): void {
    this.logEvent(EVENT_NAMES.PLAY);
  }

  public trackPause(): void {
    this.logEvent(EVENT_NAMES.PAUSE);
  }

  public trackResume(): void {
    this.logEvent(EVENT_NAMES.RESUME);
  }

  public trackSeek(fromTime: number, toTime: number): void {
    this.logEvent(EVENT_NAMES.SEEK, { fromTime, toTime });
  }

  public trackBufferingStart(): void {
    this.logEvent(EVENT_NAMES.BUFFERING_START);
  }

  public trackBufferingEnd(): void {
    this.logEvent(EVENT_NAMES.BUFFERING_END);
  }

  public trackQualityChange(newQuality: string, bandwidth: number): void {
    this.logEvent(EVENT_NAMES.QUALITY_CHANGE, { quality: newQuality, bandwidth });
  }

  public trackVolumeChange(volume: number): void {
    this.logEvent(EVENT_NAMES.VOLUME_CHANGE, { volume });
  }

  public trackFullscreenChange(isFullscreen: boolean): void {
    if (isFullscreen) {
      this.logEvent(EVENT_NAMES.FULLSCREEN_ENTER);
    } else {
      this.logEvent(EVENT_NAMES.FULLSCREEN_EXIT);
    }
  }

  public trackError(error: any): void {
    this.logEvent(EVENT_NAMES.ERROR, { error: error.message || error });
  }

  public trackComplete(): void {
    this.logEvent(EVENT_NAMES.COMPLETE);
  }

  public trackReplay(): void {
    this.logEvent(EVENT_NAMES.REPLAY);
  }

  // 📋 Helper methods for data collection (enriched with config data)
  private getContentMetadata(eventPayload?: any) {
    // Use enriched currentItem data
    const duration = this.videoElement?.duration || this.currentItem.duration || 0;
    
    // For seek events, use the payload's currentTime, otherwise use video element's currentTime
    const currentTime = eventPayload?.currentTime ?? (this.videoElement?.currentTime || 0);
    
    return {
      title: this.currentItem.title,
      duration: duration,
      contentType: this.currentItem.type,
      ...(this.currentItem.isAd && { adTitle: this.currentItem.adTitle }),
      protocol: this.detectProtocol(),
      contentUri: this.currentItem.contentUri,
      startTimeInSeconds: currentTime,
      showSeekbar: this.config.ui?.showControls !== false && !this.currentItem.isAd,
      skippable: this.currentItem.skippable || false,
      ...(this.currentItem.skipAfter && { skipAfter: this.currentItem.skipAfter }),
      ...(this.currentItem.index && { index: this.currentItem.index }),
      isAd: this.currentItem.isAd,
      isSkippable: this.currentItem.skippable || false,
      hasSeekbar: this.config.ui?.showControls !== false && !this.currentItem.isAd,
    };
  }

  private getPlayerData(eventPayload?: any) {
    // Enhanced player data with currentItem context
    // For seek events, use the payload's currentTime, otherwise use video element's currentTime
    const currentTime = eventPayload?.currentTime ?? (this.videoElement?.currentTime || 0);
    const duration = this.videoElement?.duration || this.currentItem.duration || 0;
    
    return {
      currentTime: currentTime,
      duration: duration,
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
    // Return the current item's ad status to match contentMetadata.isAd
    return this.currentItem.isAd;
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

  private getContentDuration(): number {
    return this.videoElement?.duration || 0;
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

  // 🚫 Event debouncing helper
  private shouldDebounceEvent(eventName: string, timestamp: number): boolean {
    const lastTime = this.lastEventTimes.get(eventName);
    if (lastTime && (timestamp - lastTime) < this.EVENT_DEBOUNCE_THRESHOLD) {
      return true; // Debounce this event
    }
    this.lastEventTimes.set(eventName, timestamp);
    return false;
  }

  // ✅ Correct session duration calculation
  private getCorrectSessionDuration(currentTimestamp: number): number {
    if (!this.firstPlayTimestamp) {
      return currentTimestamp - this.sessionStartTime;
    }
    return currentTimestamp - this.firstPlayTimestamp;
  }

  // 📊 Improved engagement score calculation
  private calculateImprovedEngagementScore(): number {
    const duration = this.getContentDuration();
    if (duration === 0) return 0;

    const completionRate = this.calculateContentCompletionRate();
    const watchTimeRatio = Math.min(this.engagementMetrics.totalWatchTime / (duration * 1000), 1);
    const interactionBonus = Math.min(this.engagementMetrics.interactionCount * 2, 20);
    const pausePenalty = Math.min(this.engagementMetrics.pauseCount * 1, 10);

    const score = Math.round(
      (completionRate * 0.4) +          // 40% weight on completion
      (watchTimeRatio * 100 * 0.4) +   // 40% weight on watch time
      (interactionBonus * 0.2) -       // 20% bonus for interactions
      pausePenalty                     // Penalty for excessive pausing
    );

    return Math.max(0, Math.min(100, score));
  }

  // 📈 Fixed average viewing session calculation
  private calculateAverageViewingSession(): number {
    const sessionCount = Math.max(1, this.engagementMetrics.resumeCount + 1);
    return this.engagementMetrics.totalWatchTime / sessionCount;
  }

  // 🎯 Content completion rate calculation
  private calculateContentCompletionRate(): number {
    const duration = this.getContentDuration();
    if (duration === 0) return 0;
    
    const watchTimeInSeconds = this.engagementMetrics.uniqueViewTime / 1000;
    return Math.min((watchTimeInSeconds / duration) * 100, 100);
  }
}
