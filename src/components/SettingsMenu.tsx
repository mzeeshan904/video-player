import React, { useState, useEffect, useMemo } from 'react';
import { VideoQuality, SubtitleTrack, ChapterTrack, PlayerState } from '../types';

interface SettingsMenuProps {
  state: PlayerState;
  qualities?: VideoQuality[];
  subtitles?: SubtitleTrack[];
  chapters?: ChapterTrack[];
  onQualityChange: (quality: VideoQuality | null) => void;
  onSubtitleChange: (subtitle: SubtitleTrack | null) => void;
  onSpeedChange: (speed: number) => void;
  onChapterSelect: (chapter: ChapterTrack) => void;
  onClose: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({
  state,
  qualities = [],
  subtitles = [],
  chapters = [],
  onQualityChange,
  onSubtitleChange,
  onSpeedChange,
  onChapterSelect,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'quality' | 'subtitles' | 'speed' | 'chapters'>('speed');

  // Determine available tabs
  const availableTabs = useMemo(() => {
    const tabs = [];
    if (qualities.length > 0) tabs.push('quality');
    if (subtitles.length > 0) tabs.push('subtitles');
    tabs.push('speed'); // Always available
    if (chapters.length > 0) tabs.push('chapters');
    return tabs;
  }, [qualities.length, subtitles.length, chapters.length]);

  // Set default tab to first available
  useEffect(() => {
    if (!availableTabs.includes(activeTab)) {
      setActiveTab(availableTabs[0] || 'speed');
    }
  }, [availableTabs, activeTab]);

  const playbackSpeeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="settings-overlay" onClick={handleBackdropClick}>
      <div className="settings-menu">
        <div className="settings-header">
          <h3>Settings</h3>
          <button className="settings-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div className="settings-tabs">
          {qualities.length > 0 && (
            <button 
              className={`settings-tab ${activeTab === 'quality' ? 'active' : ''}`}
              onClick={() => setActiveTab('quality')}
            >
              Quality
            </button>
          )}
          {subtitles.length > 0 && (
            <button 
              className={`settings-tab ${activeTab === 'subtitles' ? 'active' : ''}`}
              onClick={() => setActiveTab('subtitles')}
            >
              Subtitles
            </button>
          )}
          <button 
            className={`settings-tab ${activeTab === 'speed' ? 'active' : ''}`}
            onClick={() => setActiveTab('speed')}
          >
            Speed
          </button>
          {chapters.length > 0 && (
            <button 
              className={`settings-tab ${activeTab === 'chapters' ? 'active' : ''}`}
              onClick={() => setActiveTab('chapters')}
            >
              Chapters
            </button>
          )}
        </div>

        <div className="settings-content">
          {activeTab === 'quality' && (
            <div className="settings-section">
              <h4>Video Quality</h4>
              <div className="settings-options">
                <label className="settings-option">
                  <input
                    type="radio"
                    name="quality"
                    checked={state.currentQuality === null}
                    onChange={() => onQualityChange(null)}
                  />
                  <span className="option-label">Auto</span>
                  <span className="option-description">Adaptive quality</span>
                </label>
                {qualities.map((quality) => (
                  <label key={quality.id} className="settings-option">
                    <input
                      type="radio"
                      name="quality"
                      checked={state.currentQuality?.id === quality.id}
                      onChange={() => onQualityChange(quality)}
                    />
                    <span className="option-label">{quality.label}</span>
                    <span className="option-description">
                      {quality.width}x{quality.height}
                      {quality.bitrate && ` • ${Math.round(quality.bitrate / 1000)}k`}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'subtitles' && (
            <div className="settings-section">
              <h4>Subtitles & Captions</h4>
              <div className="settings-options">
                <label className="settings-option">
                  <input
                    type="radio"
                    name="subtitle"
                    checked={state.currentSubtitle === null}
                    onChange={() => onSubtitleChange(null)}
                  />
                  <span className="option-label">Off</span>
                  <span className="option-description">No subtitles</span>
                </label>
                {subtitles.map((subtitle) => (
                  <label key={subtitle.id} className="settings-option">
                    <input
                      type="radio"
                      name="subtitle"
                      checked={state.currentSubtitle?.id === subtitle.id}
                      onChange={() => onSubtitleChange(subtitle)}
                    />
                    <span className="option-label">{subtitle.label}</span>
                    <span className="option-description">{subtitle.language}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'speed' && (
            <div className="settings-section">
              <h4>Playback Speed</h4>
              <div className="settings-options">
                {playbackSpeeds.map((speed) => (
                  <label key={speed} className="settings-option">
                    <input
                      type="radio"
                      name="speed"
                      checked={state.playbackSpeed === speed}
                      onChange={() => onSpeedChange(speed)}
                    />
                    <span className="option-label">
                      {speed === 1 ? 'Normal' : `${speed}x`}
                    </span>
                    <span className="option-description">
                      {speed < 1 ? 'Slower' : speed > 1 ? 'Faster' : 'Default speed'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'chapters' && (
            <div className="settings-section">
              <h4>Chapters</h4>
              <div className="settings-options">
                {chapters.map((chapter) => (
                  <label key={chapter.id} className="settings-option" onClick={() => onChapterSelect(chapter)}>
                    <span className="option-label">{chapter.title}</span>
                    <span className="option-description">
                      {formatTime(chapter.startTime)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to format time
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

export default SettingsMenu;
