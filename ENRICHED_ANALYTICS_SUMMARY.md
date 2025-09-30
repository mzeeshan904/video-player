# 🔥 Enriched Analytics Payloads - v1.1.8

## Summary

All analytics payloads are now **enriched with metadata from the config object** when player APIs don't provide them. The analytics system now properly maps config data and maintains current item state for accurate reporting.

---

## ✅ **Fixed Issues**

### **1. Config → Analytics Mapping**

#### **✅ Source Config Integration**
```javascript
// BEFORE: Limited data
{
  "contentUri": "generic-url",
  "duration": 0,
  "title": "Ad Content"
}

// AFTER: Enriched with config.src
{
  "contentUri": "https://example.com/video.mp4", // ← from config.src.url
  "duration": 1845.2,                           // ← from video.duration || config
  "title": "BigBuckBunny.mp4",                  // ← from filename
  "contentType": "content",                     // ← proper type
  "protocol": 11,                               // ← detected from URL
  "showSeekbar": true,                          // ← from config.ui.showControls
  "hasSeekbar": true                            // ← calculated properly
}
```

#### **✅ Ad Config Integration**
```javascript
// BEFORE: Missing ad metadata
{
  "title": "Ad Content",
  "duration": 0,
  "skippable": false
}

// AFTER: Full ad metadata from config.ads
{
  "title": "preroll",                          // ← ad type from config
  "adTitle": "preroll ad",                     // ← enriched title
  "duration": 15,                              // ← from ad.duration (not 0!)
  "contentUri": "https://example.com/ad.mp4",  // ← from ad.url
  "contentType": "ad",                         // ← proper type
  "isAd": true,                                // ← correct flag
  "skippable": true,                           // ← from ad.skippable
  "skipAfter": 5,                              // ← from ad.skipAfter
  "index": 1,                                  // ← ad position
  "isSkippable": true                          // ← duplicate for compatibility
}
```

---

### **2. Current Item State Management**

#### **✅ Context Switching**
- **Before**: No state tracking, generic data for all events
- **After**: Smart context switching between content and ads

```typescript
interface CurrentItem {
  id: string;
  type: 'content' | 'ad';
  title: string;
  duration: number;
  contentUri: string;
  isAd: boolean;
  skippable?: boolean;
  skipAfter?: number;
  adTitle?: string;
  index?: number;
  startTime?: number;
}
```

#### **✅ Automatic Context Updates**
```javascript
// When ad starts
manager.setCurrentAd('preroll-1');  // → switches to ad context

// When ad ends 
manager.setCurrentContent();        // → switches to content context

// All subsequent events use the correct context
```

---

### **3. Enhanced Player Data**

#### **✅ Improved Data Sources**
```javascript
// BEFORE: Basic player data
{
  "currentTime": video.currentTime || 0,
  "duration": video.duration || 0,
  "isPaused": video.paused || false
}

// AFTER: Enriched with current item context
{
  "currentTime": video.currentTime || 0,           // ← real video time
  "duration": video.duration || currentItem.duration, // ← fallback to config
  "isPaused": video.paused || false,
  "volume": video.volume || 0,
  "playbackRate": video.playbackRate || 1,
  "quality": getCurrentQuality(),                  // ← detected quality
  "bandwidth": qualityMetrics.currentBandwidth,   // ← real bandwidth
  "buffered": video.buffered                       // ← buffering state
}
```

---

### **4. Performance Metrics Fixes**

#### **✅ Proper Timing Calculations**
```javascript
// BEFORE: Incorrect startup time
performanceMetrics.startupTime = Date.now() - sessionStartTime; // Wrong!

// AFTER: Correct startup time  
performanceMetrics.startupTime = Date.now() - loadStartTime;    // ✅ Correct!

// BEFORE: Inconsistent buffering
bufferingCount = 0; // Never incremented

// AFTER: Proper buffering tracking
bufferingCount++;                              // ✅ Increments on each buffer
bufferingTime += (Date.now() - bufferingStart); // ✅ Accumulates duration
```

#### **✅ Enhanced Metrics**
- `startupTime`: Time from load start to first play (not session start)
- `initialLoadTime`: Time from session start to first play
- `bufferingCount`: Proper increment on each buffering event
- `bufferingTime`: Accumulated buffering duration

---

## 🏗️ **Implementation Details**

### **1. Ad Lookup Cache**
```typescript
// Fast O(1) ad metadata lookup
private buildAdLookupCache(): void {
  config.ads.preRoll?.forEach((ad, index) => {
    this.adLookupCache.set(ad.id, {
      ...ad,
      type: 'preroll',
      index: index + 1
    });
  });
  // ... midRoll, postRoll
}
```

