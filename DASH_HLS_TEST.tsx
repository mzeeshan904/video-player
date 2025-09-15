import React, { useState } from 'react';
import { MediaPlayer } from './src';
import { PlayerConfig } from './src/types';
import './src/components/MediaPlayer.css';

// 🎬 DASH & HLS Streaming Test Suite
const DashHlsTest: React.FC = () => {
  const [currentTest, setCurrentTest] = useState<string>('hls-apple-basic');
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  // 📡 HLS Test Configurations
  const hlsTestConfigs: Record<string, { title: string; config: PlayerConfig }> = {
    'hls-apple-basic': {
      title: '📱 HLS - Apple Basic Stream (Bipbop)',
      config: {
        src: {
          url: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8',
          type: 'video',
          mimeType: 'application/x-mpegURL'
        },
        ui: {
          showControls: true,
          autoplay: false,
          theme: 'dark'
        },
        analytics: {
          enabled: true,
          onEvent: (event) => {
            console.log('📱 HLS Basic Event:', event);
            setTestResults(prev => ({ 
              ...prev, 
              'hls-apple-basic': { 
                ...prev['hls-apple-basic'], 
                events: [...(prev['hls-apple-basic']?.events || []), event] 
              }
            }));
          }
        }
      }
    },

    'hls-apple-advanced': {
      title: '🚀 HLS - Apple Advanced (FMP4 Segments)',
      config: {
        src: {
          url: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8',
          type: 'video',
          mimeType: 'application/x-mpegURL'
        },
        ui: {
          showControls: true,
          autoplay: false,
          theme: 'dark'
        },
        analytics: {
          enabled: true,
          onEvent: (event) => {
            console.log('🚀 HLS Advanced Event:', event);
            setTestResults(prev => ({ 
              ...prev, 
              'hls-apple-advanced': { 
                ...prev['hls-apple-advanced'], 
                events: [...(prev['hls-apple-advanced']?.events || []), event] 
              }
            }));
          }
        }
      }
    },

    'hls-jwplayer': {
      title: '🎥 HLS - JW Player Test Stream',
      config: {
        src: {
          url: 'https://playertest.longtailvideo.com/adaptive/captions/playlist.m3u8',
          type: 'video',
          mimeType: 'application/x-mpegURL'
        },
        ui: {
          showControls: true,
          autoplay: false,
          theme: 'dark'
        },
        analytics: {
          enabled: true,
          onEvent: (event) => {
            console.log('🎥 HLS JWPlayer Event:', event);
            setTestResults(prev => ({ 
              ...prev, 
              'hls-jwplayer': { 
                ...prev['hls-jwplayer'], 
                events: [...(prev['hls-jwplayer']?.events || []), event] 
              }
            }));
          }
        }
      }
    }
  };

  // 📡 DASH Test Configurations
  const dashTestConfigs: Record<string, { title: string; config: PlayerConfig }> = {
    'dash-bbb': {
      title: '🐰 DASH - Big Buck Bunny (Akamai)',
      config: {
        src: {
          url: 'https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd',
          type: 'video',
          mimeType: 'application/dash+xml'
        },
        ui: {
          showControls: true,
          autoplay: false,
          theme: 'dark'
        },
        analytics: {
          enabled: true,
          onEvent: (event) => {
            console.log('🐰 DASH BBB Event:', event);
            setTestResults(prev => ({ 
              ...prev, 
              'dash-bbb': { 
                ...prev['dash-bbb'], 
                events: [...(prev['dash-bbb']?.events || []), event] 
              }
            }));
          }
        }
      }
    },

    'dash-tears': {
      title: '😢 DASH - Tears of Steel (Multi-res)',
      config: {
        src: {
          url: 'https://dash.akamaized.net/dash264/TestCases/2c/qualcomm/1/MultiResMPEG2.mpd',
          type: 'video',
          mimeType: 'application/dash+xml'
        },
        ui: {
          showControls: true,
          autoplay: false,
          theme: 'dark'
        },
        analytics: {
          enabled: true,
          onEvent: (event) => {
            console.log('😢 DASH Tears Event:', event);
            setTestResults(prev => ({ 
              ...prev, 
              'dash-tears': { 
                ...prev['dash-tears'], 
                events: [...(prev['dash-tears']?.events || []), event] 
              }
            }));
          }
        }
      }
    },

    'dash-live': {
      title: '📺 DASH - Live Stream Test',
      config: {
        src: {
          url: 'https://livesim.dashif.org/livesim/testpic_2s/Manifest.mpd',
          type: 'video',
          mimeType: 'application/dash+xml'
        },
        ui: {
          showControls: true,
          autoplay: false,
          theme: 'dark'
        },
        analytics: {
          enabled: true,
          onEvent: (event) => {
            console.log('📺 DASH Live Event:', event);
            setTestResults(prev => ({ 
              ...prev, 
              'dash-live': { 
                ...prev['dash-live'], 
                events: [...(prev['dash-live']?.events || []), event] 
              }
            }));
          }
        }
      }
    }
  };

  // Combine all test configurations
  const allTestConfigs = { ...hlsTestConfigs, ...dashTestConfigs };

  // Browser capability detection
  const detectCapabilities = () => {
    const video = document.createElement('video');
    const capabilities = {
      hlsNative: !!video.canPlayType('application/vnd.apple.mpegurl'),
      mse: 'MediaSource' in window && MediaSource.isTypeSupported('video/mp4; codecs="avc1.42E01E"'),
      dashSupport: 'MediaSource' in window && MediaSource.isTypeSupported('video/mp4; codecs="avc1.640028"'),
      webAssembly: 'WebAssembly' in window,
      userAgent: navigator.userAgent
    };
    
    console.log('🔍 Browser Capabilities:', capabilities);
    return capabilities;
  };

  const capabilities = detectCapabilities();

  const runAllTests = async () => {
    console.log('🧪 Starting comprehensive streaming tests...');
    
    for (const [testId, test] of Object.entries(allTestConfigs)) {
      console.log(`\n🎬 Testing: ${test.title}`);
      
      // You would implement actual playback testing here
      // For now, we'll simulate test results
      setTimeout(() => {
        setTestResults(prev => ({
          ...prev,
          [testId]: {
            status: 'completed',
            timestamp: new Date().toISOString(),
            events: []
          }
        }));
      }, 1000);
    }
  };

  const getCurrentConfig = () => allTestConfigs[currentTest]?.config;
  const getCurrentTitle = () => allTestConfigs[currentTest]?.title || 'Unknown Test';

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0a0a0a', 
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          marginBottom: '10px',
          background: 'linear-gradient(135deg, #ff0000, #ff6b6b)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          🎬 DASH & HLS Streaming Tests
        </h1>
        <p style={{ opacity: 0.8, fontSize: '1.1rem' }}>
          Comprehensive testing for adaptive bitrate streaming protocols
        </p>
      </div>

      {/* Browser Capabilities */}
      <div style={{ 
        backgroundColor: '#1a1a1a', 
        borderRadius: '10px', 
        padding: '20px', 
        marginBottom: '30px' 
      }}>
        <h2 style={{ marginBottom: '15px' }}>🌐 Browser Capabilities</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '15px' 
        }}>
          <div style={{ padding: '10px', backgroundColor: '#333', borderRadius: '5px' }}>
            <strong>📱 Native HLS:</strong> {capabilities.hlsNative ? '✅ Supported' : '❌ Not Supported'}
          </div>
          <div style={{ padding: '10px', backgroundColor: '#333', borderRadius: '5px' }}>
            <strong>📡 MediaSource:</strong> {capabilities.mse ? '✅ Supported' : '❌ Not Supported'}
          </div>
          <div style={{ padding: '10px', backgroundColor: '#333', borderRadius: '5px' }}>
            <strong>🎬 DASH Support:</strong> {capabilities.dashSupport ? '✅ Supported' : '❌ Not Supported'}
          </div>
          <div style={{ padding: '10px', backgroundColor: '#333', borderRadius: '5px' }}>
            <strong>🔧 WebAssembly:</strong> {capabilities.webAssembly ? '✅ Supported' : '❌ Not Supported'}
          </div>
        </div>
      </div>

      {/* Test Selection */}
      <div style={{ 
        backgroundColor: '#1a1a1a', 
        borderRadius: '10px', 
        padding: '20px', 
        marginBottom: '30px' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>🧪 Available Tests</h2>
          <button
            onClick={runAllTests}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ff0000',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            🚀 Run All Tests
          </button>
        </div>

        {/* HLS Tests */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '10px', color: '#ff6b6b' }}>📱 HLS Tests</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '10px' }}>
            {Object.entries(hlsTestConfigs).map(([testId, test]) => (
              <button
                key={testId}
                onClick={() => setCurrentTest(testId)}
                style={{
                  padding: '15px',
                  backgroundColor: currentTest === testId ? '#ff0000' : '#333',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.3s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{test.title}</span>
                  <span>{testResults[testId]?.status === 'completed' ? '✅' : '⏳'}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* DASH Tests */}
        <div>
          <h3 style={{ marginBottom: '10px', color: '#6bb6ff' }}>📡 DASH Tests</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '10px' }}>
            {Object.entries(dashTestConfigs).map(([testId, test]) => (
              <button
                key={testId}
                onClick={() => setCurrentTest(testId)}
                style={{
                  padding: '15px',
                  backgroundColor: currentTest === testId ? '#ff0000' : '#333',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.3s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{test.title}</span>
                  <span>{testResults[testId]?.status === 'completed' ? '✅' : '⏳'}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Current Test Info */}
      <div style={{ 
        backgroundColor: '#1a1a1a', 
        borderRadius: '10px', 
        padding: '20px', 
        marginBottom: '30px' 
      }}>
        <h3 style={{ marginBottom: '15px' }}>
          🎯 Current Test: {getCurrentTitle()}
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '15px' 
        }}>
          <div>
            <strong>📍 Stream URL:</strong>
            <br />
            <code style={{ 
              fontSize: '0.9rem', 
              backgroundColor: '#333', 
              padding: '5px', 
              borderRadius: '3px',
              wordBreak: 'break-all',
              display: 'block',
              marginTop: '5px'
            }}>
              {getCurrentConfig()?.src.url}
            </code>
          </div>
          <div>
            <strong>📄 MIME Type:</strong>
            <br />
            <code style={{ 
              fontSize: '0.9rem', 
              backgroundColor: '#333', 
              padding: '5px', 
              borderRadius: '3px',
              display: 'block',
              marginTop: '5px'
            }}>
              {getCurrentConfig()?.src.mimeType}
            </code>
          </div>
        </div>
      </div>

      {/* Video Player */}
      <div style={{ 
        backgroundColor: '#1a1a1a', 
        borderRadius: '10px', 
        padding: '20px', 
        marginBottom: '30px' 
      }}>
        <h3 style={{ marginBottom: '15px' }}>🎬 Player Test Area</h3>
        {getCurrentConfig() && (
          <div style={{ 
            backgroundColor: '#000', 
            borderRadius: '8px', 
            overflow: 'hidden',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            <MediaPlayer config={getCurrentConfig()!} />
          </div>
        )}
      </div>

      {/* Test Instructions */}
      <div style={{ 
        backgroundColor: '#1a1a1a', 
        borderRadius: '10px', 
        padding: '20px' 
      }}>
        <h3 style={{ marginBottom: '15px' }}>📝 Testing Instructions</h3>
        <div style={{ lineHeight: '1.8' }}>
          <ol>
            <li><strong>Select a test</strong> from the HLS or DASH sections above</li>
            <li><strong>Click play</strong> on the video player to start streaming</li>
            <li><strong>Test quality switching</strong> using the settings menu (⚙️ gear icon)</li>
            <li><strong>Try seeking</strong> to different parts of the video</li>
            <li><strong>Monitor the browser console</strong> for detailed streaming logs</li>
            <li><strong>Test network conditions</strong> by throttling your connection</li>
            <li><strong>Test on different browsers</strong> to verify compatibility</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default DashHlsTest;
