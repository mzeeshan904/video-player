// 🧪 **Analytics Verification Test Component**
// This tests EXACTLY what format you should be getting

import React, { useState } from 'react';
import { 
  MediaPlayer, 
  type PlayerConfig, 
  type AnalyticsEvent 
} from 'advanced-react-media-player';
import 'advanced-react-media-player/dist/index.css';

const AnalyticsVerificationTest: React.FC = () => {
  const [lastEvent, setLastEvent] = useState<any>(null);
  const [eventLog, setEventLog] = useState<string[]>([]);

  const handleAnalytics = (event: AnalyticsEvent) => {
    const timestamp = new Date().toLocaleTimeString();
    
    // Check if this is enhanced analytics (has sessionId in payload)
    if (event.payload && typeof event.payload === 'object' && 'sessionId' in event.payload) {
      // ✅ Enhanced Analytics Event
      const enhancedEvent = event.payload;
      
      setLastEvent({
        type: 'enhanced',
        event: enhancedEvent,
        rawEvent: event
      });
      
      setEventLog(prev => [`${timestamp}: ✅ Enhanced ${enhancedEvent.eventName}`, ...prev.slice(0, 9)]);
      
      console.log('✅ ENHANCED ANALYTICS EVENT:', {
        eventName: enhancedEvent.eventName,
        sessionId: enhancedEvent.sessionId,
        contentId: enhancedEvent.contentId,
        fullEvent: enhancedEvent
      });
      
    } else {
      // ❌ Legacy Analytics Event (what you're currently getting)
      setLastEvent({
        type: 'legacy',
        event: event,
        rawEvent: event
      });
      
      setEventLog(prev => [`${timestamp}: ❌ Legacy ${event.type}`, ...prev.slice(0, 9)]);
      
      console.log('❌ LEGACY ANALYTICS EVENT:', event.type, event.payload);
    }
  };

  // Test configuration
  const config: PlayerConfig = {
    src: {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      type: 'video',
      mimeType: 'video/mp4'
    },
    
    ads: {
      preRoll: [
        {
          id: 'preroll-1',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          duration: 15,
          skippable: true,
          skipAfter: 5
        }
      ]
    },

    analytics: {
      enabled: true,
      enhancedAnalytics: true,  // 🔥 THIS SHOULD TRIGGER ENHANCED EVENTS
      userId: 'test-user-123',
      onEvent: handleAnalytics
    },

    ui: {
      theme: 'dark',
      autoplay: true,
      muted: true,
      showControls: true
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#000', 
      minHeight: '100vh',
      color: 'white',
      fontFamily: 'monospace'
    }}>
      <h1>🧪 Analytics Verification Test</h1>
      
      {/* Configuration Status */}
      <div style={{
        background: '#1a1a1a',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '2px solid #333'
      }}>
        <h3>⚙️ Configuration</h3>
        <div style={{ fontSize: '14px' }}>
          <div>✅ Analytics Enabled: <strong>true</strong></div>
          <div>🔥 Enhanced Analytics: <strong>true</strong></div>
          <div>👤 User ID: <strong>test-user-123</strong></div>
          <div>📋 Expected Format: <strong>Enhanced with sessionId</strong></div>
        </div>
      </div>

      {/* Media Player */}
      <div style={{ 
        width: '800px', 
        height: '450px',
        margin: '20px 0',
        border: '2px solid #333',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <MediaPlayer config={config} />
      </div>

      {/* Test Results */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* Latest Event Analysis */}
        <div style={{
          background: '#1a1a1a',
          padding: '20px',
          borderRadius: '8px',
          border: '2px solid #333'
        }}>
          <h3>🔍 Latest Event Analysis</h3>
          
          {lastEvent ? (
            <div>
              <div style={{
                background: lastEvent.type === 'enhanced' ? '#0a2a0a' : '#2a0a0a',
                border: `2px solid ${lastEvent.type === 'enhanced' ? '#4CAF50' : '#f44336'}`,
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '15px'
              }}>
                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold',
                  color: lastEvent.type === 'enhanced' ? '#4CAF50' : '#f44336',
                  marginBottom: '10px'
                }}>
                  {lastEvent.type === 'enhanced' ? '✅ ENHANCED EVENT' : '❌ LEGACY EVENT'}
                </div>
                
                {lastEvent.type === 'enhanced' ? (
                  <div style={{ fontSize: '12px' }}>
                    <div><strong>Event Name:</strong> {lastEvent.event.eventName}</div>
                    <div><strong>Session ID:</strong> {lastEvent.event.sessionId}</div>
                    <div><strong>Content ID:</strong> {lastEvent.event.contentId}</div>
                    <div><strong>User ID:</strong> {lastEvent.event.userId}</div>
                    <div><strong>Engagement Score:</strong> {lastEvent.event.engagementScore}%</div>
                    <div><strong>Is Ad:</strong> {lastEvent.event.isAd ? 'Yes' : 'No'}</div>
                    <div><strong>Content Type:</strong> {lastEvent.event.contentMetadata?.contentType}</div>
                  </div>
                ) : (
                  <div style={{ fontSize: '12px' }}>
                    <div><strong>Legacy Type:</strong> {lastEvent.event.type}</div>
                    <div><strong>Payload:</strong> {JSON.stringify(lastEvent.event.payload)}</div>
                    <div style={{ color: '#f44336', marginTop: '10px' }}>
                      ⚠️ This is NOT the enhanced format you need!
                    </div>
                  </div>
                )}
              </div>

              <details style={{ fontSize: '12px' }}>
                <summary style={{ cursor: 'pointer', color: '#4fc3f7' }}>
                  📋 View Raw Event Data
                </summary>
                <pre style={{ 
                  background: '#000',
                  padding: '10px',
                  borderRadius: '4px',
                  overflow: 'auto',
                  maxHeight: '200px',
                  fontSize: '10px',
                  marginTop: '10px'
                }}>
                  {JSON.stringify(lastEvent.event, null, 2)}
                </pre>
              </details>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
              🎬 Interact with the player to see event analysis
            </div>
          )}
        </div>

        {/* Event Log */}
        <div style={{
          background: '#1a1a1a',
          padding: '20px',
          borderRadius: '8px',
          border: '2px solid #333'
        }}>
          <h3>📊 Event Log</h3>
          
          <div style={{ fontSize: '12px', maxHeight: '300px', overflow: 'auto' }}>
            {eventLog.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                No events yet - start playing!
              </div>
            ) : (
              eventLog.map((log, index) => (
                <div key={index} style={{ 
                  padding: '5px 0',
                  borderBottom: '1px solid #333',
                  color: log.includes('✅') ? '#4CAF50' : '#f44336'
                }}>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div style={{
        background: '#1a1a1a',
        padding: '20px',
        borderRadius: '8px',
        marginTop: '20px',
        border: '2px solid #333'
      }}>
        <h3>🎯 What You Should See</h3>
        
        <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
          <h4 style={{ color: '#4CAF50' }}>✅ If Enhanced Analytics is Working:</h4>
          <ul>
            <li>Events show as "✅ ENHANCED EVENT"</li>
            <li>Event has sessionId, contentId, eventName fields</li>
            <li>contentMetadata, playerData, engagementMetrics are present</li>
            <li>Console logs show "✅ ENHANCED ANALYTICS EVENT"</li>
          </ul>

          <h4 style={{ color: '#f44336' }}>❌ If Still Getting Legacy Events:</h4>
          <ul>
            <li>Events show as "❌ LEGACY EVENT"</li>
            <li>Event only has type and simple payload</li>
            <li>Missing sessionId, comprehensive structure</li>
            <li>Console logs show "❌ LEGACY ANALYTICS EVENT"</li>
          </ul>

          <h4 style={{ color: '#4fc3f7' }}>🧪 Actions to Test:</h4>
          <ul>
            <li>Click play/pause</li>
            <li>Wait for ad to start</li>
            <li>Change volume</li>
            <li>Each should trigger events above</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsVerificationTest;