### **2. MediaPlayer Integration**
```typescript
// Automatic context switching in MediaPlayer
const updateAnalyticsContext = useCallback((type: 'ad' | 'content', data?: any) => {
  if (enhancedTracking?.getAnalyticsManager()) {
    const manager = enhancedTracking.getAnalyticsManager();
    if (type === 'ad' && data?.id) {
      manager!.setCurrentAd(data.id);  // Switch to ad context
    } else {
      manager!.setCurrentContent();     // Switch to content context
    }
  }
}, [enhancedTracking]);

// Called automatically when ads start/end
updateAnalyticsContext('ad', preRollAd);
```

### **3. Enriched Event Generation**
```typescript
private getContentMetadata() {
  // Use currentItem for all metadata
  const duration = this.videoElement?.duration || this.currentItem.duration || 0;
  
  return {
    title: this.currentItem.title,                    // ← from current item
    duration: duration,                               // ← video || config fallback
    contentType: this.currentItem.type,               // ← 'content' | 'ad'
    contentUri: this.currentItem.contentUri,          // ← from config
    isAd: this.currentItem.isAd,                     // ← current context
    skippable: this.currentItem.skippable || false,   // ← from ad config
    ...(this.currentItem.adTitle && { 
      adTitle: this.currentItem.adTitle               // ← ad-specific data
    })
  };
}
```

---

## 📊 **Sample Enriched Output**

### **Content Event (onPause)**
```json
{
  "eventName": "onPause",
  "timestamp": 1759150123456,
  "sessionDuration": 45678,
  "contentMetadata": {
    "title": "BigBuckBunny.mp4",
    "duration": 596.474,
    "contentType": "content",
    "contentUri": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "protocol": 11,
    "showSeekbar": true,
    "isAd": false,
    "hasSeekbar": true
  },
  "playerData": {
    "currentTime": 123.45,
    "duration": 596.474,
    "bandwidth": 1500000,
    "isPaused": true,
    "volume": 0.8,
    "playbackRate": 1,
    "quality": "720p"
  },
  "performanceMetrics": {
    "startupTime": 1250,
    "initialLoadTime": 800,
    "bufferingCount": 2,
    "bufferingTime": 340
  }
}
```

### **Ad Event (onAdStart)**
```json
{
  "eventName": "onAdStart", 
  "timestamp": 1759150098765,
  "sessionDuration": 21010,
  "contentMetadata": {
    "title": "preroll",
    "adTitle": "preroll ad",
    "duration": 15,
    "contentType": "ad",
    "contentUri": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    "protocol": 11,
    "showSeekbar": false,
    "skippable": true,
    "skipAfter": 5,
    "index": 1,
    "isAd": true,
    "isSkippable": true,
    "hasSeekbar": false
  },
  "playerData": {
    "currentTime": 0,
    "duration": 15,
    "bandwidth": 1500000,
    "isPaused": false,
    "volume": 0.8,
    "playbackRate": 1
  },
  "performanceMetrics": {
    "startupTime": 950,
    "bufferingCount": 1
  }
}
```

---

## 📦 **Installation & Usage**

### **Install v1.1.8:**
```bash
npm install /Users/apple/Desktop/localPlayer/custom-player/advanced-react-media-player-1.1.8.tgz
```

### **Configuration:**
```typescript
const config: PlayerConfig = {
  src: {
    url: 'https://example.com/video.mp4',
    type: 'video'
  },
  ads: {
    preRoll: [
      {
        id: 'ad1',
        url: 'https://example.com/ad.mp4',
        duration: 15,        // ← Will appear in analytics
        skippable: true,     // ← Will appear in analytics
        skipAfter: 5         // ← Will appear in analytics
      }
    ]
  },
  analytics: {
    enabled: true,
    enhancedAnalytics: true,
    onEvent: (event) => {
      // Now receives fully enriched payloads!
      console.log('Enriched:', event.payload);
    }
  }
};
```

---

## 🎯 **Key Benefits**

1. **✅ Complete Metadata**: All analytics payloads now have full context
2. **✅ Accurate Timing**: Proper startup and buffering calculations  
3. **✅ Ad Intelligence**: Rich ad metadata from config
4. **✅ Context Awareness**: Smart switching between content and ads
5. **✅ Fallback Support**: Graceful degradation when APIs fail
6. **✅ Performance Tracking**: Real metrics for optimization

**Result: Analytics payloads are now fully enriched with all available metadata!** 🚀
