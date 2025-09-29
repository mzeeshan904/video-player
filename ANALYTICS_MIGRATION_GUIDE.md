# 🔄 **Analytics Migration Guide - Basic to Enhanced**

## **📋 Overview**

This guide shows how to upgrade from basic analytics to the comprehensive enhanced analytics system that matches your specified event structure.

---

## **🔧 Migration Steps**

### **Step 1: Update Your Configuration**

**Before (Basic Analytics):**
```typescript
const config: PlayerConfig = {
  src: { url: 'video.mp4', type: 'video' },
  analytics: {
    enabled: true,
    onEvent: (event) => {
      console.log(event.type, event.payload);
    }
  }
};
```

**After (Enhanced Analytics):**
```typescript
const config: PlayerConfig = {
  src: { url: 'video.mp4', type: 'video' },
  analytics: {
    enabled: true,
    enhancedAnalytics: true,        // 🔥 Enable enhanced tracking
    userId: 'user_12345',           // 📝 Add user identification
    endpoint: 'https://your-api.com/analytics', // 📡 Optional API endpoint
    onEvent: handleEnhancedAnalytics
  }
};
```

### **Step 2: Update Your Event Handler**

**Before:**
```typescript
const handleAnalytics = (event: AnalyticsEvent) => {
  switch (event.type) {
    case 'play':
      console.log('Video started');
      break;
    case 'pause':
      console.log('Video paused');
      break;
  }
};
```

**After:**
```typescript
const handleEnhancedAnalytics = (event: AnalyticsEvent) => {
  // Enhanced event data is in the payload
  const enhancedEvent = event.payload as EnhancedAnalyticsEvent;
  
  if (enhancedEvent) {
    // Rich analytics data available
    console.log('📊 Event:', enhancedEvent.eventName);
    console.log('📈 Engagement Score:', enhancedEvent.engagementScore);
    console.log('⏱️ Watch Time:', enhancedEvent.engagementMetrics.totalWatchTime);
    
    // Send to your analytics backend
    sendToAnalyticsAPI(enhancedEvent);
  }
};
```

### **Step 3: Backend Integration**

**Enhanced Event Structure:**
```typescript
const sendToAnalyticsAPI = async (event: EnhancedAnalyticsEvent) => {
  const payload = {
    // Session info
    sessionId: event.sessionId,
    contentId: event.contentId,
    eventName: event.eventName,
    timestamp: event.timestamp,
    userId: event.userId,

    // Content metadata
    contentMetadata: event.contentMetadata,

    // Player state
    playerData: event.playerData,

    // Engagement metrics
    sessionDuration: event.sessionDuration,
    engagementScore: event.engagementScore,
    engagementMetrics: event.engagementMetrics,

    // Performance metrics
    performanceMetrics: event.performanceMetrics,

    // Quality metrics
    qualityMetrics: event.qualityMetrics,

    // Device information
    deviceInfo: event.deviceInfo,

    // Additional state
    playlistLength: event.playlistLength,
    position: event.position,
    bandwidth: event.bandwidth,
    isPaused: event.isPaused,
    isFullscreen: event.isFullscreen,
    playbackState: event.playbackState,
    isAd: event.isAd
  };

  try {
    await fetch('https://your-analytics-api.com/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your-api-key'
      },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.error('Analytics failed:', error);
  }
};
```

---

## **🎯 Event Mapping**

### **Legacy vs Enhanced Event Names**

| **Legacy Event** | **Enhanced Event** | **Description** |
|------------------|-------------------|-----------------|
| `'play'` | `'onPlay'` | Video playback started |
| `'pause'` | `'onPause'` | Video playback paused |
| `'seek'` | `'onSeek'` | User seeked to different position |
| `'volumechange'` | `'onVolumeChange'` | Volume level changed |
| `'fullscreen'` | `'onFullscreenEnter'` | Entered fullscreen mode |
| `'error'` | `'onError'` | Playback error occurred |
| `'complete'` | `'onComplete'` | Content playback completed |
| `'buffering_start'` | `'onBufferingStart'` | Buffering started |
| `'buffering_end'` | `'onBufferingEnd'` | Buffering ended |
| `'ad_start'` | `'onAdStart'` | Advertisement started |
| `'ad_complete'` | `'onAdComplete'` | Advertisement completed |
| `'ad_skip'` | `'onAdSkip'` | Advertisement skipped |

---

## **📊 Data Enrichment Examples**

### **1. Basic Play Event Enhancement**

**Before (Basic):**
```json
{
  "type": "play",
  "timestamp": 1759139850878,
  "payload": {}
}
```

**After (Enhanced):**
```json
{
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
    "contentUri": "https://video.mp4"
  },
  
  "playerData": {
    "currentTime": 0,
    "duration": 146,
    "bandwidth": 2186589,
    "isPaused": false,
    "volume": 0.8,
    "playbackRate": 1
  },
  
  "engagementMetrics": {
    "totalWatchTime": 0,
    "interactionCount": 1,
    "engagementScore": 60
  },
  
  "performanceMetrics": {
    "initialLoadTime": 1200,
    "bufferingCount": 0,
    "startupTime": 800
  },
  
  "deviceInfo": {
    "userAgent": "Mozilla/5.0...",
    "screenWidth": 1920,
    "screenHeight": 1080,
    "connectionType": "4g"
  }
}
```

