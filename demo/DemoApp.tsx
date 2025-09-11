import React from 'react';
import { MediaPlayer, PlayerConfig } from '../src'; // Import from library source
import { sampleVideos } from '../src/config/sampleVideos';
import { testConfigurations } from '../src/config/testConfigurations';

// Use the existing instant demo configuration
const demoConfig = testConfigurations['🚀 Instant Demo (AUTOPLAY)'];

const DemoApp: React.FC = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0a0a0a', 
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#fff'
    }}>
      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 'bold', 
          background: 'linear-gradient(135deg, #ff6b6b, #4ecdc4)', 
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '10px'
        }}>
          Custom Media Player Demo
        </h1>
        <p style={{
          fontSize: '1.1rem',
          opacity: 0.8,
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Advanced video player with ads, DRM, interactive features, and analytics
        </p>
      </header>

      {/* Demo Title */}
      <div style={{ 
        textAlign: 'center',
        marginBottom: '30px',
        color: '#fff',
        opacity: 0.9,
        fontSize: '18px',
        fontWeight: '600',
      }}>
        🚀 <strong>Instant Demo Experience</strong> 🚀
      </div>

      {/* Autoplay Notice */}
      <div style={{
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        border: '1px solid rgba(76, 175, 80, 0.3)',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '20px',
        textAlign: 'center',
        maxWidth: '800px',
        margin: '0 auto 20px auto',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '8px',
        }}>
          <span style={{ fontSize: '20px' }}>🎬</span>
          <strong style={{ color: '#4caf50' }}>Autoplay Demo Active</strong>
        </div>
        <p style={{
          color: '#fff',
          margin: '0',
          fontSize: '14px',
          opacity: 0.9,
        }}>
          ✅ <strong>COMPLETE EXPERIENCE:</strong> Full cycle with replay! Pre-roll → Content → Post-roll → Replay!<br/>
          📊 Try watching full sequence, skipping ads, or seeking - then use replay to start over!<br/>
          <strong>Full Cycle:</strong> First Pre-roll (2s) → Second Pre-roll (1s) → Content → Mid-roll → Post-roll → 🔄 Replay
        </p>
      </div>

      {/* Media Player */}
      <MediaPlayer config={demoConfig} />

      {/* Footer */}
      <footer style={{ textAlign: 'center', marginTop: '40px', opacity: 0.7 }}>
        <p>Built with React, TypeScript, and modern web technologies</p>
        <p>Supports HLS, DASH, DRM, Picture-in-Picture, and comprehensive analytics</p>
      </footer>
    </div>
  );
};

export default DemoApp;
