// CSS styles (will be extracted by rollup)
import './components/MediaPlayer.css';

// Main library exports
export { default as MediaPlayer } from './components/MediaPlayer';
export { default as SettingsMenu } from './components/SettingsMenu';
export { default as ThumbnailPreview } from './components/ThumbnailPreview';
export { default as DownloadControls } from './components/DownloadControls';

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
  VideoQuality,
  SubtitleTrack,
  ChapterTrack,
  PlayerSettings,
  OfflineConfig,
  OfflineVideo,
  OfflineSubtitle,
  DownloadProgress,
  OfflineStorage,
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
export { OfflineManager } from './utils/offlineManager';

// Sample configurations for documentation/examples
export { sampleVideos } from './config/sampleVideos';