### **2. Seek Event Enhancement**

**Before:**
```json
{
  "type": "seek",
  "timestamp": 1759139860000,
  "payload": { "currentTime": 30 }
}
```

**After:**
```json
{
  "eventName": "onSeek",
  "timestamp": 1759139860000,
  "engagementMetrics": {
    "seekCount": 1,
    "interactionCount": 2
  },
  "payload": {
    "fromTime": 10,
    "toTime": 30
  }
}
```

---

## **🔄 Gradual Migration Strategy**

### **Phase 1: Enable Enhanced Analytics**
```typescript
// Add enhanced analytics alongside existing analytics
analytics: {
  enabled: true,
  enhancedAnalytics: true,  // New enhanced system
  onEvent: (event) => {
    // Handle both legacy and enhanced events
    if (event.payload && typeof event.payload === 'object' && 'sessionId' in event.payload) {
      // Enhanced event
      handleEnhancedEvent(event.payload as EnhancedAnalyticsEvent);
    } else {
      // Legacy event
      handleLegacyEvent(event);
    }
  }
}
```

### **Phase 2: Backend Adaptation**
```typescript
// Gradual backend migration
const handleAnalyticsEvent = (event: any) => {
  if (event.sessionId) {
    // Enhanced analytics event - send to new endpoint
    sendToNewAnalyticsAPI(event);
  } else {
    // Legacy event - send to existing endpoint
    sendToLegacyAPI(event);
  }
};
```

### **Phase 3: Full Migration**
```typescript
// Complete migration to enhanced analytics
analytics: {
  enabled: true,
  enhancedAnalytics: true,
  userId: getUserId(),
  endpoint: 'https://new-analytics-api.com/events',
  onEvent: handleEnhancedAnalytics
}
```

---

## **🧪 Testing & Validation**

### **1. Event Verification**
```typescript
const validateEnhancedEvent = (event: EnhancedAnalyticsEvent): boolean => {
  const required = [
    'sessionId', 'contentId', 'eventName', 'timestamp',
    'contentMetadata', 'playerData', 'engagementMetrics',
    'performanceMetrics', 'deviceInfo'
  ];
  
  return required.every(field => field in event);
};

const handleAnalytics = (event: AnalyticsEvent) => {
  const enhancedEvent = event.payload as EnhancedAnalyticsEvent;
  
  if (validateEnhancedEvent(enhancedEvent)) {
    console.log('✅ Valid enhanced event');
    sendToAnalytics(enhancedEvent);
  } else {
    console.error('❌ Invalid enhanced event structure');
  }
};
```

### **2. A/B Testing Setup**
```typescript
const enableEnhancedAnalytics = Math.random() < 0.5; // 50% rollout

const config: PlayerConfig = {
  analytics: {
    enabled: true,
    enhancedAnalytics: enableEnhancedAnalytics,
    onEvent: enhancedAnalytics ? handleEnhanced : handleLegacy
  }
};
```

---

## **🚨 Common Migration Issues**

### **1. Missing Enhanced Analytics Flag**
```typescript
// ❌ Won't work - missing enhancedAnalytics flag
analytics: {
  enabled: true,
  onEvent: handleAnalytics
}

// ✅ Correct
analytics: {
  enabled: true,
  enhancedAnalytics: true,  // Required for enhanced events
  onEvent: handleAnalytics
}
```

### **2. Incorrect Event Handler**
```typescript
// ❌ Wrong - expecting legacy event structure
const handleAnalytics = (event: AnalyticsEvent) => {
  console.log(event.type); // undefined in enhanced mode
};

// ✅ Correct - handle enhanced events
const handleAnalytics = (event: AnalyticsEvent) => {
  const enhancedEvent = event.payload as EnhancedAnalyticsEvent;
  if (enhancedEvent) {
    console.log(enhancedEvent.eventName);
  }
};
```

### **3. Payload Size Concerns**
```typescript
// Enhanced events are larger - consider filtering
const handleAnalytics = (event: AnalyticsEvent) => {
  const enhancedEvent = event.payload as EnhancedAnalyticsEvent;
  
  // Send only essential data for high-frequency events
  if (enhancedEvent.eventName === 'onTimeUpdate') {
    const essential = {
      sessionId: enhancedEvent.sessionId,
      eventName: enhancedEvent.eventName,
      currentTime: enhancedEvent.playerData.currentTime,
      engagementScore: enhancedEvent.engagementScore
    };
    sendToAnalytics(essential);
  } else {
    // Send full event for important events
    sendToAnalytics(enhancedEvent);
  }
};
```

---

## **📈 Verification Checklist**

- [ ] **Enhanced analytics enabled** in player config
- [ ] **User ID configured** for session tracking
- [ ] **Event handler updated** to process enhanced events
- [ ] **Backend endpoints** updated to handle new schema
- [ ] **Event validation** implemented
- [ ] **Error handling** for failed analytics calls
- [ ] **Performance impact** measured and acceptable
- [ ] **Cross-browser testing** completed
- [ ] **Mobile device testing** completed
- [ ] **Analytics dashboard** updated for new metrics

---

**🎉 Your migration to enhanced analytics is complete!**

The enhanced system provides significantly richer data for understanding user engagement, performance optimization, and content effectiveness.
