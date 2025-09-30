import React, { useState } from 'react';
import { MediaPlayer, PlayerConfig } from 'advanced-react-media-player';

const FixedAnalyticsTest: React.FC = () => {
  const [eventLogs, setEventLogs] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    pauseCount: 0,
    resumeCount: 0,
    seekCount: 0,
    interactionCount: 0,
    qualityChangeCount: 0,
    volumeChangeCount: 0,
    replayCount: 0,
    totalEvents: 0
  });

  const logAnalyticsEvent = (event: any) => {
    setEventLogs(prev => [...prev.slice(-9), event]); // Keep last 10 events
    
    // Extract metrics from the event
    if (event.payload && event.payload.engagementMetrics) {
      const metrics = event.payload.engagementMetrics;
      setSummary({
        pauseCount: metrics.pauseCount,
        resumeCount: metrics.resumeCount,
        seekCount: metrics.seekCount,
        interactionCount: metrics.interactionCount,
        qualityChangeCount: metrics.qualityChangeCount,
        volumeChangeCount: metrics.volumeChangeCount,
        replayCount: metrics.replayCount,
        totalEvents: eventLogs.length + 1
      });
    }

    // Log specific examples for debugging
    if (event.type === 'pause') {
      console.log('🔥 FIXED onPause Event:', {
        eventName: event.payload.eventName,
        timestamp: event.payload.timestamp,
        sessionDuration: event.payload.sessionDuration,
        pauseCount: event.payload.engagementMetrics.pauseCount,
        interactionCount: event.payload.engagementMetrics.interactionCount,
        totalWatchTime: event.payload.engagementMetrics.totalWatchTime,
        uniqueViewTime: event.payload.engagementMetrics.uniqueViewTime,
        averageFrameRate: event.payload.performanceMetrics.averageFrameRate,
        contentCompletionRate: event.payload.engagementMetrics.contentCompletionRate
      });
    }

    if (event.type === 'settings_open' || event.type === 'settings_close') {
      console.log('🔥 FIXED onSettings Event:', {
        eventName: event.payload.eventName,
        timestamp: event.payload.timestamp,
        sessionDuration: event.payload.sessionDuration,
        interactionCount: event.payload.engagementMetrics.interactionCount,
        totalInteractions: event.payload.engagementMetrics.interactionCount
      });
    }
  };

  const testConfig: PlayerConfig = {
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
          duration: 8,
          skippable: true,
          skipAfter: 3
        }
      ]
    },
    analytics: {
      enabled: true,
      enhancedAnalytics: true,
      userId: 'test-user-fixed',
      onEvent: logAnalyticsEvent
    },
    ui: {
      autoplay: false,
      showControls: true,
      showSettings: true
    }
  };

  const clearLogs = () => {
    setEventLogs([]);
    setSummary({
      pauseCount: 0,
      resumeCount: 0,
      seekCount: 0,
      interactionCount: 0,
      qualityChangeCount: 0,
      volumeChangeCount: 0,
      replayCount: 0,
      totalEvents: 0
    });
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1>🔥 Fixed Analytics Metrics Test</h1>
      <p>All engagement metrics should now increment correctly!</p>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
        
        {/* Player */}
        <div style={{ border: '2px solid #28a745', padding: '15px', borderRadius: '8px', backgroundColor: 'white' }}>
          <h3>📹 Test Player</h3>
          <p>Interact with the player to see metrics update:</p>
          <div style={{ height: '300px' }}>
            <MediaPlayer config={testConfig} />
          </div>
          <div style={{ marginTop: '10px', fontSize: '12px', opacity: 0.8 }}>
            💡 Try: Play/Pause, Skip Ad, Change Settings, Volume, Quality
          </div>
        </div>

        {/* Real-time Metrics */}
        <div style={{ border: '1px solid #007acc', padding: '15px', borderRadius: '8px', backgroundColor: 'white' }}>
          <h3>📊 Live Metrics</h3>
          <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>
            <div>🎬 Total Events: <strong>{summary.totalEvents}</strong></div>
            <div>⏸ Pause Count: <strong>{summary.pauseCount}</strong></div>
            <div>▶️ Resume Count: <strong>{summary.resumeCount}</strong></div>
            <div>🔍 Seek Count: <strong>{summary.seekCount}</strong></div>
            <div>🎥 Quality Changes: <strong>{summary.qualityChangeCount}</strong></div>
            <div>🔊 Volume Changes: <strong>{summary.volumeChangeCount}</strong></div>
            <div>🔄 Replay Count: <strong>{summary.replayCount}</strong></div>
            <div style={{ borderTop: '1px solid #ccc', paddingTop: '5px', marginTop: '5px' }}>
              🤝 Total Interactions: <strong>{summary.interactionCount}</strong>
            </div>
          </div>
          <button 
            onClick={clearLogs}
            style={{ 
              marginTop: '10px', 
              padding: '5px 10px', 
              backgroundColor: '#dc3545', 
              color: 'white', 
              border: 'none', 
              borderRadius: '3px',
              fontSize: '12px'
            }}
          >
            Clear Metrics
          </button>
        </div>
      </div>

      {/* Event Log */}
      <div style={{ border: '1px solid #6c757d', padding: '15px', borderRadius: '8px', backgroundColor: 'white' }}>
        <h3>📋 Recent Events (Last 10)</h3>
        <div 
          style={{ 
            maxHeight: '200px', 
            overflowY: 'auto', 
            backgroundColor: '#f8f9fa', 
            padding: '10px', 
            fontFamily: 'monospace',
            fontSize: '12px',
            borderRadius: '3px'
          }}
        >
          {eventLogs.length === 0 ? (
            <div style={{ color: '#6c757d' }}>No events yet. Start interacting with the player...</div>
          ) : (
            eventLogs.map((event, index) => (
              <div key={index} style={{ marginBottom: '5px', padding: '3px', backgroundColor: index % 2 === 0 ? '#fff' : '#f1f3f4' }}>
                <strong>{event.type}:</strong> 
                {event.payload?.engagementMetrics && (
                  <span style={{ color: '#28a745' }}>
                    {' '}pauseCount={event.payload.engagementMetrics.pauseCount},
                    interactions={event.payload.engagementMetrics.interactionCount},
                    watchTime={Math.round(event.payload.engagementMetrics.totalWatchTime)}ms
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#d1ecf1', borderRadius: '8px' }}>
        <h4>✅ Expected Results (Fixed Issues):</h4>
        <ul style={{ fontSize: '14px' }}>
          <li>✅ <strong>pauseCount</strong> increments each time you pause</li>
          <li>✅ <strong>resumeCount</strong> increments when playing after pause</li>
          <li>✅ <strong>interactionCount</strong> increases with every user action</li>
          <li>✅ <strong>sessionDuration</strong> = event.timestamp - sessionStartTime</li>
          <li>✅ <strong>totalWatchTime</strong> & <strong>uniqueViewTime</strong> track actual playback</li>
          <li>✅ <strong>averageFrameRate</strong> shows realistic values (~24-30 fps)</li>
          <li>✅ <strong>contentCompletionRate</strong> = (uniqueViewTime / duration) * 100</li>
          <li>✅ All metrics start at 0 and increment correctly</li>
        </ul>
      </div>

      <div style={{ marginTop: '10px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px' }}>
        <h4>🧪 Test Actions:</h4>
        <ol style={{ fontSize: '14px' }}>
          <li>Play the video (watch <strong>interactionCount</strong> increase)</li>
          <li>Pause it (watch <strong>pauseCount</strong> increase)</li>
          <li>Play again (watch <strong>resumeCount</strong> increase)</li>
          <li>Open settings (watch <strong>interactionCount</strong> increase)</li>
          <li>Change volume (watch <strong>volumeChangeCount</strong> increase)</li>
          <li>Seek in video (watch <strong>seekCount</strong> increase)</li>
        </ol>
      </div>
    </div>
  );
};

export default FixedAnalyticsTest;

// 🔥 Fixed Issues Summary:
// 
// 1. ✅ Engagement Metrics Mapping:
//    - onPause → pauseCount++
//    - onPlay/onResume → resumeCount++  
//    - onSeek → seekCount++
//    - onSettings_open → interactionCount++
//    - All user actions → interactionCount++
//
// 2. ✅ Session Duration:
//    - Always: sessionDuration = event.timestamp - sessionStartTimestamp
//    - Consistent across all events
//
// 3. ✅ Frame Rate Calculation:
//    - averageFrameRate = totalFrames / currentPlaybackTime
//    - Realistic values (~24-30 fps)
//
// 4. ✅ Watch Time & Completion:
//    - totalWatchTime tracks actual playback duration
//    - uniqueViewTime updates on play/pause
//    - contentCompletionRate = (uniqueViewTime / duration) * 100
//
// 5. ✅ Event State Transitions:
//    - Captures before/after states
//    - Events show meaningful metric changes
