import React, { useState, useRef, useEffect } from 'react';
import { PlayerState } from '../types';

interface PlayerControlsProps {
  state: PlayerState;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onMute: () => void;
  onFullscreen: () => void;
  onPictureInPicture?: () => void;
  isPiPSupported?: boolean;
  isPiPActive?: boolean;
  isAd: boolean;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  state,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onMute,
  onFullscreen,
  onPictureInPicture,
  isPiPSupported = false,
  isPiPActive = false,
  isAd,
}) => {
  const [showControls, setShowControls] = useState(true);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const progressRef = useRef<HTMLDivElement>(null);

  // Auto-hide controls
  useEffect(() => {
    const resetTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      setShowControls(true);
      
      if (state.isPlaying && !isDragging) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };

    resetTimeout();

    const handleMouseMove = () => resetTimeout();
    const handleMouseLeave = () => {
      if (state.isPlaying && !isDragging) {
        setShowControls(false);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [state.isPlaying, isDragging]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isAd) return; // Don't allow seeking during ads

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const clickRatio = clickX / width;
    const newTime = clickRatio * state.duration;
    
    onSeek(newTime);
  };

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isAd) return;

    setIsDragging(true);
    handleProgressClick(e);

    const handleMouseMove = (e: MouseEvent) => {
      if (!progressRef.current) return;

      const rect = progressRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const clickRatio = Math.max(0, Math.min(1, clickX / width));
      const newTime = clickRatio * state.duration;
      
      onSeek(newTime);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const progress = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;

  return (
    <div className={`player-controls ${showControls ? 'visible' : 'hidden'}`}>
      {/* Progress Bar */}
      <div 
        ref={progressRef}
        className={`progress-container ${isAd ? 'disabled' : ''}`}
        onClick={handleProgressClick}
        onMouseDown={handleProgressMouseDown}
      >
        <div className="progress-bar">
          <div 
            className="progress-filled"
            style={{ width: `${progress}%` }}
          />
          {!isAd && (
            <div 
              className="progress-handle"
              style={{ left: `${progress}%` }}
            />
          )}
        </div>
      </div>

      {/* Control Bar */}
      <div className="controls-bar">
        {/* Left Section */}
        <div className="controls-left">
          <button 
            className="control-button play-pause"
            onClick={onPlayPause}
            aria-label={state.isPlaying ? 'Pause' : 'Play'}
          >
            {state.isPlaying ? (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>

          <div 
            className="volume-container"
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
          >
            <button 
              className="control-button volume"
              onClick={onMute}
              aria-label={state.muted ? 'Unmute' : 'Mute'}
            >
              {state.muted || state.volume === 0 ? (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                </svg>
              ) : state.volume < 0.5 ? (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              )}
            </button>

            {showVolumeSlider && (
              <div className="volume-slider">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={state.muted ? 0 : state.volume}
                  onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                  className="volume-input"
                />
              </div>
            )}
          </div>

          <div className="time-display">
            <span className="current-time">{formatTime(state.currentTime)}</span>
            <span className="time-separator">/</span>
            <span className="duration">{formatTime(state.duration)}</span>
          </div>
        </div>

        {/* Right Section */}
        <div className="controls-right">
          {isPiPSupported && onPictureInPicture && (
            <button 
              className="control-button pip"
              onClick={onPictureInPicture}
              aria-label={isPiPActive ? 'Exit Picture-in-Picture' : 'Enter Picture-in-Picture'}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                {isPiPActive ? (
                  <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16.01H3V4.99h18v14.02z"/>
                ) : (
                  <path d="M19 11h-8v6h8v-6zm4-6H1v14h22V5zM3 17V7h18v10H3zm16-2h-6v-4h6v4z"/>
                )}
              </svg>
            </button>
          )}
          
          <button 
            className="control-button fullscreen"
            onClick={onFullscreen}
            aria-label={state.fullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {state.fullscreen ? (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerControls;
