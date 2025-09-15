import React, { useState } from 'react';
import { MediaPlayer } from './src';
import { PlayerConfig } from './src/types';
import './src/components/MediaPlayer.css';

// 🔐 DRM Protected Content Test Suite
const DrmTest: React.FC = () => {
  const [currentTest, setCurrentTest] = useState<string>('widevine-basic');
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  // 🔐 DRM Test Configurations
  const drmTestConfigs: Record<string, { title: string; config: PlayerConfig; description: string }> = {
    'widevine-basic': {
      title: '🛡️ Widevine - Basic Protected Content',
      description: 'Tests basic Widevine DRM functionality with DASH streaming',
      config: {
        src: {
          url: 'https://storage.googleapis.com/shaka-demo-assets/angel-one-widevine/dash.mpd',
          type: 'video',
          mimeType: 'application/dash+xml',
          drm: {
            type: 'widevine',
            licenseUrl: 'https://cwip-shaka-proxy.appspot.com/no_auth',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        },
        ui: {
          showControls: true,
          autoplay: false,
          theme: 'dark'
        },
        analytics: {
          enabled: true,
          onEvent: (event) => {
            console.log('🛡️ Widevine Basic Event:', event);
            setTestResults(prev => ({ 
              ...prev, 
              'widevine-basic': { 
                ...prev['widevine-basic'], 
                events: [...(prev['widevine-basic']?.events || []), event] 
              }
            }));
          }
        }
      }
    },

    'widevine-advanced': {
      title: '🔒 Widevine - Multi-Key Content',
      description: 'Tests Widevine with multiple encryption keys and advanced features',
      config: {
        src: {
          url: 'https://storage.googleapis.com/shaka-demo-assets/sintel-widevine/dash.mpd',
          type: 'video',
          mimeType: 'application/dash+xml',
          drm: {
            type: 'widevine',
            licenseUrl: 'https://cwip-shaka-proxy.appspot.com/no_auth',
            headers: {
              'Content-Type': 'application/json',
              'X-Custom-Header': 'test-value'
            }
          }
        },
        ui: {
          showControls: true,
          autoplay: false,
          theme: 'dark'
        },
        analytics: {
          enabled: true,
          onEvent: (event) => {
            console.log('🔒 Widevine Advanced Event:', event);
            setTestResults(prev => ({ 
              ...prev, 
              'widevine-advanced': { 
                ...prev['widevine-advanced'], 
                events: [...(prev['widevine-advanced']?.events || []), event] 
              }
            }));
          }
        }
      }
    },

    'playready-basic': {
      title: '🔑 PlayReady - Microsoft DRM',
      description: 'Tests PlayReady DRM (works on Edge/Windows)',
      config: {
        src: {
          url: 'https://profficialsite.origin.mediaservices.windows.net/c51358ea-9a5e-4322-8951-897d640fdfd7/tearsofsteel_4k.ism/manifest(format=mpd-time-csf)',
          type: 'video',
          mimeType: 'application/dash+xml',
          drm: {
            type: 'playready',
            licenseUrl: 'https://test.playready.microsoft.com/service/rightsmanager.asmx',
            headers: {
              'Content-Type': 'text/xml; charset=utf-8',
              'SOAPAction': '"http://schemas.microsoft.com/DRM/2007/03/protocols/AcquireLicense"'
            }
          }
        },
        ui: {
          showControls: true,
          autoplay: false,
          theme: 'dark'
        },
        analytics: {
          enabled: true,
          onEvent: (event) => {
            console.log('🔑 PlayReady Event:', event);
            setTestResults(prev => ({ 
              ...prev, 
              'playready-basic': { 
                ...prev['playready-basic'], 
                events: [...(prev['playready-basic']?.events || []), event] 
              }
            }));
          }
        }
      }
    },

    'fairplay-basic': {
      title: '🍎 FairPlay - Apple DRM',
      description: 'Tests FairPlay DRM (works on Safari/iOS)',
      config: {
        src: {
          url: 'https://fps.ezdrm.com/demo/video/ezdrm.m3u8',
          type: 'video',
          mimeType: 'application/x-mpegURL',
          drm: {
            type: 'fairplay',
            licenseUrl: 'https://fps.ezdrm.com/api/licenses/09cc0377-6dd4-40cb-b09d-b582236e70fe',
            certificateUrl: 'https://fps.ezdrm.com/demo/video/eleisure.cer'
          }
        },
        ui: {
          showControls: true,
          autoplay: false,
          theme: 'dark'
        },
        analytics: {
          enabled: true,
          onEvent: (event) => {
            console.log('🍎 FairPlay Event:', event);
            setTestResults(prev => ({ 
              ...prev, 
              'fairplay-basic': { 
                ...prev['fairplay-basic'], 
                events: [...(prev['fairplay-basic']?.events || []), event] 
              }
            }));
          }
        }
      }
    },

    'multi-drm': {
      title: '🌐 Multi-DRM - Universal Protection',
      description: 'Tests content that supports multiple DRM systems',
      config: {
        src: {
          url: 'https://storage.googleapis.com/shaka-demo-assets/angel-one-multidrm/dash.mpd',
          type: 'video',
          mimeType: 'application/dash+xml',
          drm: {
            type: 'widevine', // Primary DRM system
            licenseUrl: 'https://cwip-shaka-proxy.appspot.com/no_auth',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        },
        ui: {
          showControls: true,
          autoplay: false,
          theme: 'dark'
        },
        analytics: {
          enabled: true,
          onEvent: (event) => {
            console.log('🌐 Multi-DRM Event:', event);
            setTestResults(prev => ({ 
              ...prev, 
              'multi-drm': { 
                ...prev['multi-drm'], 
                events: [...(prev['multi-drm']?.events || []), event] 
              }
            }));
          }
        }
      }
    }
  };

  // DRM capability detection
  const detectDrmCapabilities = () => {
    const capabilities = {
      eme: 'navigator' in window && 'requestMediaKeySystemAccess' in navigator,
      widevine: false,
      playready: false,
      fairplay: false,
      clearkeySupport: false
    };

    // Test for specific DRM systems
    if (capabilities.eme) {
      // These are async checks, so we'll just indicate EME support for now
      capabilities.widevine = 'MediaKeys' in window;
      capabilities.playready = 'MediaKeys' in window && /Edge|Windows/.test(navigator.userAgent);
      capabilities.fairplay = 'WebKitMediaKeys' in window || /Safari|iPhone|iPad/.test(navigator.userAgent);
      capabilities.clearkeySupport = 'MediaKeys' in window;
    }

    console.log('🔍 DRM Capabilities:', capabilities);
    return capabilities;
  };

  const capabilities = detectDrmCapabilities();

  const testDrmSystemAccess = async () => {
    console.log('🧪 Testing DRM system access...');
    
    const drmSystems = [
      {
        name: 'Widevine',
        keySystem: 'com.widevine.alpha',
        config: [{
          initDataTypes: ['cenc'],
          audioCapabilities: [{ contentType: 'audio/mp4; codecs="mp4a.40.2"' }],
          videoCapabilities: [{ contentType: 'video/mp4; codecs="avc1.42E01E"' }]
        }]
      },
      {
        name: 'PlayReady',
        keySystem: 'com.microsoft.playready',
        config: [{
          initDataTypes: ['cenc'],
          audioCapabilities: [{ contentType: 'audio/mp4; codecs="mp4a.40.2"' }],
          videoCapabilities: [{ contentType: 'video/mp4; codecs="avc1.42E01E"' }]
        }]
      },
      {
        name: 'FairPlay',
        keySystem: 'com.apple.fps.1_0',
        config: [{
          initDataTypes: ['keyids', 'skd'],
          audioCapabilities: [{ contentType: 'audio/mp4; codecs="mp4a.40.2"' }],
          videoCapabilities: [{ contentType: 'video/mp4; codecs="avc1.42E01E"' }]
        }]
      },
      {
        name: 'ClearKey',
        keySystem: 'org.w3.clearkey',
        config: [{
          initDataTypes: ['cenc', 'keyids'],
          audioCapabilities: [{ contentType: 'audio/mp4; codecs="mp4a.40.2"' }],
          videoCapabilities: [{ contentType: 'video/mp4; codecs="avc1.42E01E"' }]
        }]
      }
    ];

    const results: Record<string, boolean> = {};

    for (const system of drmSystems) {
      try {
        if ('requestMediaKeySystemAccess' in navigator) {
          await navigator.requestMediaKeySystemAccess(system.keySystem, system.config);
          results[system.name] = true;
          console.log(`✅ ${system.name} supported`);
        }
      } catch (error) {
        results[system.name] = false;
        console.log(`❌ ${system.name} not supported:`, error);
      }
    }

    setTestResults(prev => ({ ...prev, drmSystemTest: results }));
    return results;
  };

  const getCurrentConfig = () => drmTestConfigs[currentTest]?.config;
  const getCurrentTitle = () => drmTestConfigs[currentTest]?.title || 'Unknown Test';
  const getCurrentDescription = () => drmTestConfigs[currentTest]?.description || '';

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
          background: 'linear-gradient(135deg, #ffd700, #ff8c00)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          🔐 DRM Protected Content Tests
        </h1>
        <p style={{ opacity: 0.8, fontSize: '1.1rem' }}>
          Testing Digital Rights Management with Widevine, PlayReady, and FairPlay
        </p>
      </div>

      {/* DRM Capabilities */}
      <div style={{ 
        backgroundColor: '#1a1a1a', 
        borderRadius: '10px', 
        padding: '20px', 
        marginBottom: '30px' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2>🔍 DRM Capabilities</h2>
          <button
            onClick={testDrmSystemAccess}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ffd700',
              color: '#000',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            🧪 Test DRM Systems
          </button>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '15px' 
        }}>
          <div style={{ padding: '10px', backgroundColor: '#333', borderRadius: '5px' }}>
            <strong>🔐 EME Support:</strong> {capabilities.eme ? '✅ Available' : '❌ Not Available'}
            <br />
            <small style={{ opacity: 0.7 }}>Encrypted Media Extensions API</small>
          </div>
          <div style={{ padding: '10px', backgroundColor: '#333', borderRadius: '5px' }}>
            <strong>🛡️ Widevine:</strong> {capabilities.widevine ? '✅ Likely Supported' : '❌ Not Detected'}
            <br />
            <small style={{ opacity: 0.7 }}>Google's DRM system</small>
          </div>
          <div style={{ padding: '10px', backgroundColor: '#333', borderRadius: '5px' }}>
            <strong>🔑 PlayReady:</strong> {capabilities.playready ? '✅ Likely Supported' : '❌ Not Detected'}
            <br />
            <small style={{ opacity: 0.7 }}>Microsoft's DRM system</small>
          </div>
          <div style={{ padding: '10px', backgroundColor: '#333', borderRadius: '5px' }}>
            <strong>🍎 FairPlay:</strong> {capabilities.fairplay ? '✅ Likely Supported' : '❌ Not Detected'}
            <br />
            <small style={{ opacity: 0.7 }}>Apple's DRM system</small>
          </div>
        </div>

        {testResults.drmSystemTest && (
          <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#2a2a2a', borderRadius: '5px' }}>
            <h4>🧪 DRM System Test Results:</h4>
            <div style={{ marginTop: '10px' }}>
              {Object.entries(testResults.drmSystemTest).map(([system, supported]) => (
                <div key={system} style={{ margin: '5px 0' }}>
                  <strong>{system}:</strong> {supported ? '✅ Supported' : '❌ Not Supported'}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* DRM Test Selection */}
      <div style={{ 
        backgroundColor: '#1a1a1a', 
        borderRadius: '10px', 
        padding: '20px', 
        marginBottom: '30px' 
      }}>
        <h2 style={{ marginBottom: '20px' }}>🧪 DRM Test Cases</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '15px' }}>
          {Object.entries(drmTestConfigs).map(([testId, test]) => (
            <button
              key={testId}
              onClick={() => setCurrentTest(testId)}
              style={{
                padding: '20px',
                backgroundColor: currentTest === testId ? '#ffd700' : '#333',
                color: currentTest === testId ? '#000' : '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.3s'
              }}
            >
              <div style={{ marginBottom: '10px' }}>
                <strong style={{ fontSize: '1.1rem' }}>{test.title}</strong>
              </div>
              <div style={{ 
                fontSize: '0.9rem', 
                opacity: 0.8,
                lineHeight: '1.4'
              }}>
                {test.description}
              </div>
              <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                  {test.config.src.drm?.type.toUpperCase()} DRM
                </span>
                <span>{testResults[testId]?.status === 'completed' ? '✅' : '⏳'}</span>
              </div>
            </button>
          ))}
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
        <p style={{ opacity: 0.8, marginBottom: '15px' }}>
          {getCurrentDescription()}
        </p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '15px' 
        }}>
          <div>
            <strong>📍 Stream URL:</strong>
            <br />
            <code style={{ 
              fontSize: '0.8rem', 
              backgroundColor: '#333', 
              padding: '8px', 
              borderRadius: '3px',
              wordBreak: 'break-all',
              display: 'block',
              marginTop: '5px'
            }}>
              {getCurrentConfig()?.src.url}
            </code>
          </div>
          <div>
            <strong>🔐 DRM System:</strong>
            <br />
            <code style={{ 
              fontSize: '0.9rem', 
              backgroundColor: '#333', 
              padding: '8px', 
              borderRadius: '3px',
              display: 'block',
              marginTop: '5px'
            }}>
              {getCurrentConfig()?.src.drm?.type.toUpperCase() || 'None'}
            </code>
          </div>
          <div>
            <strong>🎫 License Server:</strong>
            <br />
            <code style={{ 
              fontSize: '0.8rem', 
              backgroundColor: '#333', 
              padding: '8px', 
              borderRadius: '3px',
              wordBreak: 'break-all',
              display: 'block',
              marginTop: '5px'
            }}>
              {getCurrentConfig()?.src.drm?.licenseUrl || 'None'}
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
        <h3 style={{ marginBottom: '15px' }}>🎬 DRM Player Test Area</h3>
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

      {/* Testing Instructions */}
      <div style={{ 
        backgroundColor: '#1a1a1a', 
        borderRadius: '10px', 
        padding: '20px' 
      }}>
        <h3 style={{ marginBottom: '15px' }}>📝 DRM Testing Instructions</h3>
        <div style={{ lineHeight: '1.8' }}>
          <ol>
            <li><strong>Check DRM capabilities</strong> by clicking "Test DRM Systems" above</li>
            <li><strong>Select a DRM test</strong> appropriate for your browser:
              <ul style={{ marginTop: '5px', marginLeft: '20px' }}>
                <li>🛡️ <strong>Widevine:</strong> Works on Chrome, Firefox, Edge</li>
                <li>🔑 <strong>PlayReady:</strong> Works on Edge, Windows browsers</li>
                <li>🍎 <strong>FairPlay:</strong> Works on Safari, iOS browsers</li>
              </ul>
            </li>
            <li><strong>Click play</strong> - DRM license acquisition should happen automatically</li>
            <li><strong>Monitor the console</strong> for DRM-related messages and errors</li>
            <li><strong>Test seeking and quality switching</strong> with protected content</li>
            <li><strong>Note:</strong> Some DRM content may require specific browser configurations</li>
          </ol>
        </div>
        
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#2a2a2a', 
          borderRadius: '5px',
          borderLeft: '4px solid #ffd700'
        }}>
          <strong>⚠️ Important Notes:</strong>
          <ul style={{ marginTop: '10px', marginLeft: '20px' }}>
            <li>DRM testing requires HTTPS (secure context)</li>
            <li>Some DRM systems may not work in development mode</li>
            <li>License servers used here are for testing purposes only</li>
            <li>Production DRM requires proper license server setup</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DrmTest;
