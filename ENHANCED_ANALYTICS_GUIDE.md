# 📊 **Enhanced Analytics System - Complete Guide**

## **🎯 Overview**

The Enhanced Analytics System provides comprehensive tracking that matches professional analytics platforms with detailed engagement metrics, performance monitoring, and device information collection.

---

## **🏗️ Architecture**

### **📊 Event Structure**
Every analytics event follows this comprehensive schema:

```typescript
interface EnhancedAnalyticsEvent {
  // Session Information
  sessionId: string;           // Unique session identifier
  contentId: string;           // Content identifier
  eventName: string;          // Event type (onPlay, onPause, etc.)
  timestamp: number;          // Event timestamp
  userId: string;             // User identifier

  // Content Information
  contentMetadata: {
    title: string;            // Content title
    duration: number;         // Total duration
    contentType: 'content' | 'ad';
    protocol: number;         // Streaming protocol (1=HLS, 2=DASH, 12=MP4)
    contentUri: string;       // Content URL
    startTimeInSeconds: number;
    showSeekbar: boolean;
    skippable: boolean;
    isAd: boolean;
    isSkippable: boolean;
    hasSeekbar: boolean;
  };

  // Real-time Player Data
  playerData: {
    currentTime: number;      // Current playback position
    duration: number;         // Total duration
    bandwidth: number;        // Current bandwidth
    isPaused: boolean;        // Pause state
    isFullscreen: boolean;    // Fullscreen state
    volume: number;           // Volume level (0-1)
    playbackRate: number;     // Playback speed
    quality: string;          // Current quality
    buffered: TimeRanges | null;
  };

  // Engagement Analytics
  engagementMetrics: {
    totalWatchTime: number;         // Total time watched
    uniqueViewTime: number;         // Unique viewing time
    replayCount: number;            // Number of replays
    seekCount: number;              // Number of seeks
    pauseCount: number;             // Number of pauses
    resumeCount: number;            // Number of resumes
    qualityChangeCount: number;     // Quality changes
    volumeChangeCount: number;      // Volume changes
    fullscreenCount: number;        // Fullscreen toggles
    interactionCount: number;       // Total interactions
    averageViewingSession: number;  // Average session length
    contentCompletionRate: number;  // Completion percentage
    engagementScore: number;        // Calculated score (0-100)
  };

  // Performance Analytics
  performanceMetrics: {
    initialLoadTime: number;        // Time to start loading
    bufferingTime: number;          // Total buffering time
    bufferingCount: number;         // Number of buffering events
    averageBitrate: number;         // Average bitrate
    bitrateChanges: number;         // Bitrate change count
    errorCount: number;             // Error count
    rebufferRatio: number;          // Buffering ratio
    startupTime: number;            // Time to first frame
    videoStartFailures: number;     // Failed start attempts
    averageFrameRate: number;       // Average FPS
    droppedFrames: number;          // Dropped frame count
  };

  // Quality Analytics
  qualityMetrics: {
    currentBandwidth: number;       // Current bandwidth
    bandwidthHistory: Array<{       // Bandwidth history
      timestamp: number;
      bandwidth: number;
    }>;
    qualityHistory: Array<{         // Quality change history
      timestamp: number;
      quality: string;
      bandwidth: number;
    }>;
  };

  // Device & Environment
  deviceInfo: {
    userAgent: string;              // Browser user agent
    screenWidth: number;            // Screen width
    screenHeight: number;           // Screen height
    connectionType: string;         // Connection type
    deviceMemory: number;           // Device memory (GB)
  };

  // Additional State
  sessionDuration: number;          // Total session duration
  engagementScore: number;          // Overall engagement score
  playlistLength: number;           // Total playlist items
  position: number;                 // Current position
  bandwidth: number;                // Current bandwidth
  isPaused: boolean;                // Pause state
  isFullscreen: boolean;            // Fullscreen state
  playbackState: 'playing' | 'paused' | 'buffering' | 'ended' | 'error';
  isAd: boolean;                    // Currently playing ad
}
```

---

## **🚀 Quick Implementation**

### **1. Basic Setup**

```tsx
import React from 'react';
import { 
  MediaPlayer, 
  type PlayerConfig,
  type AnalyticsEvent,
  type EnhancedAnalyticsEvent 
} from 'advanced-react-media-player';
import 'advanced-react-media-player/dist/index.css';

const App: React.FC = () => {
  // Enhanced analytics event handler
  const handleAnalytics = (event: AnalyticsEvent) => {
    const enhancedEvent = event.payload as EnhancedAnalyticsEvent;
    
    // Send to your analytics backend
    sendToAnalytics(enhancedEvent);
    
    console.log('📊 Event:', enhancedEvent.eventName, enhancedEvent);
  };

  const config: PlayerConfig = {
    src: {
      url: 'https://your-video-url.mp4',
      type: 'video'
    },
    analytics: {
      enabled: true,
      enhancedAnalytics: true,     // 🔥 Enable enhanced tracking
      userId: 'user_12345',        // Your user ID
      endpoint: 'https://your-api.com/analytics',
      onEvent: handleAnalytics
    }
  };

  return <MediaPlayer config={config} />;
};
```

