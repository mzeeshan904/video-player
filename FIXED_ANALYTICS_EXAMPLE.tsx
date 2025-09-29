// 🔥 **FIXED Enhanced Analytics Example**
// This shows the CORRECT way to get the comprehensive analytics format you need

import React, { useState, useRef } from 'react';
import { 
  MediaPlayer, 
  type PlayerConfig, 
  type AnalyticsEvent,
  type EnhancedAnalyticsEvent 
} from 'advanced-react-media-player';
import 'advanced-react-media-player/dist/index.css';

const FixedAnalyticsExample: React.FC = () => {
  const [analyticsLog, setAnalyticsLog] = useState<any[]>([]);
  const eventCountRef = useRef<Record<string, number>>({});

  // ✅ CORRECT Enhanced Analytics Handler
  const handleEnhancedAnalytics = (event: AnalyticsEvent) => {
    console.log('🔍 Raw Event Received:', event);

    // Check if this is an enhanced analytics event
    if (event.payload && typeof event.payload === 'object' && 'sessionId' in event.payload) {
      // ✅ Enhanced Analytics Event - This is what you want!
      const enhancedEvent = event.payload as EnhancedAnalyticsEvent;
      
      // Count events
      const eventName = enhancedEvent.eventName;
      eventCountRef.current[eventName] = (eventCountRef.current[eventName] || 0) + 1;
      
      // 🎯 This is the format you requested!
      const formattedEvent = {
        sessionId: enhancedEvent.sessionId,
        contentId: enhancedEvent.contentId,
        data: {
          eventName: enhancedEvent.eventName,
          timestamp: enhancedEvent.timestamp,
          sessionId: enhancedEvent.sessionId,
          userId: enhancedEvent.userId,
          contentId: enhancedEvent.contentId,
          contentMetadata: enhancedEvent.contentMetadata,
          playerData: enhancedEvent.playerData,
          sessionDuration: enhancedEvent.sessionDuration,
          engagementScore: enhancedEvent.engagementScore,
          engagementMetrics: enhancedEvent.engagementMetrics,
          performanceMetrics: enhancedEvent.performanceMetrics,
          qualityMetrics: enhancedEvent.qualityMetrics,
          deviceInfo: enhancedEvent.deviceInfo,
          playlistLength: enhancedEvent.playlistLength,
          position: enhancedEvent.position,
          bandwidth: enhancedEvent.bandwidth,
          isPaused: enhancedEvent.isPaused,
          isFullscreen: enhancedEvent.isFullscreen,
          playbackState: enhancedEvent.playbackState,
          isAd: enhancedEvent.isAd,
          // Additional fields for ad content
          ...(enhancedEvent.isAd && {
            adTitle: enhancedEvent.contentMetadata.title,
            totalWatchTime: enhancedEvent.engagementMetrics.totalWatchTime,
            uniqueViewTime: enhancedEvent.engagementMetrics.uniqueViewTime,
            pauseCount: enhancedEvent.engagementMetrics.pauseCount,
            resumeCount: enhancedEvent.engagementMetrics.resumeCount,
            seekCount: enhancedEvent.engagementMetrics.seekCount,
            qualityChangeCount: enhancedEvent.engagementMetrics.qualityChangeCount,
            volumeChangeCount: enhancedEvent.engagementMetrics.volumeChangeCount,
            fullscreenCount: enhancedEvent.engagementMetrics.fullscreenCount,
            interactionCount: enhancedEvent.engagementMetrics.interactionCount,
            replayCount: enhancedEvent.engagementMetrics.replayCount,
            averageViewingSession: enhancedEvent.engagementMetrics.averageViewingSession,
            contentCompletionRate: enhancedEvent.engagementMetrics.contentCompletionRate
          })
        }
      };

      console.log('✅ Enhanced Analytics Event (Your Format):', JSON.stringify(formattedEvent, null, 2));
      
      setAnalyticsLog(prev => [...prev, {
        type: 'enhanced',
        count: eventCountRef.current[eventName],
        event: formattedEvent
      }]);

    } else {
      // ❌ Legacy Analytics Event - This is what you're currently getting
      const eventType = event.type;
      eventCountRef.current[eventType] = (eventCountRef.current[eventType] || 0) + 1;
      
      console.log('❌ Legacy Event (Wrong Format):', event.type, event.payload);
      
      setAnalyticsLog(prev => [...prev, {
        type: 'legacy',
        count: eventCountRef.current[eventType],
        event: { type: event.type, payload: event.payload }
      }]);
    }
  };

  // 🎯 CORRECT Configuration for Enhanced Analytics
  const config: PlayerConfig = {
    src: {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      type: 'video',
      mimeType: 'video/mp4'
    },

    // 📺 Ad Configuration
    ads: {
      preRoll: [
        {
          id: 'preroll-1',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          duration: 15,
          skippable: true,
          skipAfter: 5,
          interactive: {
            type: 'poll',
            data: {
              question: "How do you like this enhanced analytics?",
              options: ["Perfect!", "Very Good", "Good"],
              duration: 8
            }
          }
        }
      ],
      midRoll: [
        {
          id: 'midroll-1',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
          duration: 15,
          playAt: 30,
          skippable: true,
          skipAfter: 5
        }
      ]
    },

    // 🔥 CRITICAL: Enhanced Analytics Configuration
    analytics: {
      enabled: true,
      enhancedAnalytics: true,  // ← This MUST be true for your format!
      userId: 'test-user-12345',
      onEvent: handleEnhancedAnalytics
    },

    ui: {
      theme: 'dark',
      autoplay: true,
      muted: true,
      showControls: true,
      showSettings: true
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#0a0a0a', 
      minHeight: '100vh',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ 
          fontSize: '2.5rem',
          background: 'linear-gradient(135deg, #ff6b6b, #4ecdc4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '10px'
        }}>
          🔥 FIXED Enhanced Analytics Demo
        </h1>
        <p style={{ opacity: 0.8, fontSize: '1.1rem', marginBottom: '20px' }}>
          This example shows the CORRECT enhanced analytics format
        </p>
        
        <div style={{
          background: '#1a4a1a',
          border: '2px solid #4CAF50',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3 style={{ color: '#4CAF50', margin: '0 0 10px 0' }}>✅ Configuration Status</h3>
          <div style={{ fontSize: '14px' }}>
            <div>🔥 Enhanced Analytics: <strong>ENABLED</strong></div>
            <div>👤 User ID: <strong>test-user-12345</strong></div>
            <div>📊 Event Format: <strong>Comprehensive Schema</strong></div>
          </div>
        </div>
      </header>

      {/* Media Player */}
      <div style={{ 
        width: '900px', 
        height: '506px', 
        margin: '0 auto 30px',
        border: '2px solid #333',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
      }}>
        <MediaPlayer config={config} />
      </div>

      {/* Analytics Dashboard */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Event Summary */}
        <div style={{
          background: '#1a1a1a',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '20px',
          border: '1px solid #333'
        }}>
          <h3 style={{ marginTop: 0, color: '#4ecdc4' }}>📊 Live Analytics Events</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '20px' }}>
            {Object.entries(eventCountRef.current).map(([eventName, count]) => (
              <div key={eventName} style={{
                background: count > 1 ? '#0a2a0a' : '#2a1a0a',
                border: `2px solid ${count > 1 ? '#4CAF50' : '#ff6b6b'}`,
                padding: '10px',
                borderRadius: '6px',
                textAlign: 'center'
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{eventName}</div>
                <div style={{ fontSize: '20px', margin: '5px 0' }}>{count}x</div>
                <div style={{ fontSize: '10px', opacity: 0.7 }}>
                  {count > 1 ? '✅ Multiple' : '⚠️ Single'}
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ fontSize: '14px', color: '#888' }}>
            Total Events: {analyticsLog.length} | 
            Enhanced: {analyticsLog.filter(e => e.type === 'enhanced').length} | 
            Legacy: {analyticsLog.filter(e => e.type === 'legacy').length}
          </div>
        </div>

        {/* Latest Event Display */}
        {analyticsLog.length > 0 && (
          <div style={{
            background: '#1a1a1a',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #333'
          }}>
            <h3 style={{ marginTop: 0, color: '#4ecdc4' }}>🔍 Latest Event Details</h3>
            
            {(() => {
              const latestEvent = analyticsLog[analyticsLog.length - 1];
              const isEnhanced = latestEvent.type === 'enhanced';
              
              return (
                <div>
                  <div style={{
                    background: isEnhanced ? '#0a2a0a' : '#2a1a0a',
                    border: `2px solid ${isEnhanced ? '#4CAF50' : '#ff6b6b'}`,
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '15px'
                  }}>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: 'bold',
                      color: isEnhanced ? '#4CAF50' : '#ff6b6b',
                      marginBottom: '10px'
                    }}>
                      {isEnhanced ? '✅ Enhanced Analytics Event' : '❌ Legacy Analytics Event'}
                    </div>
                    
                    {isEnhanced ? (
                      <div style={{ fontSize: '12px' }}>
                        <div><strong>Event:</strong> {latestEvent.event.data.eventName}</div>
                        <div><strong>Session ID:</strong> {latestEvent.event.sessionId}</div>
                        <div><strong>Content Type:</strong> {latestEvent.event.data.contentMetadata.contentType}</div>
                        <div><strong>Engagement Score:</strong> {latestEvent.event.data.engagementScore}%</div>
                        <div><strong>Current Time:</strong> {latestEvent.event.data.playerData.currentTime.toFixed(2)}s</div>
                        <div><strong>Is Ad:</strong> {latestEvent.event.data.isAd ? 'Yes' : 'No'}</div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '12px' }}>
                        <div><strong>Event:</strong> {latestEvent.event.type}</div>
                        <div><strong>Payload:</strong> {JSON.stringify(latestEvent.event.payload)}</div>
                      </div>
                    )}
                  </div>
                  
                  <details style={{ fontSize: '12px' }}>
                    <summary style={{ cursor: 'pointer', color: '#4ecdc4' }}>
                      📋 View Full JSON Event Structure
                    </summary>
                    <pre style={{ 
                      background: '#000',
                      padding: '10px',
                      borderRadius: '4px',
                      overflow: 'auto',
                      maxHeight: '300px',
                      fontSize: '10px',
                      marginTop: '10px',
                      border: '1px solid #333'
                    }}>
                      {JSON.stringify(latestEvent.event, null, 2)}
                    </pre>
                  </details>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div style={{
        background: '#1a1a1a',
        padding: '20px',
        borderRadius: '12px',
        marginTop: '20px',
        border: '1px solid #333'
      }}>
        <h3 style={{ color: '#4ecdc4' }}>🎯 Testing Instructions</h3>
        
        <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
          <h4 style={{ color: '#fff' }}>✅ What You Should See:</h4>
          <ul style={{ color: '#ccc' }}>
            <li>Events should show as "✅ Enhanced Analytics Event"</li>
            <li>Event structure should match your requested format</li>
            <li>Each event should have sessionId, contentId, and data object</li>
            <li>Multiple clicks should increment event counts</li>
            <li>Console should show "Enhanced Analytics Event (Your Format)"</li>
          </ul>

          <h4 style={{ color: '#fff' }}>🧪 Actions to Test:</h4>
          <ul style={{ color: '#ccc' }}>
            <li>Click play/pause multiple times</li>
            <li>Seek to different positions</li>
            <li>Change volume</li>
            <li>Toggle fullscreen</li>
            <li>Wait for ad to start</li>
            <li>Interact with ad poll</li>
          </ul>

          <h4 style={{ color: '#fff' }}>🔍 Browser Console:</h4>
          <ul style={{ color: '#ccc' }}>
            <li>Open browser DevTools → Console</li>
            <li>Look for "✅ Enhanced Analytics Event (Your Format)" logs</li>
            <li>Verify JSON structure matches your specification</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FixedAnalyticsExample;
