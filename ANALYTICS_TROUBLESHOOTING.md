# 🐛 **Analytics Events Only Fire Once - Troubleshooting Guide**

## **🎯 Common Causes & Solutions**

### **Issue 1: Using Wrong Configuration**

**❌ Problem**: Events only fire once because enhanced analytics is not properly enabled.

**✅ Solution**: Ensure you're using the correct configuration:

```typescript
// ❌ WRONG - Will only fire basic events once
const config = {
  analytics: {
    enabled: true,
    onEvent: (event) => console.log(event)
  }
};

// ✅ CORRECT - Will fire enhanced events multiple times
const config = {
  analytics: {
    enabled: true,
    enhancedAnalytics: true,  // 🔥 This is crucial!
    userId: 'user-123',
    onEvent: (event) => {
      const enhancedEvent = event.payload;
      console.log('📊', enhancedEvent.eventName, enhancedEvent);
    }
  }
};
```

---

### **Issue 2: Event Handler Configuration**

**❌ Problem**: Using legacy event handling instead of enhanced analytics.

**✅ Solution**: Update your event handler:

```typescript
// ❌ WRONG - Legacy event handling
const handleAnalytics = (event) => {
  console.log(event.type); // Will only show basic event types
};

// ✅ CORRECT - Enhanced event handling
const handleAnalytics = (event) => {
  if (event.payload && event.payload.sessionId) {
    // Enhanced analytics event
    const enhancedEvent = event.payload;
    console.log('📊 Enhanced:', enhancedEvent.eventName);
    console.log('📈 Engagement:', enhancedEvent.engagementScore);
    console.log('⏱️ Watch Time:', enhancedEvent.engagementMetrics.totalWatchTime);
  } else {
    // Legacy event
    console.log('📝 Legacy:', event.type);
  }
};
```

---

### **Issue 3: React Strict Mode Interference**

**❌ Problem**: React Strict Mode can cause hooks to initialize multiple times.

**✅ Solution**: Check if you're in Strict Mode and adjust:

```typescript
// In your main.tsx or index.tsx
// ❌ Might cause issues with analytics initialization
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// ✅ Try without Strict Mode for testing
ReactDOM.render(
  <App />,
  document.getElementById('root')
);
```

---

### **Issue 4: Component Re-mounting**

**❌ Problem**: MediaPlayer component is being unmounted/remounted, resetting analytics.

**✅ Solution**: Ensure stable component mounting:

```typescript
// ❌ WRONG - Config object recreated on every render
function App() {
  const config = { // New object every render!
    analytics: { enabled: true, enhancedAnalytics: true }
  };
  return <MediaPlayer config={config} />;
}

// ✅ CORRECT - Stable config object
function App() {
  const config = useMemo(() => ({
    analytics: { 
      enabled: true, 
      enhancedAnalytics: true,
      userId: 'user-123',
      onEvent: handleAnalytics 
    }
  }), []); // Empty deps = stable config
  
  return <MediaPlayer config={config} />;
}
```

---

### **Issue 5: Missing Video Element Reference**

**❌ Problem**: Enhanced analytics manager not properly connected to video element.

**✅ Solution**: This should be automatic, but you can verify:

```typescript
// The MediaPlayer should automatically handle this
// But if using custom implementation, ensure:
useEffect(() => {
  if (videoRef.current && analyticsManager) {
    analyticsManager.setVideoElement(videoRef.current);
  }
}, [videoRef.current, analyticsManager]);
```

---

## **🔬 Debugging Steps**

### **Step 1: Use the Debug Component**

Copy the `DEBUG_ANALYTICS_ISSUE.tsx` file to your project and render it:

```typescript
import AnalyticsDebugger from './DEBUG_ANALYTICS_ISSUE';

function App() {
  return <AnalyticsDebugger />;
}
```

This will show you:
- ✅ Events firing multiple times (green)
- ❌ Events firing only once (yellow)
- 🔍 Detailed debug information

