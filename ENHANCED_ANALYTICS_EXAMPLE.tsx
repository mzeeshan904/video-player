// 📊 **Enhanced Analytics Implementation Example**
// 
// This example demonstrates how to implement comprehensive analytics tracking
// with the new enhanced analytics system that matches your specified schema.

import React, { useState } from 'react';
import { 
  MediaPlayer, 
  type PlayerConfig, 
  type AnalyticsEvent,
  type EnhancedAnalyticsEvent,
  EnhancedAnalyticsManager,
  EVENT_NAMES
} from 'advanced-react-media-player';
import 'advanced-react-media-player/dist/index.css';

const EnhancedAnalyticsExample: React.FC = () => {
  // 📊 Analytics State Management
  const [analyticsEvents, setAnalyticsEvents] = useState<EnhancedAnalyticsEvent[]>([]);
  const [isRecording, setIsRecording] = useState(true);

  // 🎯 Enhanced Analytics Event Handler
  const handleEnhancedAnalytics = (event: AnalyticsEvent) => {
    if (!isRecording) return;

    // The enhanced analytics event is in the payload
    const enhancedEvent = event.payload as EnhancedAnalyticsEvent;
    
    if (enhancedEvent) {
      setAnalyticsEvents(prev => [...prev, enhancedEvent]);
      
      // 📡 Send to your analytics backend
      sendToAnalyticsBackend(enhancedEvent);
      
      // 📝 Log key events
      console.log(`📊 ${enhancedEvent.eventName}:`, enhancedEvent);
    }
  };

  // 🚀 Send to Analytics Backend (Replace with your endpoint)
  const sendToAnalyticsBackend = async (event: EnhancedAnalyticsEvent) => {
    try {
      // Example: Send to your analytics service
      await fetch('https://your-analytics-api.com/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer your-api-key'
        },
        body: JSON.stringify(event)
      });
      
      console.log('✅ Analytics event sent successfully');
    } catch (error) {
      console.error('❌ Failed to send analytics event:', error);
    }
  };

  // 🎬 Player Configuration with Enhanced Analytics
  const config: PlayerConfig = {
    src: {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      type: 'video',
      mimeType: 'video/mp4'
    },
    
    // 📺 Complete Ad Configuration for Testing
    ads: {
      preRoll: [
        {
          id: 'enhanced-preroll-1',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          duration: 15,
          skippable: true,
          skipAfter: 5,
          interactive: {
            type: 'poll',
            data: {
              question: "How do you like our enhanced analytics?",
              options: ["Excellent", "Very Good", "Good"],
              duration: 8
            }
          }
        }
      ],
      midRoll: [
        {
          id: 'enhanced-midroll-1',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
          duration: 15,
          playAt: 60, // 1 minute into content
          skippable: true,
          skipAfter: 5
        }
      ],
      postRoll: [
        {
          id: 'enhanced-postroll-1',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
          duration: 30,
          skippable: false
        }
      ]
    },

    // 📊 Enhanced Analytics Configuration
    analytics: {
      enabled: true,
      enhancedAnalytics: true,  // 🔥 Enable comprehensive tracking
      userId: 'user_12345',     // Your user identification
      endpoint: 'https://your-analytics-api.com/events', // Your analytics endpoint
      onEvent: handleEnhancedAnalytics
    },

    // 🎨 UI Configuration
    ui: {
      theme: 'dark',
      autoplay: true,
      muted: true, // Required for autoplay
      showControls: true,
      showSettings: true,
      showDownload: false
    },

    // ⚙️ Player Settings
    settings: {
      playbackSpeed: 1,
      pictureInPicture: true
    }
  };

  // 📊 Analytics Dashboard Component
  const AnalyticsDashboard = () => (
    <div style={{ 
      background: '#1a1a1a', 
      color: 'white', 
      padding: '20px',
      borderRadius: '8px',
      marginTop: '20px',
      maxHeight: '400px',
      overflow: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3>📊 Enhanced Analytics Dashboard</h3>
        <div>
          <button 
            onClick={() => setIsRecording(!isRecording)}
            style={{
              background: isRecording ? '#ff4444' : '#44ff44',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              marginRight: '10px',
              cursor: 'pointer'
            }}
          >
            {isRecording ? '⏸️ Stop Recording' : '▶️ Start Recording'}
          </button>
          <button 
            onClick={() => setAnalyticsEvents([])}
            style={{
              background: '#666',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      <div style={{ fontSize: '14px', marginBottom: '15px' }}>
        <strong>Total Events:</strong> {analyticsEvents.length} | 
        <strong> Session Duration:</strong> {analyticsEvents.length > 0 ? 
          Math.round((Date.now() - analyticsEvents[0].timestamp) / 1000) : 0}s
      </div>

      {analyticsEvents.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#888', padding: '20px' }}>
          🎬 Start playing the video to see analytics events
        </div>
      ) : (
        <div>
          {analyticsEvents.slice(-10).reverse().map((event, index) => (
            <div 
              key={`${event.timestamp}-${index}`}
              style={{
                background: '#2a2a2a',
                padding: '10px',
                marginBottom: '8px',
                borderRadius: '4px',
                borderLeft: `4px solid ${getEventColor(event.eventName)}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>{event.eventName}</span>
                <span style={{ fontSize: '12px', color: '#888' }}>
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>
              
              <div style={{ fontSize: '12px', color: '#ccc', marginTop: '5px' }}>
                <div><strong>Current Time:</strong> {event.playerData.currentTime.toFixed(2)}s</div>
                <div><strong>Engagement Score:</strong> {event.engagementScore}%</div>
                <div><strong>Total Watch Time:</strong> {Math.round(event.engagementMetrics.totalWatchTime / 1000)}s</div>
                <div><strong>Interaction Count:</strong> {event.engagementMetrics.interactionCount}</div>
                {event.playerData.bandwidth > 0 && (
                  <div><strong>Bandwidth:</strong> {Math.round(event.playerData.bandwidth / 1000000)}Mbps</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // 🎨 Event color coding
  const getEventColor = (eventName: string) => {
    const colorMap: Record<string, string> = {
      [EVENT_NAMES.PLAY]: '#4CAF50',
      [EVENT_NAMES.PAUSE]: '#FF9800', 
      [EVENT_NAMES.SEEK]: '#2196F3',
      [EVENT_NAMES.VOLUME_CHANGE]: '#9C27B0',
      [EVENT_NAMES.FULLSCREEN_ENTER]: '#00BCD4',
      [EVENT_NAMES.BUFFERING_START]: '#F44336',
      [EVENT_NAMES.COMPLETE]: '#8BC34A',
      [EVENT_NAMES.AD_START]: '#FFD700',
    };
    return colorMap[eventName] || '#666';
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1>🎬 Enhanced Analytics Demo</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        This demo showcases comprehensive analytics tracking with engagement metrics, 
        performance monitoring, and real-time event streaming.
      </p>

      {/* Media Player */}
      <MediaPlayer config={config} />

      {/* Analytics Dashboard */}
      <AnalyticsDashboard />

      {/* Event Types Reference */}
      <div style={{ 
        background: '#f5f5f5', 
        padding: '20px', 
        borderRadius: '8px', 
        marginTop: '20px' 
      }}>
        <h3>📋 Tracked Event Types</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          <div>
            <h4>🎬 Playback Events</h4>
            <ul style={{ fontSize: '14px' }}>
              <li>onPlay</li>
              <li>onPause</li>
              <li>onResume</li>
              <li>onSeek</li>
              <li>onReplay</li>
              <li>onComplete</li>
            </ul>
          </div>
          
          <div>
            <h4>📺 Ad Events</h4>
            <ul style={{ fontSize: '14px' }}>
              <li>onAdStart</li>
              <li>onAdComplete</li>
              <li>onAdSkip</li>
              <li>onAdError</li>
            </ul>
          </div>
          
          <div>
            <h4>⚡ Performance</h4>
            <ul style={{ fontSize: '14px' }}>
              <li>onQualityChange</li>
              <li>onBufferingStart</li>
              <li>onBufferingEnd</li>
              <li>onError</li>
            </ul>
          </div>
          
          <div>
            <h4>👆 User Interaction</h4>
            <ul style={{ fontSize: '14px' }}>
              <li>onVolumeChange</li>
              <li>onFullscreenEnter</li>
              <li>onFullscreenExit</li>
              <li>onPlaybackRateChange</li>
              <li>onSubtitleToggle</li>
            </ul>
          </div>
        </div>
      </div>

      {/* JSON Schema Example */}
      <div style={{ 
        background: '#1a1a1a', 
        color: '#00ff00', 
        padding: '20px', 
        borderRadius: '8px', 
        marginTop: '20px',
        fontSize: '12px',
        fontFamily: 'monospace'
      }}>
        <h3 style={{ color: 'white' }}>📋 Sample Enhanced Analytics Event JSON</h3>
        <pre style={{ overflow: 'auto', maxHeight: '300px' }}>
{JSON.stringify({
  "sessionId": "session_1759139845899_bikumfv",
  "contentId": "content_1759139845899", 
  "eventName": "onPlay",
  "timestamp": 1759139850878,
  "userId": "user_12345",
  "contentMetadata": {
    "title": "Main-Content",
    "duration": 146,
    "contentType": "content",
    "protocol": 12,
    "contentUri": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "startTimeInSeconds": 0,
    "showSeekbar": true,
    "skippable": false,
    "isAd": false,
    "isSkippable": false,
    "hasSeekbar": true
  },
  "playerData": {
    "currentTime": 0,
    "duration": 146,
    "bandwidth": 2186589,
    "isPaused": false,
    "isFullscreen": false,
    "volume": 0,
    "playbackRate": 1,
    "quality": "auto",
    "buffered": null
  },
  "engagementMetrics": {
    "totalWatchTime": 0,
    "uniqueViewTime": 0,
    "replayCount": 0,
    "seekCount": 0,
    "pauseCount": 0,
    "resumeCount": 0,
    "qualityChangeCount": 0,
    "volumeChangeCount": 0,
    "fullscreenCount": 0,
    "interactionCount": 1,
    "engagementScore": 60
  },
  "performanceMetrics": {
    "initialLoadTime": 0,
    "bufferingTime": 0,
    "bufferingCount": 0,
    "averageBitrate": 0,
    "bitrateChanges": 0,
    "errorCount": 0,
    "startupTime": 4980,
    "videoStartFailures": 0
  },
  "deviceInfo": {
    "userAgent": "Mozilla/5.0...",
    "screenWidth": 1098,
    "screenHeight": 1036,
    "connectionType": "4g",
    "deviceMemory": 8
  }
}, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default EnhancedAnalyticsExample;
