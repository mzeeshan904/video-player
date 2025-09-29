// 🐛 Analytics Debug Component
// Use this to diagnose why analytics events only fire once

import React, { useState, useRef } from 'react';
import { 
  MediaPlayer, 
  type PlayerConfig, 
  type AnalyticsEvent,
  type EnhancedAnalyticsEvent 
} from 'advanced-react-media-player';

const AnalyticsDebugger: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const eventCountRef = useRef<Record<string, number>>({});

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`]);
  };

  // 🔍 Enhanced Analytics Handler with Debug
  const handleAnalytics = (event: AnalyticsEvent) => {
    const eventType = event.type;
    
    // Count events by type
    eventCountRef.current[eventType] = (eventCountRef.current[eventType] || 0) + 1;
    
    addDebugInfo(`📊 Event received: ${eventType} (count: ${eventCountRef.current[eventType]})`);
    
    // Check if it's enhanced analytics
    if (event.payload && typeof event.payload === 'object' && 'sessionId' in event.payload) {
      const enhancedEvent = event.payload as EnhancedAnalyticsEvent;
      addDebugInfo(`✅ Enhanced event: ${enhancedEvent.eventName}`);
      
      setEvents(prev => [...prev, {
        type: 'enhanced',
        eventName: enhancedEvent.eventName,
        timestamp: enhancedEvent.timestamp,
        count: eventCountRef.current[eventType],
        sessionId: enhancedEvent.sessionId,
        engagementScore: enhancedEvent.engagementScore
      }]);
    } else {
      addDebugInfo(`📝 Legacy event: ${eventType}`);
      
      setEvents(prev => [...prev, {
        type: 'legacy',
        eventName: eventType,
        timestamp: event.timestamp,
        count: eventCountRef.current[eventType],
        payload: event.payload
      }]);
    }
    
    console.log('🐛 DEBUG - Event Details:', {
      type: eventType,
      count: eventCountRef.current[eventType],
      event,
      isEnhanced: !!(event.payload && typeof event.payload === 'object' && 'sessionId' in event.payload)
    });
  };

  // 🧪 Test Configurations
  const configs = {
    // Test 1: Enhanced Analytics (Should fire multiple times)
    enhanced: {
      src: {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        type: 'video' as const,
        mimeType: 'video/mp4'
      },
      analytics: {
        enabled: true,
        enhancedAnalytics: true,  // ✅ Enhanced mode
        userId: 'debug-user-123',
        onEvent: handleAnalytics
      },
      ui: {
        theme: 'dark' as const,
        autoplay: true,
        muted: true,
        showControls: true
      }
    } as PlayerConfig,

    // Test 2: Legacy Analytics (For comparison)
    legacy: {
      src: {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        type: 'video' as const,
        mimeType: 'video/mp4'
      },
      analytics: {
        enabled: true,
        enhancedAnalytics: false,  // ❌ Legacy mode
        onEvent: handleAnalytics
      },
      ui: {
        theme: 'dark' as const,
        autoplay: true,
        muted: true,
        showControls: true
      }
    } as PlayerConfig
  };

  const [currentConfig, setCurrentConfig] = useState<'enhanced' | 'legacy'>('enhanced');

  const clearLogs = () => {
    setEvents([]);
    setDebugInfo([]);
    eventCountRef.current = {};
  };

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#0a0a0a', 
      minHeight: '100vh',
      color: 'white',
      fontFamily: 'monospace'
    }}>
      <h1>🐛 Analytics Debug Tool</h1>
      
      {/* Configuration Controls */}
      <div style={{ 
        background: '#1a1a1a', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}>
        <h3>🔧 Configuration</h3>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ marginRight: '20px' }}>
            <input 
              type="radio" 
              checked={currentConfig === 'enhanced'}
              onChange={() => setCurrentConfig('enhanced')}
              style={{ marginRight: '5px' }}
            />
            Enhanced Analytics
          </label>
          <label>
            <input 
              type="radio" 
              checked={currentConfig === 'legacy'}
              onChange={() => setCurrentConfig('legacy')}
              style={{ marginRight: '5px' }}
            />
            Legacy Analytics
          </label>
        </div>
        
        <button 
          onClick={clearLogs}
          style={{
            background: '#ff4444',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🗑️ Clear Logs
        </button>
      </div>

      {/* Media Player */}
      <div style={{ 
        background: '#1a1a1a',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3>🎬 Media Player ({currentConfig} mode)</h3>
        <div style={{ 
          width: '800px', 
          height: '450px',
          border: '2px solid #333',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <MediaPlayer config={configs[currentConfig]} />
        </div>
      </div>

      {/* Analytics Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* Event Log */}
        <div style={{
          background: '#1a1a1a',
          padding: '20px',
          borderRadius: '8px',
          maxHeight: '400px',
          overflow: 'auto'
        }}>
          <h3>📊 Analytics Events (Total: {events.length})</h3>
          
          {/* Event Counts */}
          <div style={{ marginBottom: '15px', fontSize: '14px' }}>
            {Object.entries(eventCountRef.current).map(([eventType, count]) => (
              <div key={eventType} style={{ 
                background: count === 1 ? '#ffaa00' : '#00aa00',
                color: 'black',
                padding: '2px 8px',
                margin: '2px',
                borderRadius: '3px',
                display: 'inline-block'
              }}>
                {eventType}: {count}x
              </div>
            ))}
          </div>
          
          {events.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
              🎬 Interact with the player to see events
            </div>
          ) : (
            events.slice(-10).reverse().map((event, index) => (
              <div 
                key={`${event.timestamp}-${index}`}
                style={{
                  background: event.count === 1 ? '#2a1a00' : '#002a00',
                  border: `2px solid ${event.count === 1 ? '#ffaa00' : '#00aa00'}`,
                  padding: '10px',
                  marginBottom: '8px',
                  borderRadius: '4px'
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                  {event.eventName} 
                  <span style={{ 
                    background: event.count === 1 ? '#ffaa00' : '#00aa00',
                    color: 'black',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    marginLeft: '10px',
                    fontSize: '12px'
                  }}>
                    {event.count}x
                  </span>
                </div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>
                  Type: {event.type} | Time: {new Date(event.timestamp).toLocaleTimeString()}
                  {event.sessionId && <div>Session: {event.sessionId.substring(0, 20)}...</div>}
                  {event.engagementScore && <div>Engagement: {event.engagementScore}%</div>}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Debug Info */}
        <div style={{
          background: '#1a1a1a',
          padding: '20px',
          borderRadius: '8px',
          maxHeight: '400px',
          overflow: 'auto'
        }}>
          <h3>🔍 Debug Log</h3>
          <div style={{ fontSize: '12px' }}>
            {debugInfo.length === 0 ? (
              <div style={{ color: '#666', padding: '20px', textAlign: 'center' }}>
                Debug info will appear here
              </div>
            ) : (
              debugInfo.slice(-20).map((info, index) => (
                <div key={index} style={{ 
                  padding: '2px 0',
                  borderBottom: '1px solid #333'
                }}>
                  {info}
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
        marginTop: '20px'
      }}>
        <h3>🧪 Test Instructions</h3>
        <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
          <h4>🎯 Actions to Test (each should fire multiple times):</h4>
          <ul>
            <li>▶️ Click play/pause multiple times</li>
            <li>🔍 Seek to different positions</li>
            <li>🔊 Change volume several times</li>
            <li>📺 Toggle fullscreen on/off</li>
            <li>⚙️ Open/close settings menu</li>
          </ul>
          
          <h4>🔍 What to Look For:</h4>
          <ul>
            <li><strong style={{color: '#00aa00'}}>GREEN events</strong>: Firing multiple times (good!)</li>
            <li><strong style={{color: '#ffaa00'}}>YELLOW events</strong>: Only fired once (issue!)</li>
            <li>Check browser console for detailed logs</li>
            <li>Compare enhanced vs legacy mode behavior</li>
          </ul>
          
          <h4>🐛 Common Issues:</h4>
          <ul>
            <li>Events only fire once → Check if enhancedAnalytics is true</li>
            <li>No events at all → Check analytics.enabled is true</li>
            <li>Missing event handler → Verify onEvent callback is set</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDebugger;