### **Step 2: Check Browser Console**

Look for these logs:
```javascript
// ✅ GOOD - Multiple enhanced events
📊 Enhanced Analytics Event: onPlay { sessionId: "...", engagementScore: 60 }
📊 Enhanced Analytics Event: onPause { sessionId: "...", engagementScore: 65 }
📊 Enhanced Analytics Event: onPlay { sessionId: "...", engagementScore: 70 }

// ❌ BAD - Only legacy events or single events
📝 Legacy Event: play
📝 Legacy Event: pause
```

### **Step 3: Verify Configuration**

Check your configuration matches this pattern:

```typescript
const config: PlayerConfig = {
  src: { url: 'video.mp4', type: 'video' },
  analytics: {
    enabled: true,
    enhancedAnalytics: true,  // ← Must be true
    userId: 'user-123',       // ← Should be provided
    onEvent: (event) => {
      // Check if enhanced event
      if (event.payload?.sessionId) {
        console.log('✅ Enhanced event:', event.payload.eventName);
      } else {
        console.log('❌ Legacy event:', event.type);
      }
    }
  }
};
```

---

## **🧪 Test Scenario**

### **Quick Test to Verify Multiple Events**

```typescript
// 1. Set up event counter
let eventCounts = {};

const handleAnalytics = (event) => {
  const eventName = event.payload?.eventName || event.type;
  eventCounts[eventName] = (eventCounts[eventName] || 0) + 1;
  
  console.log(`📊 ${eventName} - Count: ${eventCounts[eventName]}`);
  
  // Should see increasing counts:
  // 📊 onPlay - Count: 1
  // 📊 onPause - Count: 1
  // 📊 onPlay - Count: 2  ← This should happen!
  // 📊 onPause - Count: 2 ← This should happen!
};

// 2. Test by clicking play/pause multiple times
// 3. Each event type should increment its count
```

---

## **🔧 Common Fixes**

### **Fix 1: Update Package Configuration**

```bash
# Ensure you're using v1.1.0 with enhanced analytics
npm install /Users/apple/Desktop/localPlayer/custom-player/advanced-react-media-player-1.1.0.tgz
```

### **Fix 2: Complete Working Example**

```typescript
import React, { useMemo } from 'react';
import { MediaPlayer, type PlayerConfig } from 'advanced-react-media-player';
import 'advanced-react-media-player/dist/index.css';

function App() {
  const handleAnalytics = useMemo(() => (event) => {
    if (event.payload?.sessionId) {
      // Enhanced analytics - should fire multiple times
      console.log('✅ Enhanced:', event.payload.eventName, 'Score:', event.payload.engagementScore);
    } else {
      // Legacy analytics
      console.log('📝 Legacy:', event.type);
    }
  }, []);

  const config: PlayerConfig = useMemo(() => ({
    src: {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      type: 'video',
      mimeType: 'video/mp4'
    },
    analytics: {
      enabled: true,
      enhancedAnalytics: true,  // 🔥 Enhanced analytics
      userId: 'test-user-123',
      onEvent: handleAnalytics
    },
    ui: {
      theme: 'dark',
      autoplay: true,
      muted: true,
      showControls: true
    }
  }), [handleAnalytics]);

  return (
    <div style={{ padding: '20px', backgroundColor: '#000' }}>
      <h1 style={{ color: 'white' }}>Enhanced Analytics Test</h1>
      <MediaPlayer config={config} />
    </div>
  );
}

export default App;
```

---

## **📊 Expected Behavior**

When working correctly, you should see:

1. **Multiple Events**: Same event types firing multiple times
2. **Enhanced Structure**: Events contain `sessionId`, `engagementScore`, etc.
3. **Accumulating Metrics**: Watch time and interaction counts increase
4. **Real-time Updates**: Engagement score changes with interactions

**If you're still seeing single events only, use the debug component to identify the exact issue!**
