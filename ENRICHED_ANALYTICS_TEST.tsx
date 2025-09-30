import React, { useState } from 'react';
import { MediaPlayer, PlayerConfig } from 'advanced-react-media-player';

const EnrichedAnalyticsTest: React.FC = () => {
  const [eventLogs, setEventLogs] = useState<any[]>([]);
  const [lastContentEvent, setLastContentEvent] = useState<any>(null);
  const [lastAdEvent, setLastAdEvent] = useState<any>(null);

  const logAnalyticsEvent = (event: any) => {
    setEventLogs(prev => [...prev.slice(-4), event]); // Keep last 5 events
    
    // Separate content and ad events for comparison
    if (event.payload && event.payload.contentMetadata) {
      if (event.payload.contentMetadata.isAd) {
        setLastAdEvent(event.payload);
      } else {
        setLastContentEvent(event.payload);
      }
    }

    // Log enriched payload details
    if (event.payload) {
      console.log('🔥 ENRICHED ANALYTICS PAYLOAD:', {
        eventName: event.payload.eventName,
        contentMetadata: {
          title: event.payload.contentMetadata.title,
          duration: event.payload.contentMetadata.duration,
          contentType: event.payload.contentMetadata.contentType,
          contentUri: event.payload.contentMetadata.contentUri,
          isAd: event.payload.contentMetadata.isAd,
          skippable: event.payload.contentMetadata.skippable,
          adTitle: event.payload.contentMetadata.adTitle,
          index: event.payload.contentMetadata.index
        },
        playerData: {
          currentTime: event.payload.playerData.currentTime,
          duration: event.payload.playerData.duration,
          isPaused: event.payload.playerData.isPaused
        },
        performanceMetrics: {
          startupTime: event.payload.performanceMetrics.startupTime,
          initialLoadTime: event.payload.performanceMetrics.initialLoadTime,
          bufferingCount: event.payload.performanceMetrics.bufferingCount,
          bufferingTime: event.payload.performanceMetrics.bufferingTime
        }
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
          id: 'enriched-preroll-1',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          duration: 15,
          skippable: true,
          skipAfter: 5
        },
        {
          id: 'enriched-preroll-2', 
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
          duration: 10,
          skippable: false
        }
      ],
      postRoll: [
        {
          id: 'enriched-postroll-1',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
          duration: 12,
          skippable: true,
          skipAfter: 3
        }
      ]
    },
    analytics: {
      enabled: true,
      enhancedAnalytics: true,
      userId: 'enriched-test-user',
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
    setLastContentEvent(null);
    setLastAdEvent(null);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f8ff', minHeight: '100vh' }}>
      <h1>🔥 Enriched Analytics Payloads Test</h1>
      <p>Testing enriched metadata from config object in analytics payloads</p>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
        
        {/* Player */}
        <div style={{ border: '2px solid #007acc', padding: '15px', borderRadius: '8px', backgroundColor: 'white' }}>
          <h3>📹 Test Player (with Ads)</h3>
          <p>Watch ads and main content to see enriched analytics:</p>
          <div style={{ height: '300px' }}>
            <MediaPlayer config={testConfig} />
          </div>
          <div style={{ marginTop: '10px', fontSize: '12px', opacity: 0.8 }}>
            💡 Try: Watch preroll ads, skip them, watch main content, see postroll
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ border: '1px solid #28a745', padding: '15px', borderRadius: '8px', backgroundColor: 'white' }}>
            <h4>📊 Expected Enrichments</h4>
            <div style={{ fontSize: '12px', lineHeight: 1.6 }}>
              <strong>Content Events:</strong>
              <div>✅ contentUri: config.src.url</div>
              <div>✅ duration: video.duration || config</div>
              <div>✅ title: from filename</div>
              <div>✅ isAd: false</div>
              
              <strong style={{ marginTop: '10px', display: 'block' }}>Ad Events:</strong>
              <div>✅ contentUri: ad.url</div>
              <div>✅ duration: ad.duration</div>
              <div>✅ title: ad type</div>
              <div>✅ isAd: true</div>
              <div>✅ skippable: ad.skippable</div>
              <div>✅ skipAfter: ad.skipAfter</div>
              <div>✅ index: ad position</div>
            </div>
          </div>

          <button 
            onClick={clearLogs}
            style={{ 
              padding: '10px', 
              backgroundColor: '#dc3545', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              fontSize: '14px'
            }}
          >
            Clear Logs
          </button>
        </div>
      </div>

      {/* Comparison Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        
        {/* Content Event */}
        <div style={{ border: '1px solid #28a745', padding: '15px', borderRadius: '8px', backgroundColor: 'white' }}>
          <h3>📺 Latest Content Event</h3>
          {lastContentEvent ? (
            <div style={{ fontFamily: 'monospace', fontSize: '11px', backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '3px', maxHeight: '200px', overflow: 'auto' }}>
              <div><strong>Event:</strong> {lastContentEvent.eventName}</div>
              <div><strong>Title:</strong> {lastContentEvent.contentMetadata.title}</div>
              <div><strong>URI:</strong> {lastContentEvent.contentMetadata.contentUri}</div>
              <div><strong>Duration:</strong> {lastContentEvent.contentMetadata.duration}s</div>
              <div><strong>Type:</strong> {lastContentEvent.contentMetadata.contentType}</div>
              <div><strong>Is Ad:</strong> {lastContentEvent.contentMetadata.isAd ? 'Yes' : 'No'}</div>
              <div><strong>Current Time:</strong> {lastContentEvent.playerData.currentTime.toFixed(2)}s</div>
              <div><strong>Startup Time:</strong> {lastContentEvent.performanceMetrics.startupTime}ms</div>
            </div>
          ) : (
            <div style={{ color: '#6c757d', fontStyle: 'italic' }}>No content events yet...</div>
          )}
        </div>

        {/* Ad Event */}
        <div style={{ border: '1px solid #fd7e14', padding: '15px', borderRadius: '8px', backgroundColor: 'white' }}>
          <h3>📢 Latest Ad Event</h3>
          {lastAdEvent ? (
            <div style={{ fontFamily: 'monospace', fontSize: '11px', backgroundColor: '#fff3cd', padding: '10px', borderRadius: '3px', maxHeight: '200px', overflow: 'auto' }}>
              <div><strong>Event:</strong> {lastAdEvent.eventName}</div>
              <div><strong>Ad Title:</strong> {lastAdEvent.contentMetadata.adTitle}</div>
              <div><strong>URI:</strong> {lastAdEvent.contentMetadata.contentUri}</div>
              <div><strong>Duration:</strong> {lastAdEvent.contentMetadata.duration}s</div>
              <div><strong>Type:</strong> {lastAdEvent.contentMetadata.contentType}</div>
              <div><strong>Is Ad:</strong> {lastAdEvent.contentMetadata.isAd ? 'Yes' : 'No'}</div>
              <div><strong>Skippable:</strong> {lastAdEvent.contentMetadata.skippable ? 'Yes' : 'No'}</div>
              {lastAdEvent.contentMetadata.skipAfter && (
                <div><strong>Skip After:</strong> {lastAdEvent.contentMetadata.skipAfter}s</div>
              )}
              <div><strong>Index:</strong> {lastAdEvent.contentMetadata.index}</div>
              <div><strong>Current Time:</strong> {lastAdEvent.playerData.currentTime.toFixed(2)}s</div>
            </div>
          ) : (
            <div style={{ color: '#6c757d', fontStyle: 'italic' }}>No ad events yet...</div>
          )}
        </div>
      </div>

      {/* Recent Events Log */}
      <div style={{ border: '1px solid #6c757d', padding: '15px', borderRadius: '8px', backgroundColor: 'white' }}>
        <h3>📋 Recent Events (Last 5)</h3>
        <div 
          style={{ 
            maxHeight: '150px', 
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
              <div key={index} style={{ 
                marginBottom: '5px', 
                padding: '3px', 
                backgroundColor: index % 2 === 0 ? '#fff' : '#f1f3f4',
                borderLeft: event.payload?.contentMetadata?.isAd ? '3px solid #fd7e14' : '3px solid #28a745'
              }}>
                <strong>{event.type}:</strong> 
                {event.payload?.contentMetadata && (
                  <span style={{ color: event.payload.contentMetadata.isAd ? '#fd7e14' : '#28a745' }}>
                    {' '}{event.payload.contentMetadata.isAd ? 'AD' : 'CONTENT'} - 
                    {event.payload.contentMetadata.title} 
                    ({event.payload.contentMetadata.duration}s)
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#d1ecf1', borderRadius: '8px' }}>
        <h4>✅ Enriched Analytics Features (v1.1.8):</h4>
        <ul style={{ fontSize: '14px', columnCount: 2, columnGap: '30px' }}>
          <li>✅ <strong>Config → Analytics:</strong> src.url → contentUri</li>
          <li>✅ <strong>Real Duration:</strong> video.duration or config fallback</li>
          <li>✅ <strong>Ad Metadata:</strong> duration, skippable, skipAfter from config.ads</li>
          <li>✅ <strong>Current Item State:</strong> tracks content vs ad context</li>
          <li>✅ <strong>Performance Metrics:</strong> proper startupTime = loadStart</li>
          <li>✅ <strong>Enhanced Player Data:</strong> currentTime from video element</li>
          <li>✅ <strong>Ad Context Switching:</strong> automatic when ads start/end</li>
          <li>✅ <strong>Buffering Tracking:</strong> proper count and duration</li>
        </ul>
      </div>

      <div style={{ marginTop: '10px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px' }}>
        <h4>🧪 Test Sequence:</h4>
        <ol style={{ fontSize: '14px' }}>
          <li>Watch preroll ad 1 (skippable after 5s) - see ad metadata</li>
          <li>Skip or let it finish - see ad 2 (non-skippable)</li>
          <li>Watch main content start - see content metadata</li>
          <li>Pause/play main content - see content duration from video element</li>
          <li>Watch to end for postroll - see postroll ad metadata</li>
        </ol>
      </div>
    </div>
  );
};

export default EnrichedAnalyticsTest;

// 🔥 Key Improvements in v1.1.8:
// 
// 1. ✅ Config Mapping:
//    - config.src.url → contentMetadata.contentUri
//    - video.duration || config fallbacks
//    - Proper titles from filenames
//
// 2. ✅ Ad Enrichment:
//    - config.ads → adLookupCache for fast access
//    - ad.duration, ad.skippable, ad.skipAfter in payloads
//    - Proper ad type and index tracking
//
// 3. ✅ Current Item State:
//    - currentItem tracks content vs ad context
//    - Automatic switching on ad start/end
//    - Enriched metadata in every event
//
// 4. ✅ Performance Improvements:
//    - startupTime = Date.now() - loadStart (not session start)
//    - Proper buffering count and duration tracking
//    - Real currentTime from video element
//
// 5. ✅ Analytics Context:
//    - MediaPlayer calls updateAnalyticsContext()
//    - Analytics manager tracks current state
//    - All events get enriched with proper metadata
