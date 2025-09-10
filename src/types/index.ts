// Core Player Types
export interface MediaSource {
  url: string;
  type: 'video' | 'audio';
  mimeType?: string;
  drm?: DRMConfig;
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
        'buffering_start' | 'buffering_end' | 'complete' | 'replay';
  timestamp: number;
  payload?: any;
}

export interface PlayerConfig {
  src: MediaSource;
  ads?: AdConfig;
  analytics?: {
    enabled: boolean;
    endpoint?: string;
    onEvent?: (event: AnalyticsEvent) => void;
  };
  ui?: {
    theme?: 'dark' | 'light';
    autoplay?: boolean;
    muted?: boolean;
    loop?: boolean;
    showControls?: boolean;
  };
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
}
