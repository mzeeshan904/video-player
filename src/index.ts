// CSS styles (will be extracted by rollup)
import './components/MediaPlayer.css';

// Main library exports
export { default as MediaPlayer } from './components/MediaPlayer';

// Type exports (both as types and interfaces)
export type {
  PlayerConfig,
  PlayerState,
  MediaSource,
  DRMConfig,
  AdConfig,
  Ad,
  MidRollAd,
  PollData,
  QuizData,
  CTAData,
  OverlayData,
  AnalyticsEvent,
} from './types';

// Also export types as regular exports for runtime access
export type {
  PlayerConfig as PlayerConfigType,
  AnalyticsEvent as AnalyticsEventType,
} from './types';

// Hook exports
export { usePlayerState } from './hooks/usePlayerState';
export { usePictureInPicture } from './hooks/usePictureInPicture';

// Utility exports
export { AdManager } from './utils/adManager';
export { DRMManager } from './utils/drmManager';
export { StreamingManager } from './utils/streamingManager';

// Sample configurations for documentation/examples
export { sampleVideos } from './config/sampleVideos';
