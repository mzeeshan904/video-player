// Core Player Types
export interface MediaSource {
  url: string;
  type: 'video' | 'audio';
  mimeType?: string;
  drm?: DRMConfig;
  // Optional settings specific to this media content
  qualities?: VideoQuality[];
  subtitles?: SubtitleTrack[];
  chapters?: ChapterTrack[];
}

export interface DRMConfig {
  type: 'widevine' | 'playready' | 'fairplay';
  licenseUrl: string;
  headers?: Record<string, string>;
  certificateUrl?: string; // For FairPlay
}

// Ad System Types
export interface AdConfig {
  preRoll?: Ad[];
  midRoll?: MidRollAd[];
  postRoll?: Ad[];
}

export interface Ad {
  id: string;
  url: string;
  duration: number;
  skippable: boolean;
  skipAfter?: number; // seconds
  interactive?: InteractiveAdConfig;
}

export interface MidRollAd extends Ad {
  playAt: number; // seconds into main content
}

export interface InteractiveAdConfig {
  type: 'poll' | 'quiz' | 'cta' | 'overlay';
  data: PollData | QuizData | CTAData | OverlayData;
}

export interface PollData {
  question: string;
  options: string[];
  duration: number; // seconds to display
}

export interface QuizData {
  question: string;
  options: string[];
  correctAnswer: number;
  duration: number;
}

export interface CTAData {
  text: string;
  url: string;
  buttonText: string;
  duration: number;
}

export interface OverlayData {
  content: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  duration: number;
}

// Analytics Types
export interface AnalyticsEvent {
  type: 'play' | 'pause' | 'seek' | 'volumechange' | 'fullscreen' | 'error' | 
        'ad_start' | 'ad_complete' | 'ad_skip' | 'ad_click' | 'ad_interaction' |
        'buffering_start' | 'buffering_end' | 'complete' | 'replay' |
        'quality_change' | 'subtitle_change' | 'speed_change' | 'settings_open' | 'settings_close' |
        'download_start' | 'download_progress' | 'download_complete' | 'download_failed' | 'download_cancelled' |
        'offline_play' | 'offline_delete';
  timestamp: number;
  payload?: any;
}

// Settings and Quality Types
export interface VideoQuality {
  id: string;
  label: string;
  height: number;
  width: number;
  bitrate?: number;
  url?: string;
}

export interface SubtitleTrack {
  id: string;
  label: string;
  language: string;
  url: string;
  isDefault?: boolean;
}

export interface ChapterTrack {
  id: string;
  title: string;
  startTime: number;
  endTime?: number;
}

export interface PlayerSettings {
  playbackSpeed?: number;
  autoplay?: boolean;
  loop?: boolean;
  skipSilence?: boolean;
  pictureInPicture?: boolean;
}

// Offline Support Types
export interface OfflineConfig {
  downloadEnabled: boolean;
  maxDownloads?: number;
  expiryDays?: number;
  maxFileSize?: number; // in MB
  allowMeteredConnection?: boolean;
  storageQuota?: number; // in MB
}

export interface OfflineVideo {
  id: string;
  title: string;
  url: string;
  originalUrl: string;
  mimeType: string;
  size: number; // in bytes
  downloadedAt: number; // timestamp
  expiresAt?: number; // timestamp
  thumbnailUrl?: string;
  duration?: number;
  quality?: VideoQuality;
  subtitles?: OfflineSubtitle[];
}

export interface OfflineSubtitle {
  id: string;
  label: string;
  language: string;
  data: string; // VTT content stored as string
}

export interface DownloadProgress {
  videoId: string;
  loaded: number;
  total: number;
  percentage: number;
  speed?: number; // bytes per second
  timeRemaining?: number; // seconds
  status: 'pending' | 'downloading' | 'completed' | 'failed' | 'cancelled';
}

export interface OfflineStorage {
  videos: OfflineVideo[];
  totalSize: number;
  lastCleanup: number;
}

export interface PlayerConfig {
  src: MediaSource;
  ads?: AdConfig;
  analytics?: {
    enabled: boolean;
    endpoint?: string;
    onEvent?: (event: AnalyticsEvent) => void;
    userId?: string;
    enhancedAnalytics?: boolean; // Enable comprehensive analytics tracking
  };
  ui?: {
    theme?: 'dark' | 'light';
    autoplay?: boolean;
    muted?: boolean;
    loop?: boolean;
    showControls?: boolean;
    showSettings?: boolean;
    showDownload?: boolean;
  };
  settings?: PlayerSettings;
  offline?: OfflineConfig;
}

// Player State Types
export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  fullscreen: boolean;
  buffering: boolean;
  error: string | null;
  currentAd: Ad | null;
  adProgress: number;
  showSkipButton: boolean;
  interactiveAdActive: boolean;
  playbackPhase: 'preroll' | 'content' | 'postroll';
  mainContentTime: number; // Track main content time separately
  previousTime: number; // Track previous time to detect seeks
  showReplay: boolean; // Show replay overlay when all content is complete
  // Settings state
  currentQuality: VideoQuality | null;
  currentSubtitle: SubtitleTrack | null;
  playbackSpeed: number;
  showSettings: boolean;
}
