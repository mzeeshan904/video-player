# 🔧 Fixed Configuration - Settings Working

## ❌ **The Problem:**
Your configuration has `qualities`, `subtitles`, and `chapters` at the root level, but they need to be **inside the `src` object**. Also, you need to enable `showSettings: true` in the UI config.

## ✅ **Fixed Configuration:**

```tsx
import "./App.css";
import { MediaPlayer } from "advanced-react-media-player";
import "advanced-react-media-player/dist/index.css";

function App() {
  const completeAdsConfig = {
    src: {
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      type: "video" as const,
      mimeType: "video/mp4",
      
      // ✅ MOVE THESE INSIDE src OBJECT
      qualities: [
        {
          id: "quality-1080p",
          label: "1080p Full HD",
          height: 1080,
          width: 1920,
          bitrate: 5000000,
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        },
        {
          id: "quality-720p",
          label: "720p HD",
          height: 720,
          width: 1280,
          bitrate: 2500000,
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        },
        {
          id: "quality-480p",
          label: "480p SD",
          height: 480,
          width: 854,
          bitrate: 1000000,
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        },
      ],

      // ✅ SUBTITLES INSIDE src OBJECT
      subtitles: [
        {
          id: "subtitle-en",
          label: "English",
          language: "en",
          url: "https://raw.githubusercontent.com/Polyflix/subtitles/master/Big_Buck_Bunny/Big_Buck_Bunny_en.vtt",
          isDefault: true,
        },
        {
          id: "subtitle-es",
          label: "Español",
          language: "es",
          url: "https://raw.githubusercontent.com/Polyflix/subtitles/master/Big_Buck_Bunny/Big_Buck_Bunny_es.vtt",
        },
        {
          id: "subtitle-fr",
          label: "Français",
          language: "fr",
          url: "https://raw.githubusercontent.com/Polyflix/subtitles/master/Big_Buck_Bunny/Big_Buck_Bunny_fr.vtt",
        },
      ],

      // ✅ CHAPTERS INSIDE src OBJECT
      chapters: [
        { id: "intro", title: "Opening Scene", startTime: 0 },
        { id: "butterflies", title: "Butterflies Appear", startTime: 60 },
        { id: "squirrels", title: "Mischief by Squirrels", startTime: 120 },
        { id: "conflict", title: "The Conflict", startTime: 180 },
        { id: "revenge", title: "Bunny's Revenge", startTime: 240 },
        { id: "ending", title: "Ending Scene", startTime: 360 },
      ],
    },

    ads: {
      // Your existing ads configuration stays the same
      preRoll: [
        {
          id: "preroll-1",
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
          duration: 15,
          skippable: true,
          skipAfter: 5,
        },
        {
          id: "preroll-2",
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
          duration: 15,
          skippable: true,
          skipAfter: 3,
        },
      ],

      midRoll: [
        {
          id: "midroll-1",
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
          duration: 15,
          skippable: true,
          skipAfter: 4,
          playAt: 30,
        },
        {
          id: "midroll-2",
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
          duration: 15,
          skippable: true,
          skipAfter: 3,
          playAt: 90,
        },
      ],

      postRoll: [
        {
          id: "postroll-1",
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
          duration: 60,
          skippable: true,
          skipAfter: 5,
        },
      ],
    },

    ui: {
      theme: "dark" as const,
      autoplay: true,
      muted: true,
      showControls: true,      // ✅ ADD THIS
      showSettings: true,      // ✅ ADD THIS - CRITICAL!
    },

    analytics: {
      enabled: true,
      onEvent: (event: any) => {
        console.log(`📊 ${event.type}:`, event.payload);
        
        // ✅ ADD SETTINGS EVENT LOGGING
        switch (event.type) {
          case 'quality_change':
            console.log(`🎥 Quality changed to: ${event.payload.quality?.label || 'Auto'}`);
            break;
          case 'subtitle_change':
            console.log(`📝 Subtitles changed to: ${event.payload.subtitle?.label || 'Off'}`);
            break;
          case 'speed_change':
            console.log(`⚡ Speed changed to: ${event.payload.speed}x`);
            break;
          case 'chapter_change':
            console.log(`📚 Chapter selected: ${event.payload.chapter?.title}`);
            break;
          case 'settings_open':
            console.log(`⚙️ Settings menu opened`);
            break;
          case 'settings_close':
            console.log(`⚙️ Settings menu closed`);
            break;
        }
      },
    },
  };

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#0a0a0a",
        minHeight: "100vh",
        color: "white",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          fontSize: "2.5rem",
          background: "linear-gradient(135deg, #ff6b6b, #4ecdc4)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: "20px",
        }}
      >
        🎬 Complete Ads Experience
      </h1>

      <div
        style={{
          backgroundColor: "rgba(76, 175, 80, 0.1)",
          border: "1px solid rgba(76, 175, 80, 0.3)",
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "30px",
          textAlign: "center",
          maxWidth: "800px",
          margin: "0 auto 30px auto",
        }}
      >
        <p style={{ margin: 0, color: "#4caf50" }}>
          🎯 <strong>Full Experience:</strong> 2 Pre-roll → Content → 2 Mid-roll (30s & 90s) → 1 Post-roll
          <br />
          🎛️ <strong>Settings:</strong> Quality, Subtitles, Speed, Chapters | ⚙️ <strong>Click gear icon</strong> to access settings
          <br />
          📊 <strong>Analytics:</strong> Console logging for all events
        </p>
      </div>

      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          border: "2px solid #333",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <MediaPlayer config={completeAdsConfig} />
      </div>

      <div style={{ textAlign: "center", marginTop: "30px", opacity: 0.8 }}>
        <p>⚙️ <strong>Click the gear icon</strong> in player controls to access settings</p>
        <p>📊 Open console (F12) to see analytics events</p>
        <p>🔄 Use replay button after completion to test again</p>
      </div>
    </div>
  );
}

export default App;
```

