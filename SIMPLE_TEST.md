# 🚀 **Simple NPM Package Test**

## **✅ Quick Working Test** 

### **Step 1: Create Test Project**
```bash
cd /tmp
npm create vite@latest test-player -- --template react-ts
cd test-player
npm install
```

### **Step 2: Install Your Package**
```bash
npm install /Users/apple/Desktop/localPlayer/custom-player/custom-media-player-1.0.0.tgz
```

### **Step 3: Update App.tsx**
Replace `src/App.tsx` with:

```tsx
import React from 'react';
import { MediaPlayer, PlayerConfig, type AnalyticsEvent } from 'custom-media-player';
import 'custom-media-player/dist/index.css';

const config: PlayerConfig = {
  src: {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    type: 'video',
    mimeType: 'video/mp4'
  },
  ads: {
    preRoll: [
      {
        id: 'test-ad',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        duration: 15,
        skippable: true,
        skipAfter: 3,
        interactive: {
          type: 'poll',
          data: {
            question: "🧪 How is this working?",
            options: ["Perfect!", "Good", "Needs work"],
            duration: 8
          }
        }
      }
    ]
  },
  ui: {
    theme: 'dark',
    autoplay: true,
    muted: true
  },
  analytics: {
    enabled: true,
    onEvent: (event: AnalyticsEvent) => console.log('Event:', event)
  }
};

function App() {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#000', 
      minHeight: '100vh',
      color: 'white'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
        🧪 Testing Custom Media Player
      </h1>
      
      <div style={{ 
        width: '800px', 
        height: '450px', 
        margin: '0 auto',
        border: '2px solid #333',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <MediaPlayer config={config} />
      </div>
      
      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        ✅ Package working! Pre-roll ad → Main content → Full controls
      </p>
    </div>
  );
}

export default App;
```

### **Step 4: Start Test**
```bash
npm run dev
```

Visit: http://localhost:5173

## **🎯 What Should Happen:**
1. ✅ Video player renders with dark theme
2. ✅ Pre-roll ad plays automatically  
3. ✅ Interactive poll appears (bottom-left)
4. ✅ Skip button appears after 3 seconds
5. ✅ Main video plays after ad
6. ✅ All controls work
7. ✅ Analytics events in console

## **🔧 If Issues:**

### **Package Not Found:**
```bash
# Check if installed
ls node_modules/custom-media-player/

# Reinstall if needed
npm install /path/to/custom-media-player-1.0.0.tgz
```

### **CSS Not Loading:**
```tsx
// Try different import syntax
import 'custom-media-player/dist/index.css';
// OR
import './node_modules/custom-media-player/dist/index.css';
```

### **TypeScript Errors:**
```bash
# Check TypeScript config allows node_modules
# Should work with Vite's default config
```

---

## **📦 Package Info:**
- **Name:** `custom-media-player` (no scope)
- **Version:** 1.0.0
- **Size:** 2.7MB
- **Files:** 37 files
- **TypeScript:** Full support
- **Vite:** Compatible

**This should work immediately with modern Vite setup!** 🎉
