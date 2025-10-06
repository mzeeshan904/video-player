# 🚀 **Local Installation Guide - Advanced React Media Player**

## 📦 **Package Successfully Built!**

Your media player has been built and packaged as:
**`advanced-react-media-player-1.3.0.tgz`** (2.8 MB)

---

## 🛠️ **Installation in Your Local React Project**

### **Step 1: Copy the Package**
```bash
# Copy the package file to your React project directory
cp /Users/apple/Desktop/localPlayer/custom-player/advanced-react-media-player-1.3.0.tgz /path/to/your/react-project/
```

### **Step 2: Install the Package**
```bash
# Navigate to your React project
cd /path/to/your/react-project

# Install the local package
npm install ./advanced-react-media-player-1.3.0.tgz

# Or using yarn
yarn add ./advanced-react-media-player-1.3.0.tgz
```

### **Step 3: Install Required Dependencies**
```bash
# Install peer dependencies (if not already installed)
npm install react@^18.0.0 react-dom@^18.0.0

# Install streaming dependencies
npm install hls.js dashjs shaka-player
```

---

## 🎬 **Basic Usage Example**

### **Create a Test Component:**
```tsx
// src/components/PlayerTest.tsx
import React from 'react';
import { MediaPlayer } from 'advanced-react-media-player';
import 'advanced-react-media-player/dist/index.css';

const PlayerTest: React.FC = () => {
  const config = {
    src: {
      // Test with your DASH content
      url: "https://dspk-sandbox.airfi.io/content/dreamstream/video/eng/51716c7b-fcae-4b47-ba06-11712f63c581/c5130621-1f73-4cd2-aaca-3ad00a28c397.mpd",
      type: "video" as const,
      mimeType: "application/dash+xml", // ← Fixed MIME type for DASH
    },
    
    ads: {
      preRoll: [
        {
          id: "preroll-1",
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
          duration: 15,
          skippable: true,
          skipAfter: 5,
        }
      ],
      midRoll: [
        {
          id: "midroll-1", 
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
          duration: 20,
          skippable: true,
          skipAfter: 5,
          playAt: 30,
        }
      ]
    },
    
    ui: {
      theme: "dark" as const,
      autoplay: true,
      muted: true,
      showControls: true,
      showSettings: true,
    },
    
    analytics: {
      enabled: true,
      onEvent: (event: any) => {
        console.log(`📊 ${event.type}:`, event.payload);
      }
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
      <h1 style={{ color: 'white', textAlign: 'center' }}>
        🎬 Advanced Media Player Test
      </h1>
      
      <div style={{ 
        maxWidth: '1000px', 
        margin: '0 auto',
        border: '2px solid #333',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <MediaPlayer config={config} />
      </div>
      
      <div style={{ color: 'white', textAlign: 'center', marginTop: '20px' }}>
        <p>✅ Check console for DASH analysis and buffer error handling</p>
        <p>⚠️ Watch for multiplexed content warnings</p>
        <p>🎯 Test ad sequence: Pre-roll → Mid-roll at 30s</p>
      </div>
    </div>
  );
};

export default PlayerTest;
```

### **Add to Your App:**
```tsx
// src/App.tsx
import React from 'react';
import PlayerTest from './components/PlayerTest';

function App() {
  return (
    <div className="App">
      <PlayerTest />
    </div>
  );
}

export default App;
```

---

## 🧪 **Testing Features**

### **✅ What to Test:**

#### **1. DASH Content Analysis:**
- Open browser console (F12)
- Look for: `🔍 Analyzing DASH manifest for stream structure...`
- Check if multiplexed warning appears (orange overlay)

#### **2. Buffer Error Handling:**
- Watch console during ad transitions
- Should see: `HLS buffer error (non-critical, auto-handled)`
- Verify ads play correctly without content confusion

#### **3. Ad Sequence:**
- Pre-roll should play first (skippable after 5s)
- Mid-roll should trigger at 30 seconds
- No main content should appear as ads

#### **4. Interactive Features:**
- Settings menu (gear icon)
- Quality selection
- Subtitle options
- Speed controls
- Chapter navigation

#### **5. Error Recovery:**
- If DASH.js rejects content, should see fallback warnings
- Player should continue working despite errors

---

## 📊 **Expected Console Output**

### **✅ Successful DASH Analysis:**
```
🔍 Analyzing DASH manifest for stream structure...
✅ DASH Manifest Analysis: Compliant structure detected
📊 Structure: 2 video tracks, 1 audio tracks (separated)
```

### **⚠️ Multiplexed Content Detection:**
```
🔍 Analyzing DASH manifest for stream structure...
⚠️ DASH Manifest Analysis: Non-compliant multiplexed structure detected
⚠️ Found multiplexed adaptation set (video + audio combined)
🔧 Handling multiplexed DASH content...
```

### **🛡️ Buffer Error Handling:**
```
HLS buffer error (non-critical, auto-handled): {
  type: 'mediaError',
  details: 'bufferAppendError',
  resolved: true
}
```

---

## 🔧 **Troubleshooting**

### **Common Issues:**

#### **1. "Module not found" Error:**
```bash
# Ensure package is installed
npm list advanced-react-media-player

# Reinstall if needed
npm uninstall advanced-react-media-player
npm install ./advanced-react-media-player-1.3.0.tgz
```

#### **2. TypeScript Errors:**
```bash
# Install type definitions
npm install @types/react @types/react-dom
```

#### **3. CSS Not Loading:**
```tsx
// Make sure to import CSS
import 'advanced-react-media-player/dist/index.css';
```

#### **4. Streaming Dependencies:**
```bash
# Install all streaming libraries
npm install hls.js dashjs shaka-player
```

---

## 🎯 **Testing Checklist**

- [ ] Package installs without errors
- [ ] CSS styles load correctly
- [ ] DASH content analysis works
- [ ] Multiplexed warnings appear (if applicable)
- [ ] Buffer errors are handled gracefully
- [ ] Ad sequence plays correctly
- [ ] No main content appears as ads
- [ ] Settings menu functions
- [ ] Console shows proper logging
- [ ] Player recovers from errors

---

## 🚀 **Advanced Testing**

### **Test Different Content Types:**

```tsx
// Test various DASH content
const testConfigs = {
  compliantDASH: {
    url: "https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd",
    mimeType: "application/dash+xml"
  },
  
  hlsContent: {
    url: "https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8", 
    mimeType: "application/x-mpegURL"
  },
  
  regularMP4: {
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    mimeType: "video/mp4"
  }
};
```

### **Test Error Scenarios:**
```tsx
// Test with invalid URLs to verify error handling
const errorTestConfig = {
  src: {
    url: "https://invalid-url.mpd",
    mimeType: "application/dash+xml"
  }
};
```

---

## 📞 **Support**

If you encounter any issues during testing:

1. **Check Console:** Look for error messages and warnings
2. **Verify Dependencies:** Ensure all required packages are installed
3. **Test Network:** Verify content URLs are accessible
4. **Browser Compatibility:** Test in Chrome, Firefox, Safari
5. **Clear Cache:** Clear browser cache and restart dev server

---

## 🎉 **Success Indicators**

**Your installation is successful when:**
- ✅ Player renders without errors
- ✅ DASH analysis logs appear in console
- ✅ Buffer errors are handled gracefully
- ✅ Ad sequence works correctly
- ✅ Multiplexed content shows appropriate warnings
- ✅ All interactive features function properly

**Happy Testing! 🚀**
