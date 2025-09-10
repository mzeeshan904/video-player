import React from 'react';

interface ReplayOverlayProps {
  onReplay: () => void;
}

const ReplayOverlay: React.FC<ReplayOverlayProps> = ({ onReplay }) => {
  return (
    <div className="replay-overlay">
      <div className="replay-content">
        <div className="replay-icon">
          🔄
        </div>
        <h3 className="replay-title">Playback Complete</h3>
        <p className="replay-message">
          You've finished watching all content and ads.
        </p>
        <button 
          className="replay-button"
          onClick={onReplay}
        >
          ▶️ Watch Again
        </button>
      </div>
    </div>
  );
};

export default ReplayOverlay;