### **2. Analytics Backend Integration**

```typescript
const sendToAnalytics = async (event: EnhancedAnalyticsEvent) => {
  try {
    await fetch('https://your-analytics-api.com/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your-api-key'
      },
      body: JSON.stringify(event)
    });
  } catch (error) {
    console.error('Analytics failed:', error);
  }
};
```

---

## **🎯 Event Types**

### **🎬 Playback Events**
```typescript
EVENT_NAMES.PLAY           // 'onPlay'
EVENT_NAMES.PAUSE          // 'onPause'
EVENT_NAMES.RESUME         // 'onResume'
EVENT_NAMES.SEEK           // 'onSeek'
EVENT_NAMES.REPLAY         // 'onReplay'
EVENT_NAMES.COMPLETE       // 'onComplete'
```

### **📺 Ad Events**
```typescript
EVENT_NAMES.AD_START       // 'onAdStart'
EVENT_NAMES.AD_COMPLETE    // 'onAdComplete'
EVENT_NAMES.AD_SKIP        // 'onAdSkip'
EVENT_NAMES.AD_ERROR       // 'onAdError'
```

### **⚡ Performance Events**
```typescript
EVENT_NAMES.QUALITY_CHANGE     // 'onQualityChange'
EVENT_NAMES.BUFFERING_START    // 'onBufferingStart'
EVENT_NAMES.BUFFERING_END      // 'onBufferingEnd'
EVENT_NAMES.ERROR              // 'onError'
```

### **👆 User Interaction Events**
```typescript
EVENT_NAMES.VOLUME_CHANGE      // 'onVolumeChange'
EVENT_NAMES.FULLSCREEN_ENTER   // 'onFullscreenEnter'
EVENT_NAMES.FULLSCREEN_EXIT    // 'onFullscreenExit'
EVENT_NAMES.PLAYBACK_RATE_CHANGE // 'onPlaybackRateChange'
EVENT_NAMES.SUBTITLE_TOGGLE    // 'onSubtitleToggle'
```

---

## **📈 Advanced Usage**

### **Custom Analytics Manager**

```typescript
import { EnhancedAnalyticsManager } from 'advanced-react-media-player';

const analyticsManager = new EnhancedAnalyticsManager(config, 'user_12345');

// Set video element for performance tracking
analyticsManager.setVideoElement(videoElement);

// Track custom events
analyticsManager.logEvent('customEvent', { data: 'value' });

// Access specific tracking methods
analyticsManager.trackPlay();
analyticsManager.trackSeek(10, 30);
analyticsManager.trackQualityChange('1080p', 5000000);
```

### **Real-time Analytics Dashboard**

```tsx
const AnalyticsDashboard: React.FC<{ events: EnhancedAnalyticsEvent[] }> = ({ events }) => {
  const latestEvent = events[events.length - 1];
  
  return (
    <div>
      <h3>📊 Live Analytics</h3>
      
      {latestEvent && (
        <div>
          <div>📺 Current Time: {latestEvent.playerData.currentTime.toFixed(2)}s</div>
          <div>💯 Engagement Score: {latestEvent.engagementScore}%</div>
          <div>⏱️ Total Watch Time: {Math.round(latestEvent.engagementMetrics.totalWatchTime / 1000)}s</div>
          <div>🎯 Interactions: {latestEvent.engagementMetrics.interactionCount}</div>
          <div>📶 Bandwidth: {Math.round(latestEvent.playerData.bandwidth / 1000000)}Mbps</div>
          <div>⚡ Buffering Events: {latestEvent.performanceMetrics.bufferingCount}</div>
        </div>
      )}
    </div>
  );
};
```

---

## **🔍 Analytics Insights**

### **📊 Engagement Score Calculation**
The engagement score (0-100) is calculated based on:
- **Watch Time Ratio**: Time watched vs session duration
- **Interaction Bonus**: Points for user interactions
- **Completion Bonus**: Additional points for content completion

```typescript
// Example calculation
const sessionMinutes = sessionDuration / (1000 * 60);
const watchTimeMinutes = totalWatchTime / (1000 * 60);
const engagementRatio = (watchTimeMinutes / sessionMinutes) * 100;
const interactionBonus = Math.min(interactionCount * 5, 30);
const engagementScore = Math.min(engagementRatio + interactionBonus, 100);
```

