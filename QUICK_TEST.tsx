// 🚀 QUICK TEST COMPONENT - Copy this to your React project
// File: src/components/QuickPlayerTest.tsx

import React from 'react';
import { MediaPlayer } from 'advanced-react-media-player';
import 'advanced-react-media-player/dist/index.css';

const QuickPlayerTest: React.FC = () => {
  const testConfig = {
    src: {
      // Your DASH content with proper MIME type
      url: "https://dspk-sandbox.airfi.io/content/dreamstream/video/eng/51716c7b-fcae-4b47-ba06-11712f63c581/c5130621-1f73-4cd2-aaca-3ad00a28c397.mpd",
      type: "video" as const,
      mimeType: "application/dash+xml", // ← FIXED: Correct MIME type for DASH
    },
    
    // Simple ad test
    ads: {
      preRoll: [
        {
          id: "test-preroll",
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
          duration: 15,
          skippable: true,
          skipAfter: 3,
        }
      ]
    },
    
    ui: {
      theme: "dark" as const,
      autoplay: true,
      muted: true,
      showControls: true,
      showSettings: true,
    },
    
    analytics: {
      enabled: true,
      onEvent: (event: any) => {
        // Watch console for these events
        console.log(`📊 Event: ${event.type}`, event.payload);
        
        // Key events to watch for:
        if (event.type === 'error') {
          console.error('❌ Player Error:', event.payload);
        }
        if (event.type === 'streaming_error') {
          console.warn('⚠️ Streaming Error (should be handled):', event.payload);
        }
      }
    }
  };

  return (
    <div style={{ 
      padding: '40px', 
      backgroundColor: '#0a0a0a', 
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ 
          color: 'white', 
          fontSize: '2.5rem',
          background: 'linear-gradient(135deg, #ff6b6b, #4ecdc4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '10px'
        }}>
          🎬 Advanced Media Player
        </h1>
        <p style={{ color: '#888', fontSize: '1.1rem' }}>
          Local Package Test - Version 1.3.0
        </p>
      </div>

      {/* Test Status */}
      <div style={{
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        border: '1px solid rgba(76, 175, 80, 0.3)',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '30px',
        maxWidth: '800px',
        margin: '0 auto 30px auto'
      }}>
        <h3 style={{ color: '#4caf50', marginBottom: '15px' }}>
          🧪 Testing Features:
        </h3>
        <div style={{ color: 'white', fontSize: '14px' }}>
          <p>✅ <strong>DASH Analysis:</strong> Check console for manifest analysis</p>
          <p>✅ <strong>Buffer Handling:</strong> Errors should be logged but not break playback</p>
          <p>✅ <strong>Ad Sequence:</strong> Pre-roll → Main content (no confusion)</p>
          <p>✅ <strong>Multiplexed Detection:</strong> Orange warning if content is multiplexed</p>
          <p>✅ <strong>Error Recovery:</strong> Player should handle all errors gracefully</p>
        </div>
      </div>
      
      {/* Player Container */}
      <div style={{ 
        maxWidth: '1000px', 
        margin: '0 auto',
        border: '2px solid #333',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      }}>
        <MediaPlayer config={testConfig} />
      </div>
      
      {/* Instructions */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: '30px',
        color: '#ccc',
        maxWidth: '800px',
        margin: '30px auto 0'
      }}>
        <h3 style={{ color: '#4ecdc4', marginBottom: '15px' }}>
          📋 What to Check:
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '20px',
          textAlign: 'left'
        }}>
          <div>
            <p><strong>Console Output:</strong></p>
            <ul style={{ fontSize: '14px', paddingLeft: '20px' }}>
              <li>🔍 DASH manifest analysis</li>
              <li>⚠️ Buffer error warnings (non-critical)</li>
              <li>📊 Analytics events</li>
              <li>🎯 Ad lifecycle events</li>
            </ul>
          </div>
          <div>
            <p><strong>Visual Indicators:</strong></p>
            <ul style={{ fontSize: '14px', paddingLeft: '20px' }}>
              <li>🟠 Orange warning (if multiplexed)</li>
              <li>🔵 Blue fallback warning (if needed)</li>
              <li>🎬 Pre-roll ad plays first</li>
              <li>⚙️ Settings menu works</li>
            </ul>
          </div>
        </div>
        
        <div style={{ 
          marginTop: '20px', 
          padding: '15px',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          border: '1px solid rgba(33, 150, 243, 0.3)',
          borderRadius: '8px'
        }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            <strong>🎯 Success Criteria:</strong> Player loads, DASH analysis runs, ads play correctly, 
            buffer errors are handled gracefully, and no main content appears as ads.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuickPlayerTest;

// 📝 USAGE INSTRUCTIONS:
// 1. Copy this file to your React project: src/components/QuickPlayerTest.tsx
// 2. Import and use in your App.tsx:
//    import QuickPlayerTest from './components/QuickPlayerTest';
//    function App() { return <QuickPlayerTest />; }
// 3. Open browser console (F12) to see all the logging
// 4. Watch for DASH analysis, buffer error handling, and ad sequence
