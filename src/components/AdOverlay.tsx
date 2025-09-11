import React from 'react';
import { Ad } from '../types';

interface AdOverlayProps {
  ad: Ad;
  progress: number;
  showSkipButton: boolean;
  onSkip: () => void;
  onClick: (url?: string) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
}

const AdOverlay: React.FC<AdOverlayProps> = ({
  ad,
  progress,
  showSkipButton,
  onSkip,
  onClick,
  isPlaying,
  onPlayPause,
}: AdOverlayProps) => {
  // Only calculate time if playing, otherwise keep showing the same time
  const remainingTime = Math.max(0, Math.ceil((ad.duration * (100 - Math.min(progress, 100))) / 100));
  const skipCountdown = ad.skipAfter ? Math.max(0, ad.skipAfter - Math.floor((ad.duration * progress) / 100)) : 0;

  return (
    <div className="ad-overlay">
      {/* Ad indicator */}
      <div className="ad-indicator">
        <span className="ad-label">Advertisement</span>
        <span className="ad-countdown">
          Ad ends in {remainingTime}s
        </span>
      </div>

      {/* Skip button */}
      {ad.skippable && (
        <div className="skip-container">
          {showSkipButton ? (
            <button 
              className="skip-button"
              onClick={(e) => {
                e.stopPropagation(); // Prevent event bubbling
                onSkip();
              }}
            >
              Next
            </button>
          ) : (
            <div className="skip-countdown">
              Skip in {skipCountdown}s
            </div>
          )}
        </div>
      )}

      {/* Clickable overlay for ad clicks */}
      <div 
        className="ad-click-overlay"
        onClick={() => onClick()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onClick();
          }
        }}
      />

      {/* Ad progress bar */}
      <div className="ad-progress-container">
        <div className="ad-progress-bar">
          <div 
            className="ad-progress-filled"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Ad controls */}
        <div className="ad-controls">
          <button 
            className="ad-play-pause-btn"
            onClick={(e) => {
              e.stopPropagation();
              onPlayPause();
            }}
            title={isPlaying ? "Pause Ad" : "Play Ad"}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
          <span className="ad-time">
            {remainingTime}s {!isPlaying && '(Paused)'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdOverlay;
