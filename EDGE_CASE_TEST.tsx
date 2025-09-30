import React from 'react';
import { MediaPlayer, PlayerConfig } from 'advanced-react-media-player';

const EdgeCaseTest: React.FC = () => {
  console.log('🧪 Testing Edge Cases...');

  // Edge Case 1: Undefined event hooks
  const configWithUndefinedEvents: PlayerConfig = {
    src: {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      type: 'video',
      mimeType: 'video/mp4'
    },
    events: undefined // Explicitly undefined
  };

  // Edge Case 2: Empty event hooks object
  const configWithEmptyEvents: PlayerConfig = {
    src: {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      type: 'video',
      mimeType: 'video/mp4'
    },
    events: {} // Empty object
  };

  // Edge Case 3: Event hooks that throw errors
  const configWithErroringEvents: PlayerConfig = {
    src: {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      type: 'video',
      mimeType: 'video/mp4'
    },
    events: {
      onPlayStarted: () => {
        throw new Error('Intentional error in onPlayStarted');
      },
      onPause: () => {
        console.log('onPause works fine');
      }
    }
  };

  // Edge Case 4: Config changes during runtime
  const [dynamicConfig, setDynamicConfig] = React.useState<PlayerConfig>({
    src: {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      type: 'video',
      mimeType: 'video/mp4'
    },
    events: {
      onPlayStarted: () => console.log('Initial onPlayStarted')
    }
  });

  const changeConfig = () => {
    setDynamicConfig({
      ...dynamicConfig,
      events: {
        onPlayStarted: () => console.log('Updated onPlayStarted'),
        onPause: () => console.log('New onPause handler')
      }
    });
  };

  // Edge Case 5: Very large event data
  const configWithLargeEventData: PlayerConfig = {
    src: {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      type: 'video',
      mimeType: 'video/mp4'
    },
    events: {
      onPlayStarted: (data) => {
        console.log('Large data test:', JSON.stringify(data).length, 'characters');
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>🧪 Edge Case Testing</h1>
      <p>Testing various edge cases to ensure robustness:</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
          <h3>Test 1: Undefined Events</h3>
          <p>Should work without errors when events is undefined</p>
          <div style={{ height: '200px' }}>
            <MediaPlayer config={configWithUndefinedEvents} />
          </div>
        </div>

        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
          <h3>Test 2: Empty Events Object</h3>
          <p>Should work with empty events object</p>
          <div style={{ height: '200px' }}>
            <MediaPlayer config={configWithEmptyEvents} />
          </div>
        </div>

        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
          <h3>Test 3: Erroring Event Hooks</h3>
          <p>Should handle errors gracefully without breaking player</p>
          <div style={{ height: '200px' }}>
            <MediaPlayer config={configWithErroringEvents} />
          </div>
        </div>

        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
          <h3>Test 4: Dynamic Config Changes</h3>
          <button onClick={changeConfig} style={{ marginBottom: '10px' }}>
            Change Event Handlers
          </button>
          <div style={{ height: '200px' }}>
            <MediaPlayer config={dynamicConfig} />
          </div>
        </div>

      </div>

      <div style={{ border: '2px solid #ff6b6b', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
        <h3>Test 5: Large Event Data</h3>
        <p>Testing with potentially large event data objects</p>
        <div style={{ height: '250px' }}>
          <MediaPlayer config={configWithLargeEventData} />
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '8px' }}>
        <h4>Expected Behavior:</h4>
        <ul>
          <li>✅ All players should load and function normally</li>
          <li>✅ Test 3 should log errors but continue working</li>
          <li>✅ Test 4 should use new handlers after button click</li>
          <li>✅ No crashes, infinite loops, or broken functionality</li>
          <li>✅ Console should show handled errors from Test 3</li>
        </ul>
      </div>
    </div>
  );
};

export default EdgeCaseTest;
