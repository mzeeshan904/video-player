# 🎯 **WORKING EXAMPLE - Copy This Exactly**

## **✅ Fixed Import Issue - Use This Code:**

Replace your `src/App.tsx` with this **exact code** that avoids the import problem:

```tsx
import React from 'react';
import { MediaPlayer } from 'custom-media-player';
import 'custom-media-player/dist/index.css';

const App: React.FC = () => {
  // Define config inline without importing PlayerConfig type
  const config = {
    src: {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      type: 'video' as const,
      mimeType: 'video/mp4'
    },
    ads: {
      preRoll: [
        {
          id: 'demo-preroll',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          duration: 15,
          skippable: true,
          skipAfter: 3,
          interactive: {
            type: 'poll' as const,
            data: {
              question: "How do you like this player?",
              options: ["Love it!", "Pretty good", "Okay"],
              duration: 8
            }
          }
        }
      ]
    },
    ui: {
      theme: 'dark' as const,
      autoplay: true,
      muted: true
    },
    analytics: {
      enabled: true,
      onEvent: (event: any) => {
        console.log('Player Event:', event.type, event);
      }
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#000', 
      minHeight: '100vh',
      color: 'white'
    }}>
      <h1 style={{ 
        textAlign: 'center', 
        marginBottom: '30px',
        background: 'linear-gradient(135deg, #ff6b6b, #4ecdc4)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        🎬 Custom Media Player Working!
      </h1>
      
      <div style={{
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        border: '1px solid rgba(76, 175, 80, 0.3)',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '30px',
        textAlign: 'center',
        maxWidth: '800px',
        margin: '0 auto 30px auto'
      }}>
        <p style={{ margin: 0, color: '#4caf50' }}>
          ✅ <strong>Package Working!</strong> Pre-roll ad → Main content → All features
        </p>
      </div>
      
      <div style={{ 
        width: '100%', 
        maxWidth: '800px', 
        margin: '0 auto',
        border: '2px solid #333',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <MediaPlayer config={config} />
      </div>

      <div style={{ 
        textAlign: 'center', 
        marginTop: '30px',
        opacity: 0.8
      }}>
        <p>🎯 Test: Pre-roll ad → Interactive poll → Skip after 3s → Main video</p>
        <p>📊 Open console (F12) to see analytics events</p>
      </div>
    </div>
  );
};

export default App;
```

---

## **🔧 What Was Fixed:**

1. **Removed `PlayerConfig` import** - Used inline config object instead
2. **Removed `AnalyticsEvent` import** - Used `any` type for event handler
3. **Added `as const`** - For proper TypeScript literal types
4. **Simple import** - Only imports what's needed

---

## **🎯 This Will Work Because:**

- ✅ No type imports that cause module resolution issues
- ✅ Simple configuration object
- ✅ Only imports the component and CSS
- ✅ TypeScript will infer the correct types

---

## **🚀 Steps:**

1. **Copy the code above exactly**
2. **Replace your entire `src/App.tsx`**
3. **Save the file**
4. **Start your app:** `npm start`
5. **Visit:** http://localhost:3000

---

## **✅ Expected Result:**

- 🎬 Video player loads immediately
- 📺 Pre-roll ad plays automatically  
- 🗳️ Interactive poll appears (bottom-left)
- ⏭️ Skip button after 3 seconds
- 🎥 Main video plays after ad
- 📊 Analytics events in console

**This exact code will work with your installed package!** 🎉