## 🔑 **Key Changes Made:**

### **1. Moved Settings Inside `src` Object:**
```tsx
// ❌ WRONG (your current config)
const config = {
  src: { url: "...", type: "video", mimeType: "video/mp4" },
  qualities: [...], // Outside src
  subtitles: [...], // Outside src
  chapters: [...]   // Outside src
};

// ✅ CORRECT (fixed config)
const config = {
  src: {
    url: "...",
    type: "video",
    mimeType: "video/mp4",
    qualities: [...],  // Inside src
    subtitles: [...],  // Inside src
    chapters: [...]    // Inside src
  }
};
```

### **2. Enabled Settings Menu:**
```tsx
ui: {
  theme: "dark" as const,
  autoplay: true,
  muted: true,
  showControls: true,  // ✅ Added
  showSettings: true,  // ✅ Critical - enables settings menu
}
```

### **3. Enhanced Analytics:**
Added settings event logging to see when settings change.

## 🎛️ **Expected Settings Menu:**

After the fix, clicking the ⚙️ gear icon should show:

```
┌─ Quality ─┬─ Subtitles ─┬─ Speed ─┬─ Chapters ─┐
│           │             │         │             │
│ ○ Auto    │ ○ Off       │ ○ 0.25x │ ○ Opening   │
│ ○ 1080p   │ ● English   │ ○ 0.5x  │ ○ Butterfl. │
│ ○ 720p    │ ○ Español   │ ○ 0.75x │ ○ Mischief  │
│ ○ 480p    │ ○ Français  │ ● 1x    │ ○ Conflict  │
│           │             │ ○ 1.25x │ ○ Revenge   │
│           │             │ ○ 1.5x  │ ○ Ending    │
│           │             │ ○ 1.75x │             │
│           │             │ ○ 2x    │             │
```

## 📱 **Test Steps:**

1. **Replace your App.tsx** with the fixed configuration above
2. **Install latest package:** `npm install /path/to/advanced-react-media-player-1.0.0.tgz`
3. **Start your app:** `npm start`
4. **Look for the ⚙️ gear icon** in the player controls
5. **Click the gear icon** - settings menu should appear
6. **Test all tabs:** Quality, Subtitles, Speed, Chapters
7. **Check console** for settings events

The main issue was that settings need to be **content-specific** (inside the `src` object) and you need `showSettings: true` in the UI config! 🎯