### **⚡ Performance Metrics**
Monitor video performance with:
- **Startup Time**: Time from load to first frame
- **Buffering Ratio**: Buffering time vs total watch time
- **Error Rate**: Failed attempts vs successful plays
- **Quality Stability**: Frequency of quality changes

### **🎯 Quality Metrics**
Track streaming quality with:
- **Bandwidth History**: Connection speed over time
- **Quality Changes**: Adaptive bitrate adjustments
- **Average Bitrate**: Overall streaming quality

---

## **🔧 Configuration Options**

### **Enhanced Analytics Config**
```typescript
interface PlayerConfig {
  analytics?: {
    enabled: boolean;                    // Enable analytics
    enhancedAnalytics?: boolean;         // Enable comprehensive tracking
    userId?: string;                     // User identifier
    endpoint?: string;                   // Analytics API endpoint
    onEvent?: (event: AnalyticsEvent) => void; // Event callback
  };
}
```

### **Event Filtering**
```typescript
const handleAnalytics = (event: AnalyticsEvent) => {
  const enhancedEvent = event.payload as EnhancedAnalyticsEvent;
  
  // Filter specific events
  if (enhancedEvent.eventName === 'onPlay') {
    // Handle play events specifically
  }
  
  // Filter by engagement score
  if (enhancedEvent.engagementScore > 50) {
    // High engagement user
  }
  
  // Filter by device type
  if (enhancedEvent.deviceInfo.screenWidth < 768) {
    // Mobile user
  }
};
```

---

## **📱 Mobile & Cross-Browser Support**

### **Device Detection**
```typescript
// Automatically detected device info
deviceInfo: {
  userAgent: navigator.userAgent,
  screenWidth: window.screen.width,
  screenHeight: window.screen.height,
  connectionType: navigator.connection?.effectiveType || '4g',
  deviceMemory: navigator.deviceMemory || 8
}
```

### **Connection Monitoring**
```typescript
// Automatic bandwidth tracking
if ('connection' in navigator) {
  const connection = navigator.connection;
  // Monitor connection changes
  connection.addEventListener('change', () => {
    // Update bandwidth metrics
  });
}
```

---

## **🛠️ Troubleshooting**

### **Common Issues**

1. **Events Not Firing**
   ```typescript
   // Ensure enhancedAnalytics is enabled
   analytics: {
     enabled: true,
     enhancedAnalytics: true, // ← Required
   }
   ```

2. **Missing User ID**
   ```typescript
   // Set user ID in analytics config
   analytics: {
     userId: 'your-user-id', // ← Required for user tracking
   }
   ```

3. **Performance Impact**
   ```typescript
   // Analytics are optimized, but you can reduce frequency
   // by filtering events or batching requests
   ```

### **Debug Mode**
```typescript
// Enable detailed logging
const config = {
  analytics: {
    enabled: true,
    enhancedAnalytics: true,
    onEvent: (event) => {
      console.log('📊 Debug Event:', event);
    }
  }
};
```

---

## **🔗 Integration Examples**

### **Google Analytics 4**
```typescript
import { gtag } from 'ga-4';

const sendToGA4 = (event: EnhancedAnalyticsEvent) => {
  gtag('event', event.eventName, {
    custom_parameter_1: event.engagementScore,
    custom_parameter_2: event.playerData.currentTime,
    // Map other relevant fields
  });
};
```

### **Adobe Analytics**
```typescript
import { s } from 'adobe-analytics';

const sendToAdobe = (event: EnhancedAnalyticsEvent) => {
  s.events = event.eventName;
  s.eVar1 = event.userId;
  s.eVar2 = event.engagementScore.toString();
  s.t(); // Send tracking call
};
```

### **Custom Dashboard API**
```typescript
const sendToCustomAPI = async (event: EnhancedAnalyticsEvent) => {
  await fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_name: event.eventName,
      user_id: event.userId,
      session_id: event.sessionId,
      engagement_score: event.engagementScore,
      watch_time: event.engagementMetrics.totalWatchTime,
      // Include other relevant metrics
    })
  });
};
```

---

## **🎯 Best Practices**

1. **📊 Event Batching**: Batch events for better performance
2. **🔒 Privacy**: Respect user privacy and GDPR requirements
3. **⚡ Performance**: Monitor impact on video performance
4. **📱 Mobile**: Test on various devices and connections
5. **🛡️ Error Handling**: Implement robust error handling
6. **📈 Monitoring**: Monitor your analytics pipeline health

---

**🚀 Ready to implement comprehensive video analytics!**
