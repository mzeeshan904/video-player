import React, { useState } from 'react';
import { MediaPlayer, PlayerConfig } from 'advanced-react-media-player';

const RegressionTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [analyticsEvents, setAnalyticsEvents] = useState<any[]>([]);

  const addResult = (test: string, passed: boolean) => {
    const result = `${passed ? '✅' : '❌'} ${test}`;
    setTestResults(prev => [...prev, result]);
    console.log(result);
  };

  // Test 1: Basic player without event hooks (should work exactly as before)
  const basicConfig: PlayerConfig = {
    src: {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      type: 'video',
      mimeType: 'video/mp4'
    },
    ui: {
      autoplay: false,
      showControls: true
    }
  };

  // Test 2: Enhanced analytics only (no event hooks)
  const enhancedAnalyticsConfig: PlayerConfig = {
    src: {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      type: 'video',
      mimeType: 'video/mp4'
    },
    analytics: {
      enabled: true,
      enhancedAnalytics: true,
      userId: 'test-user',
      onEvent: (event) => {
        setAnalyticsEvents(prev => [...prev, event]);
        addResult(`Enhanced Analytics Event: ${event.type}`, true);
      }
    },
    ui: {
      autoplay: false,
      showControls: true
    }
  };

  // Test 3: Legacy analytics (should still work)
  const legacyAnalyticsConfig: PlayerConfig = {
    src: {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      type: 'video',
      mimeType: 'video/mp4'
    },
    analytics: {
      enabled: true,
      enhancedAnalytics: false, // Legacy mode
      onEvent: (event) => {
        addResult(`Legacy Analytics Event: ${event.type}`, true);
      }
    },
    ui: {
      autoplay: false,
      showControls: true
    }
  };

  // Test 4: Ads without event hooks (should work as before)
  const adsConfig: PlayerConfig = {
    src: {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      type: 'video',
      mimeType: 'video/mp4'
    },
    ads: {
      preRoll: [
        {
          id: 'test-preroll',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          duration: 10,
          skippable: true,
          skipAfter: 3
        }
      ]
    },
    ui: {
      autoplay: false,
      showControls: true
    }
  };

  // Test 5: Everything combined with event hooks
  const fullConfig: PlayerConfig = {
    src: {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      type: 'video',
      mimeType: 'video/mp4'
    },
    ads: {
      preRoll: [
        {
          id: 'full-test-preroll',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          duration: 8,
          skippable: true,
          skipAfter: 3
        }
      ]
    },
    analytics: {
      enabled: true,
      enhancedAnalytics: true,
      userId: 'test-user-full',
      onEvent: (event) => {
        addResult(`Full Config Analytics: ${event.type}`, true);
      }
    },
    events: {
      onSkip: (item) => {
        addResult(`Event Hook - onSkip: ${item?.id}`, true);
      },
      onAdStarted: (ad) => {
        addResult(`Event Hook - onAdStarted: ${ad?.id}`, true);
      },
      onPlayStarted: (src) => {
        addResult(`Event Hook - onPlayStarted`, true);
      },
      onPause: (src) => {
        addResult(`Event Hook - onPause`, true);
      }
    },
    ui: {
      autoplay: false,
      showControls: true
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <h1>🧪 Regression Test Suite</h1>
      <p>Testing all configurations to ensure no functionality was broken:</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        
        {/* Test 1: Basic Player */}
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', backgroundColor: 'white' }}>
          <h3>Test 1: Basic Player (No Analytics, No Events)</h3>
          <p>Should work exactly as before the changes</p>
          <div style={{ height: '200px' }}>
            <MediaPlayer config={basicConfig} />
          </div>
        </div>

        {/* Test 2: Enhanced Analytics Only */}
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', backgroundColor: 'white' }}>
          <h3>Test 2: Enhanced Analytics Only</h3>
          <p>Should provide comprehensive analytics without event hooks</p>
          <div style={{ height: '200px' }}>
            <MediaPlayer config={enhancedAnalyticsConfig} />
          </div>
        </div>

        {/* Test 3: Legacy Analytics */}
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', backgroundColor: 'white' }}>
          <h3>Test 3: Legacy Analytics</h3>
          <p>Should work exactly as before (backward compatibility)</p>
          <div style={{ height: '200px' }}>
            <MediaPlayer config={legacyAnalyticsConfig} />
          </div>
        </div>

        {/* Test 4: Ads Without Event Hooks */}
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', backgroundColor: 'white' }}>
          <h3>Test 4: Ads Without Event Hooks</h3>
          <p>Ad system should work exactly as before</p>
          <div style={{ height: '200px' }}>
            <MediaPlayer config={adsConfig} />
          </div>
        </div>
      </div>

      {/* Test 5: Full Configuration */}
      <div style={{ border: '2px solid #007acc', padding: '15px', borderRadius: '8px', backgroundColor: 'white', marginBottom: '20px' }}>
        <h3>Test 5: Full Configuration (Analytics + Event Hooks + Ads)</h3>
        <p>Everything should work together without conflicts</p>
        <div style={{ height: '300px' }}>
          <MediaPlayer config={fullConfig} />
        </div>
      </div>

      {/* Test Results */}
      <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', backgroundColor: 'white' }}>
        <h3>📊 Test Results:</h3>
        <div style={{ maxHeight: '200px', overflowY: 'auto', backgroundColor: '#f9f9f9', padding: '10px', fontFamily: 'monospace' }}>
          {testResults.length === 0 ? (
            <p>Start interacting with the players above to see test results...</p>
          ) : (
            testResults.map((result, index) => (
              <div key={index}>{result}</div>
            ))
          )}
        </div>
      </div>

      {/* Analytics Events Log */}
      <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', backgroundColor: 'white', marginTop: '20px' }}>
        <h3>📈 Analytics Events Log:</h3>
        <div style={{ maxHeight: '150px', overflowY: 'auto', backgroundColor: '#f9f9f9', padding: '10px', fontFamily: 'monospace', fontSize: '12px' }}>
          {analyticsEvents.length === 0 ? (
            <p>No analytics events yet...</p>
          ) : (
            analyticsEvents.map((event, index) => (
              <div key={index}>
                <strong>{event.type}:</strong> {JSON.stringify(event.payload || {}, null, 2).substring(0, 100)}...
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e8f4fd', borderRadius: '8px' }}>
        <h4>🎯 Test Instructions:</h4>
        <ol>
          <li><strong>Test 1 & 3:</strong> Play/pause videos - should work normally</li>
          <li><strong>Test 2:</strong> Play/pause - should see enhanced analytics in log</li>
          <li><strong>Test 4:</strong> Watch preroll ad, try skipping - ads should work normally</li>
          <li><strong>Test 5:</strong> Watch ad, skip it, play main video - should see both analytics and event hooks</li>
          <li><strong>Check:</strong> No console errors, all features work as expected</li>
        </ol>
      </div>
    </div>
  );
};

export default RegressionTest;

// Expected Results:
// ✅ All existing functionality should work exactly as before
// ✅ Event hooks should be additional, not breaking changes
// ✅ Analytics should work in both legacy and enhanced modes
// ✅ Ads should work with and without event hooks
// ✅ No console errors or infinite re-renders
