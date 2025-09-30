# 📦 Install Instructions - v1.1.8 (Enriched Analytics)

## 🚀 Quick Install

```bash
npm install /Users/apple/Desktop/localPlayer/custom-player/advanced-react-media-player-1.1.8.tgz
```

---

## 🔧 If You Get NPM Cache Issues

If you see errors like "tarball data seems to be corrupted" or "ENOENT", try these steps:

### 1. Clear NPM Cache
```bash
npm cache clean --force
```

### 2. Install with Relative Path
```bash
cd /Users/apple/Desktop/localPlayer/custom-player
npm install ./advanced-react-media-player-1.1.8.tgz
```

### 3. Force Reinstall
```bash
npm uninstall advanced-react-media-player
npm install /Users/apple/Desktop/localPlayer/custom-player/advanced-react-media-player-1.1.8.tgz
```

### 4. Alternative: Copy Package Locally
```bash
# Copy the package to your project directory
cp /Users/apple/Desktop/localPlayer/custom-player/advanced-react-media-player-1.1.8.tgz ./
npm install ./advanced-react-media-player-1.1.8.tgz
```

---

## ✅ Verify Installation

After installation, verify it worked:

```bash
npm list advanced-react-media-player
```

Should show:
```
advanced-react-media-player@1.1.8
```

---

## 🧪 Test the Enhanced Analytics

Use this configuration to test:

```typescript
import { MediaPlayer, PlayerConfig } from 'advanced-react-media-player';

const config: PlayerConfig = {
  src: {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    type: 'video'
  },
  ads: {
    preRoll: [
      {
        id: 'test-ad',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        duration: 10,
        skippable: true,
        skipAfter: 3
      }
    ]
  },
  analytics: {
    enabled: true,
    enhancedAnalytics: true,
    onEvent: (event) => {
      console.log('🔥 ENRICHED:', event.payload);
    }
  }
};

<MediaPlayer config={config} />
```

---

## 🎯 What's New in v1.1.8

- ✅ **Enriched Analytics Payloads** with config metadata
- ✅ **Proper Ad Metadata** (duration, skippable, skipAfter)
- ✅ **Current Item State** tracking (content vs ad)
- ✅ **Enhanced Performance Metrics** (correct startupTime)
- ✅ **Config → Analytics Mapping** (src.url → contentUri)
- ✅ **Fixed Event Metrics** (pauseCount, interactionCount, etc.)
- ✅ **Dynamic Event Hooks** (optional custom callbacks)

All previous functionality is preserved - this is purely additive!

---

## 🆘 Still Having Issues?

1. **Check file exists:**
   ```bash
   ls -la /Users/apple/Desktop/localPlayer/custom-player/advanced-react-media-player-1.1.8.tgz
   ```

2. **Check package contents:**
   ```bash
   tar -tf /Users/apple/Desktop/localPlayer/custom-player/advanced-react-media-player-1.1.8.tgz | head
   ```

3. **Try absolute path:**
   ```bash
   npm install file:///Users/apple/Desktop/localPlayer/custom-player/advanced-react-media-player-1.1.8.tgz
   ```

If none of these work, the package may need to be rebuilt. Let me know and I can generate a fresh one!
