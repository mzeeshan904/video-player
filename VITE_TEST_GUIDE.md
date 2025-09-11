# 🚀 **Modern Vite Testing Guide**

Updated guide for testing your npm package with **Vite** (not deprecated Create React App).

## **✅ Problem Fixed:**
- ❌ ~~Create React App (deprecated)~~ 
- ✅ **Vite** (modern, fast)
- ✅ **Fixed TypeScript types path**
- ✅ **Proper CSS imports**
- ✅ **Clean package structure**

---

## **🧪 Quick Test Commands**

### **Option 1: Automated Vite Test Script** (Recommended)
```bash
./test-package.sh
```

### **Option 2: Manual Vite Test**
```bash
# 1. Build package
npm run build && npm pack

# 2. Create Vite project
cd /tmp
npm create vite@latest test-player -- --template react-ts
cd test-player
npm install

# 3. Install your package
npm install /path/to/your-org-custom-media-player-1.0.0.tgz

# 4. Install CSS and test
```

**Replace `src/App.tsx`:**
```tsx
import React from 'react';
import { MediaPlayer, PlayerConfig, AnalyticsEvent } from '@your-org/custom-media-player';

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
            question: "🧪 Testing with Vite! How's it working?",
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
    onEvent: (event: AnalyticsEvent) => console.log('📊 Analytics:', event)
  }
};

function App() {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#0a0a0a', 
      minHeight: '100vh',
      color: 'white'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
        🧪 Testing NPM Package with Vite
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
    </div>
  );
}

export default App;
```

**Update `src/main.tsx`:**
```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import '@your-org/custom-media-player/dist/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

```bash
# 5. Start Vite dev server
npm run dev
```

---

## **🔧 Fixed Issues:**

### **✅ Package Structure**
- **Old:** Confusing `dist/src/index.d.ts` structure
- **New:** Clean `dist/types/index.d.ts` structure

### **✅ TypeScript Types**
```json
{
  "types": "dist/types/index.d.ts"
}
```

### **✅ Modern Build Tool**
- **Old:** Create React App (deprecated)
- **New:** Vite (fast, modern)

### **✅ CSS Import**
```tsx
import '@your-org/custom-media-player/dist/index.css'
```

---

## **📦 Package Info (Updated):**
```bash
📦 @your-org/custom-media-player@1.0.0
📊 Package size: 2.7 MB
📁 Total files: 37 (much cleaner!)
✅ TypeScript declarations: ✓
✅ CSS extracted: ✓
✅ ES Modules + CommonJS: ✓
```

---

## **🎯 What to Test:**

### **Core Features:**
- [ ] Video loads and plays automatically
- [ ] Pre-roll ad plays first (15s, skippable after 3s)
- [ ] Interactive poll appears during ad
- [ ] Main video plays after ad completion
- [ ] All controls work (play, pause, seek, volume, fullscreen)

### **Vite-Specific:**
- [ ] Hot Module Replacement (HMR) works
- [ ] Fast development server startup
- [ ] TypeScript intellisense
- [ ] CSS styles load correctly
- [ ] No console errors

### **Package Integration:**
- [ ] Import works: `import { MediaPlayer } from '@your-org/custom-media-player'`
- [ ] TypeScript types work
- [ ] CSS styles apply
- [ ] Analytics events fire

---

## **🚀 Quick Test Now:**

```bash
./test-package.sh
```

**This will:**
1. ✅ Build your package
2. ✅ Create Vite React TypeScript project
3. ✅ Install your package
4. ✅ Set up test component with CSS
5. ✅ Start Vite dev server on port 3001
6. ✅ Open browser automatically

**No more deprecated Create React App!** 🎉
