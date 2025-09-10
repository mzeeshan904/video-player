import React from 'react';
import MediaPlayer from './components/MediaPlayer';
import { PlayerConfig } from './types';
import { testConfigurations } from './config/testConfigurations';
import { sampleVideos } from './config/sampleVideos';

// Note: Example configurations are now in separate files for better organization
// See src/config/testConfigurations.ts for all available test configurations

const App: React.FC = () => {
  const [currentConfig, setCurrentConfig] = React.useState<PlayerConfig>(testConfigurations['🚀 Instant Demo (AUTOPLAY)']);
  const [configName, setConfigName] = React.useState('🚀 Instant Demo (AUTOPLAY)');

  const configurations = Object.entries(testConfigurations).map(([name, config]) => ({
    name,
    config
  }));

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0a0a0a', 
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Header */}
      <header style={{ 
        textAlign: 'center', 
        marginBottom: '30px',
        color: '#fff',
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: '700',
          marginBottom: '10px',
          background: 'linear-gradient(135deg, #ff0000, #ff6b6b)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Custom Media Player
        </h1>
        <p style={{ 
          fontSize: '1.1rem', 
          opacity: 0.8,
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: '1.5',
        }}>
          Advanced video player with ads, DRM, interactive features, and analytics
        </p>
      </header>

      {/* Configuration Selector */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginBottom: '30px',
        gap: '10px',
        flexWrap: 'wrap',
      }}>
        {configurations.map((cfg) => (
          <button
            key={cfg.name}
            onClick={() => {
              setCurrentConfig(cfg.config);
              setConfigName(cfg.name);
            }}
            style={{
              padding: '12px 24px',
              backgroundColor: configName === cfg.name ? '#ff0000' : 'rgba(255, 255, 255, 0.1)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              if (configName !== cfg.name) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              }
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              if (configName !== cfg.name) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }
            }}
          >
            {cfg.name}
          </button>
        ))}
      </div>

      {/* Current Configuration Info */}
      <div style={{ 
        textAlign: 'center',
        marginBottom: '20px',
        color: '#fff',
        opacity: 0.7,
        fontSize: '14px',
      }}>
        Current: <strong>{configName}</strong>
      </div>

      {/* Autoplay Notice */}
      {configName.includes('AUTOPLAY') && (
        <div style={{
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          border: '2px solid rgba(76, 175, 80, 0.3)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          textAlign: 'center',
          maxWidth: '800px',
          margin: '0 auto 20px',
          animation: 'pulse 2s infinite'
        }}>
          <h3 style={{ 
            color: '#4CAF50',
            margin: '0 0 10px 0',
            fontSize: '1.2rem',
          }}>
            🚀 AUTOPLAY DEMO ACTIVE!
          </h3>
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
      )}

      {/* Video Library Info */}
      <div style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        marginBottom: '20px',
        maxWidth: '1200px',
        margin: '0 auto 20px',
      }}>
        <h3 style={{ 
          color: '#ff6b6b',
          textAlign: 'center',
          marginBottom: '15px',
          fontSize: '1.3rem',
        }}>
          📹 Available Test Videos
        </h3>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '15px',
          fontSize: '13px',
          color: '#fff',
          opacity: 0.8,
        }}>
          <div>
            <strong>🎬 Main Content:</strong>
            <ul style={{ margin: '5px 0', paddingLeft: '15px' }}>
              {sampleVideos.mainContent.map((video, i) => (
                <li key={i}>{video.title} ({Math.floor(video.duration / 60)}min)</li>
              ))}
            </ul>
          </div>
          <div>
            <strong>📺 Pre-roll Ads:</strong>
            <ul style={{ margin: '5px 0', paddingLeft: '15px' }}>
              {sampleVideos.preRollAds.map((video, i) => (
                <li key={i}>{video.title} ({video.duration}s)</li>
              ))}
            </ul>
          </div>
          <div>
            <strong>⏯️ Mid-roll Ads:</strong>
            <ul style={{ margin: '5px 0', paddingLeft: '15px' }}>
              {sampleVideos.midRollAds.map((video, i) => (
                <li key={i}>{video.title} ({video.duration}s)</li>
              ))}
            </ul>
          </div>
          <div>
            <strong>🔚 Post-roll Ads:</strong>
            <ul style={{ margin: '5px 0', paddingLeft: '15px' }}>
              {sampleVideos.postRollAds.map((video, i) => (
                <li key={i}>{video.title} ({video.duration}s)</li>
              ))}
            </ul>
          </div>
        </div>
        <div style={{ 
          textAlign: 'center',
          marginTop: '15px',
          fontSize: '12px',
          opacity: 0.6,
        }}>
          🌐 Streaming: {sampleVideos.streaming.hls.length} HLS + {sampleVideos.streaming.dash.length} DASH sources available
        </div>
      </div>

      {/* Media Player */}
      <MediaPlayer config={currentConfig} />

      {/* Features List */}
      <div style={{ 
        marginTop: '50px',
        color: '#fff',
        maxWidth: '1200px',
        margin: '50px auto 0',
      }}>
        <h2 style={{ 
          fontSize: '1.8rem', 
          marginBottom: '20px',
          textAlign: 'center',
        }}>
          Features
        </h2>
        
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginTop: '30px',
        }}>
          {[
            {
              title: '🎬 Core Player',
              features: ['Video/Audio playback', 'Play/Pause/Volume controls', 'Progress bar with seek', 'Fullscreen support', 'Responsive design'],
            },
            {
              title: '📺 Ad Support',
              features: ['Pre-roll, Mid-roll, Post-roll ads', 'Skippable ads with countdown', 'Ad progress indicators', 'Click tracking', 'Lazy loading'],
            },
            {
              title: '🎯 Interactive Ads',
              features: ['Polls & Quizzes', 'Call-to-Action buttons', 'Overlay cards', 'Interaction analytics', 'Local storage for preferences'],
            },
            {
              title: '🔒 DRM Support',
              features: ['Widevine, PlayReady, FairPlay', 'EME/MSE integration', 'License server support', 'Fallback for non-DRM browsers', 'Custom headers support'],
            },
            {
              title: '📊 Analytics',
              features: ['Play/pause/seek tracking', 'Ad impression & interaction', 'Error & buffering events', 'Custom event handlers', 'Console logging'],
            },
            {
              title: '🚀 Advanced Features',
              features: ['Picture-in-Picture mode', 'HLS/DASH streaming', 'Adaptive bitrate', 'Mobile-friendly touch controls', 'Dark/Light themes'],
            },
          ].map((section, index) => (
            <div
              key={index}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <h3 style={{ 
                fontSize: '1.2rem',
                marginBottom: '15px',
                color: '#ff6b6b',
              }}>
                {section.title}
              </h3>
              <ul style={{ 
                listStyle: 'none',
                padding: 0,
                margin: 0,
              }}>
                {section.features.map((feature, idx) => (
                  <li
                    key={idx}
                    style={{
                      padding: '5px 0',
                      fontSize: '14px',
                      opacity: 0.8,
                    }}
                  >
                    ✓ {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Testing Guide */}
      <div style={{ 
        marginTop: '50px',
        color: '#fff',
        maxWidth: '1200px',
        margin: '50px auto 0',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: '30px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        <h2 style={{ 
          fontSize: '1.8rem', 
          marginBottom: '20px',
          textAlign: 'center',
          color: '#ff6b6b',
        }}>
          🧪 Testing Guide
        </h2>
        
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '30px',
        }}>
          {[
            {
              title: '🎬 Full Featured Test',
              description: 'Complete experience with all ad types and interactions',
              features: ['Pre-roll with quiz', 'Multiple mid-rolls', 'Post-roll with poll', 'All interactive types']
            },
            {
              title: '⚡ Quick Test', 
              description: 'Fast testing with short timers',
              features: ['2-second skip timer', 'Early mid-roll at 30s', 'Quick interactions', 'Rapid feedback']
            },
            {
              title: '🎯 Interactive Ads',
              description: 'Showcase all interactive ad features',
              features: ['Polls & Quizzes', 'CTA buttons', 'Overlay cards', 'Interaction tracking']
            },
            {
              title: '🌐 Streaming Tests',
              description: 'Test HLS and DASH adaptive streaming',
              features: ['Apple HLS streams', 'DASH manifests', 'Quality switching', 'Adaptive bitrate']
            }
          ].map((test, index) => (
            <div
              key={index}
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <h3 style={{ 
                fontSize: '1.1rem',
                marginBottom: '10px',
                color: '#ff6b6b',
              }}>
                {test.title}
              </h3>
              <p style={{ 
                fontSize: '14px',
                marginBottom: '15px',
                opacity: 0.8,
              }}>
                {test.description}
              </p>
              <ul style={{ 
                listStyle: 'none',
                padding: 0,
                margin: 0,
                fontSize: '13px',
              }}>
                {test.features.map((feature, idx) => (
                  <li key={idx} style={{ padding: '3px 0', opacity: 0.7 }}>
                    ✓ {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{
          backgroundColor: 'rgba(255, 193, 7, 0.1)',
          border: '1px solid rgba(255, 193, 7, 0.3)',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
        }}>
          <h3 style={{ color: '#ffc107', marginBottom: '10px', fontSize: '1.1rem' }}>
            💡 Testing Tips
          </h3>
          <ul style={{ fontSize: '14px', opacity: 0.9, lineHeight: '1.6' }}>
            <li>• <strong>Full Featured Test:</strong> Wait for ads at 1min, 3min, and 5min marks</li>
            <li>• <strong>Quick Test:</strong> Mid-roll appears at 30 seconds for rapid testing</li>
            <li>• <strong>Skip Testing:</strong> Different configs have 2-10 second skip timers</li>
            <li>• <strong>Interactive Ads:</strong> Click on poll/quiz options and CTA buttons</li>
            <li>• <strong>Analytics:</strong> Check browser console for detailed event logging</li>
            <li>• <strong>Mobile Testing:</strong> Try on mobile devices for touch controls</li>
          </ul>
        </div>
      </div>

      {/* Usage Instructions */}
      <div style={{ 
        marginTop: '30px',
        color: '#fff',
        maxWidth: '800px',
        margin: '30px auto 0',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: '30px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        <h2 style={{ 
          fontSize: '1.8rem', 
          marginBottom: '20px',
          textAlign: 'center',
          color: '#ff6b6b',
        }}>
          How to Use
        </h2>
        
        <div style={{ fontSize: '14px', lineHeight: '1.6', opacity: 0.9 }}>
          <p><strong>1. Basic Setup:</strong></p>
          <pre style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            padding: '15px',
            borderRadius: '6px',
            overflow: 'auto',
            fontSize: '12px',
          }}>
{`import MediaPlayer from './components/MediaPlayer';
import { PlayerConfig } from './types';

const config: PlayerConfig = {
  src: { url: 'your-video.mp4', type: 'video' },
  analytics: { enabled: true },
  ui: { theme: 'dark' }
};

<MediaPlayer config={config} />`}
          </pre>

          <p style={{ marginTop: '20px' }}><strong>2. With Ads & Interactive Features:</strong></p>
          <pre style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            padding: '15px',
            borderRadius: '6px',
            overflow: 'auto',
            fontSize: '12px',
          }}>
{`const config: PlayerConfig = {
  src: { url: 'video.mp4', type: 'video' },
  ads: {
    preRoll: [{
      id: 'ad1',
      url: 'ad-video.mp4',
      duration: 30,
      skippable: true,
      skipAfter: 5,
      interactive: {
        type: 'quiz',
        data: {
          question: 'What's your favorite color?',
          options: ['Red', 'Blue', 'Green'],
          correctAnswer: 0,
          duration: 15
        }
      }
    }]
  }
};`}
          </pre>

          <p style={{ marginTop: '20px' }}><strong>3. DRM Protected Content:</strong></p>
          <pre style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            padding: '15px',
            borderRadius: '6px',
            overflow: 'auto',
            fontSize: '12px',
          }}>
{`const config: PlayerConfig = {
  src: {
    url: 'encrypted-video.mp4',
    type: 'video',
    drm: {
      type: 'widevine',
      licenseUrl: 'https://license-server.com/license',
      headers: { 'X-API-Key': 'your-key' }
    }
  }
};`}
          </pre>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ 
        textAlign: 'center',
        marginTop: '50px',
        padding: '30px',
        color: '#fff',
        opacity: 0.6,
        fontSize: '14px',
      }}>
        <p>Built with React, TypeScript, and modern web technologies</p>
        <p>Supports HLS, DASH, DRM, Picture-in-Picture, and comprehensive analytics</p>
      </footer>
    </div>
  );
};

export default App;
