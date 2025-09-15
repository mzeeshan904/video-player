import React, { useState } from 'react';
import { MediaPlayer } from './src';
import { PlayerConfig } from './src/types';
import './src/components/MediaPlayer.css';

// Import test configurations
import DashHlsTest from './DASH_HLS_TEST';
import DrmTest from './DRM_TEST';

// 🧪 Comprehensive Test Runner Application
const ComprehensiveTestRunner: React.FC = () => {
  const [activeTestSuite, setActiveTestSuite] = useState<string>('overview');

  // Quick test configurations for immediate verification
  const quickTests: Record<string, { title: string; config: PlayerConfig; category: string }> = {
    'basic-mp4': {
      title: '🎬 Basic MP4 Video',
      category: 'Basic',
      config: {
        src: {
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          type: 'video',
          mimeType: 'video/mp4'
        },
        ui: { showControls: true, autoplay: false, theme: 'dark' },
        analytics: { enabled: true, onEvent: (e) => console.log('Basic MP4:', e) }
      }
    },
    
    'hls-quick': {
      title: '📱 HLS Stream (Quick)',
      category: 'Streaming',
      config: {
        src: {
          url: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8',
          type: 'video',
          mimeType: 'application/x-mpegURL'
        },
        ui: { showControls: true, autoplay: false, theme: 'dark' },
        analytics: { enabled: true, onEvent: (e) => console.log('HLS Quick:', e) }
      }
    },
    
    'dash-quick': {
      title: '📡 DASH Stream (Quick)',
      category: 'Streaming',
      config: {
        src: {
          url: 'https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd',
          type: 'video',
          mimeType: 'application/dash+xml'
        },
        ui: { showControls: true, autoplay: false, theme: 'dark' },
        analytics: { enabled: true, onEvent: (e) => console.log('DASH Quick:', e) }
      }
    },
    
    'drm-quick': {
      title: '🔐 DRM Protected (Quick)',
      category: 'DRM',
      config: {
        src: {
          url: 'https://storage.googleapis.com/shaka-demo-assets/angel-one-widevine/dash.mpd',
          type: 'video',
          mimeType: 'application/dash+xml',
          drm: {
            type: 'widevine',
            licenseUrl: 'https://cwip-shaka-proxy.appspot.com/no_auth'
          }
        },
        ui: { showControls: true, autoplay: false, theme: 'dark' },
        analytics: { enabled: true, onEvent: (e) => console.log('DRM Quick:', e) }
      }
    },
    
    'ads-complete': {
      title: '📺 Complete Ad Experience',
      category: 'Advertising',
      config: {
        src: {
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          type: 'video',
          mimeType: 'video/mp4'
        },
        ads: {
          preRoll: [{
            id: 'preroll-test',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            duration: 15,
            skippable: true,
            skipAfter: 5
          }],
          midRoll: [{
            id: 'midroll-test',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            duration: 15,
            skippable: true,
            skipAfter: 5,
            playAt: 30
          }],
          postRoll: [{
            id: 'postroll-test',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
            duration: 15,
            skippable: true,
            skipAfter: 5
          }]
        },
        ui: { showControls: true, autoplay: false, theme: 'dark' },
        analytics: { enabled: true, onEvent: (e) => console.log('Ads Complete:', e) }
      }
    }
  };

  const [currentQuickTest, setCurrentQuickTest] = useState<string>('basic-mp4');

  // System capability detection
  const detectSystemCapabilities = () => {
    const video = document.createElement('video');
    
    return {
      // Basic HTML5 Video Support
      html5Video: !!video.canPlayType,
      
      // Format Support
      mp4Support: !!video.canPlayType('video/mp4'),
      webmSupport: !!video.canPlayType('video/webm'),
      oggSupport: !!video.canPlayType('video/ogg'),
      
      // Streaming Support
      hlsNativeSupport: !!video.canPlayType('application/vnd.apple.mpegurl'),
      mseSupport: 'MediaSource' in window,
      dashSupport: 'MediaSource' in window && MediaSource.isTypeSupported('video/mp4; codecs="avc1.640028"'),
      
      // DRM Support
      emeSupport: 'navigator' in window && 'requestMediaKeySystemAccess' in navigator,
      
      // Advanced Features
      pipSupport: 'pictureInPictureEnabled' in document,
      fullscreenSupport: 'requestFullscreen' in video,
      webAssemblySupport: 'WebAssembly' in window,
      
      // Browser Info
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      
      // Screen Info
      screenWidth: screen.width,
      screenHeight: screen.height,
      devicePixelRatio: window.devicePixelRatio
    };
  };

  const capabilities = detectSystemCapabilities();

  const runQuickDiagnostics = () => {
    console.log('🔍 Running quick diagnostics...');
    console.log('System Capabilities:', capabilities);
    
    // Test each quick configuration
    Object.entries(quickTests).forEach(([testId, test]) => {
      console.log(`\n🧪 Testing: ${test.title}`);
      console.log('Category:', test.category);
      console.log('URL:', test.config.src.url);
      console.log('MIME Type:', test.config.src.mimeType);
      
      if (test.config.src.drm) {
        console.log('DRM Type:', test.config.src.drm.type);
      }
      
      if (test.config.ads) {
        console.log('Ads configured:', {
          preRoll: test.config.ads.preRoll?.length || 0,
          midRoll: test.config.ads.midRoll?.length || 0,
          postRoll: test.config.ads.postRoll?.length || 0
        });
      }
    });
  };

  const renderOverview = () => (
    <div>
      {/* System Overview */}
      <div style={{ 
        backgroundColor: '#1a1a1a', 
        borderRadius: '10px', 
        padding: '20px', 
        marginBottom: '30px' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>🔍 System Capabilities Overview</h2>
          <button
            onClick={runQuickDiagnostics}
            style={{
              padding: '10px 20px',
              backgroundColor: '#00ff00',
              color: '#000',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            🚀 Run Diagnostics
          </button>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '15px' 
        }}>
          <div style={{ padding: '15px', backgroundColor: '#333', borderRadius: '8px' }}>
            <h4 style={{ marginBottom: '10px', color: '#ff6b6b' }}>📹 Video Support</h4>
            <div>HTML5 Video: {capabilities.html5Video ? '✅' : '❌'}</div>
            <div>MP4: {capabilities.mp4Support ? '✅' : '❌'}</div>
            <div>WebM: {capabilities.webmSupport ? '✅' : '❌'}</div>
            <div>OGG: {capabilities.oggSupport ? '✅' : '❌'}</div>
          </div>

          <div style={{ padding: '15px', backgroundColor: '#333', borderRadius: '8px' }}>
            <h4 style={{ marginBottom: '10px', color: '#6bb6ff' }}>📡 Streaming</h4>
            <div>Native HLS: {capabilities.hlsNativeSupport ? '✅' : '❌'}</div>
            <div>MediaSource: {capabilities.mseSupport ? '✅' : '❌'}</div>
            <div>DASH Support: {capabilities.dashSupport ? '✅' : '❌'}</div>
          </div>

          <div style={{ padding: '15px', backgroundColor: '#333', borderRadius: '8px' }}>
            <h4 style={{ marginBottom: '10px', color: '#ffd700' }}>🔐 DRM & Security</h4>
            <div>EME Support: {capabilities.emeSupport ? '✅' : '❌'}</div>
            <div>HTTPS: {location.protocol === 'https:' ? '✅' : '❌'}</div>
          </div>

          <div style={{ padding: '15px', backgroundColor: '#333', borderRadius: '8px' }}>
            <h4 style={{ marginBottom: '10px', color: '#00ff88' }}>🚀 Advanced</h4>
            <div>Picture-in-Picture: {capabilities.pipSupport ? '✅' : '❌'}</div>
            <div>Fullscreen: {capabilities.fullscreenSupport ? '✅' : '❌'}</div>
            <div>WebAssembly: {capabilities.webAssemblySupport ? '✅' : '❌'}</div>
          </div>
        </div>

        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#2a2a2a', borderRadius: '8px' }}>
          <h4>📱 Device Information</h4>
          <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '10px' }}>
            <div><strong>Browser:</strong> {capabilities.userAgent}</div>
            <div><strong>Platform:</strong> {capabilities.platform}</div>
            <div><strong>Language:</strong> {capabilities.language}</div>
            <div><strong>Screen:</strong> {capabilities.screenWidth}x{capabilities.screenHeight} (DPR: {capabilities.devicePixelRatio})</div>
          </div>
        </div>
      </div>

      {/* Quick Tests */}
      <div style={{ 
        backgroundColor: '#1a1a1a', 
        borderRadius: '10px', 
        padding: '20px', 
        marginBottom: '30px' 
      }}>
        <h2 style={{ marginBottom: '20px' }}>⚡ Quick Tests</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
            {Object.entries(quickTests).map(([testId, test]) => (
              <button
                key={testId}
                onClick={() => setCurrentQuickTest(testId)}
                style={{
                  padding: '15px',
                  backgroundColor: currentQuickTest === testId ? '#00ff00' : '#333',
                  color: currentQuickTest === testId ? '#000' : '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.3s'
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{test.title}</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Category: {test.category}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Test Player */}
        <div style={{ 
          backgroundColor: '#000', 
          borderRadius: '8px', 
          overflow: 'hidden',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ padding: '10px', backgroundColor: '#333', fontSize: '1rem' }}>
            🎯 Current Quick Test: {quickTests[currentQuickTest].title}
          </div>
          <MediaPlayer config={quickTests[currentQuickTest].config} />
        </div>
      </div>

      {/* Test Suite Navigation */}
      <div style={{ 
        backgroundColor: '#1a1a1a', 
        borderRadius: '10px', 
        padding: '20px' 
      }}>
        <h2 style={{ marginBottom: '20px' }}>🧪 Comprehensive Test Suites</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div
            onClick={() => setActiveTestSuite('dash-hls')}
            style={{
              padding: '25px',
              backgroundColor: '#333',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              border: '2px solid transparent',
              ':hover': { backgroundColor: '#444' }
            }}
          >
            <h3 style={{ marginBottom: '15px', color: '#6bb6ff' }}>📡 DASH & HLS Tests</h3>
            <p style={{ opacity: 0.8, lineHeight: '1.5' }}>
              Comprehensive testing for adaptive bitrate streaming protocols including 
              HLS (HTTP Live Streaming) and DASH (Dynamic Adaptive Streaming) with 
              quality switching, error handling, and browser compatibility tests.
            </p>
            <div style={{ marginTop: '15px', fontSize: '0.9rem', color: '#6bb6ff' }}>
              ✓ Apple HLS Streams ✓ DASH Manifests ✓ Quality Switching ✓ Error Recovery
            </div>
          </div>

          <div
            onClick={() => setActiveTestSuite('drm')}
            style={{
              padding: '25px',
              backgroundColor: '#333',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              border: '2px solid transparent'
            }}
          >
            <h3 style={{ marginBottom: '15px', color: '#ffd700' }}>🔐 DRM Tests</h3>
            <p style={{ opacity: 0.8, lineHeight: '1.5' }}>
              Digital Rights Management testing with support for Widevine, PlayReady, 
              and FairPlay DRM systems. Tests license acquisition, protected content 
              playback, and multi-DRM scenarios.
            </p>
            <div style={{ marginTop: '15px', fontSize: '0.9rem', color: '#ffd700' }}>
              ✓ Widevine ✓ PlayReady ✓ FairPlay ✓ Multi-DRM ✓ License Servers
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0a0a0a', 
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '20px'
    }}>
      {/* Navigation Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: '#1a1a1a',
        borderRadius: '10px'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          margin: 0,
          background: 'linear-gradient(135deg, #ff0000, #ff6b6b, #6bb6ff, #ffd700)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          🧪 Media Player Test Suite
        </h1>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setActiveTestSuite('overview')}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTestSuite === 'overview' ? '#ff0000' : '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            🏠 Overview
          </button>
          <button
            onClick={() => setActiveTestSuite('dash-hls')}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTestSuite === 'dash-hls' ? '#6bb6ff' : '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            📡 DASH/HLS
          </button>
          <button
            onClick={() => setActiveTestSuite('drm')}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTestSuite === 'drm' ? '#ffd700' : '#333',
              color: activeTestSuite === 'drm' ? '#000' : '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            🔐 DRM
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div>
        {activeTestSuite === 'overview' && renderOverview()}
        {activeTestSuite === 'dash-hls' && <DashHlsTest />}
        {activeTestSuite === 'drm' && <DrmTest />}
      </div>

      {/* Footer */}
      <div style={{ 
        marginTop: '50px', 
        padding: '20px', 
        backgroundColor: '#1a1a1a', 
        borderRadius: '10px',
        textAlign: 'center'
      }}>
        <h3>📋 Testing Guidelines</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px',
          marginTop: '20px',
          textAlign: 'left'
        }}>
          <div>
            <h4 style={{ color: '#ff6b6b' }}>🎯 Basic Testing</h4>
            <ul style={{ fontSize: '0.9rem', opacity: 0.8, lineHeight: '1.6' }}>
              <li>Start with Quick Tests for immediate verification</li>
              <li>Check system capabilities first</li>
              <li>Test basic MP4 playback before streaming</li>
              <li>Verify controls and UI responsiveness</li>
            </ul>
          </div>
          
          <div>
            <h4 style={{ color: '#6bb6ff' }}>📡 Streaming Testing</h4>
            <ul style={{ fontSize: '0.9rem', opacity: 0.8, lineHeight: '1.6' }}>
              <li>Test HLS on Safari and iOS devices</li>
              <li>Test DASH on Chrome, Firefox, Edge</li>
              <li>Verify quality switching works</li>
              <li>Test seeking in adaptive streams</li>
            </ul>
          </div>
          
          <div>
            <h4 style={{ color: '#ffd700' }}>🔐 DRM Testing</h4>
            <ul style={{ fontSize: '0.9rem', opacity: 0.8, lineHeight: '1.6' }}>
              <li>Ensure HTTPS is enabled</li>
              <li>Test appropriate DRM for each browser</li>
              <li>Check license acquisition in console</li>
              <li>Verify protected content plays correctly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveTestRunner;
