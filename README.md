# 🎬 Advanced React Media Player

> **Professional-grade React media player with ads, DRM, analytics, and interactive features**

[![npm version](https://badge.fury.io/js/advanced-react-media-player.svg)](https://badge.fury.io/js/advanced-react-media-player)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

A feature-rich, production-ready React media player component that supports video/audio playback with comprehensive advertising, DRM protection, adaptive streaming, and advanced analytics.

## ✨ Features

### 🎥 **Core Player**
- ✅ **Video & Audio Support** - MP4, WebM, HLS, DASH
- ✅ **Responsive Design** - Mobile-friendly with touch controls
- ✅ **Standard Controls** - Play, Pause, Volume, Mute, Fullscreen, Seek
- ✅ **Picture-in-Picture** - Modern PiP API support
- ✅ **Keyboard Shortcuts** - Space, Arrow keys, Volume controls

### 📺 **Advertising System**
- ✅ **Pre-roll, Mid-roll, Post-roll Ads** - Complete ad sequence support
- ✅ **Skippable Ads** - Configurable skip timing with countdown
- ✅ **Multiple Ad Formats** - MP4, VAST, VPAID support
- ✅ **Interactive Ads** - Polls, quizzes, CTAs, overlay cards
- ✅ **Ad Analytics** - Impressions, clicks, skips, completions
- ✅ **Lazy Loading** - Efficient ad resource management

### 🔐 **DRM Protection**
- ✅ **Widevine** - Google's DRM solution
- ✅ **PlayReady** - Microsoft's DRM system
- ✅ **FairPlay** - Apple's DRM technology
- ✅ **EME/MSE Integration** - Modern browser DRM APIs
- ✅ **Fallback Support** - Graceful degradation for non-DRM browsers

### 📊 **Analytics & Tracking**
- ✅ **Player Events** - Play, pause, seek, buffering, errors
- ✅ **Ad Events** - Complete ad lifecycle tracking
- ✅ **Interactive Events** - User engagement with ads
- ✅ **Custom Events** - Extensible analytics system
- ✅ **External Integration** - Easy integration with analytics platforms

### 🚀 **Advanced Features**
- ✅ **Adaptive Bitrate Streaming** - HLS.js & Dash.js integration
- ✅ **TypeScript Support** - Full type safety
- ✅ **Configurable UI** - Customizable player appearance
- ✅ **Local Storage** - User preferences persistence
- ✅ **Error Handling** - Robust error recovery

## 📦 Installation

```bash
npm install advanced-react-media-player
```

## 🚀 Quick Start

```tsx
import React from 'react';
import { MediaPlayer } from 'advanced-react-media-player';
import 'advanced-react-media-player/dist/index.css';

function App() {
  const config = {
    src: {
      url: 'https://your-video-url.mp4',
      mimeType: 'video/mp4'
    },
    ui: {
      showControls: true,
      autoplay: true,
      responsive: true
    },
    ads: {
      enabled: true,
      preRoll: [
        {
          id: 'preroll-1',
          url: 'https://your-ad-url.mp4',
          duration: 15,
          skippable: true,
          skipAfter: 5
        }
      ],
      midRoll: [
        {
          id: 'midroll-1',
          url: 'https://your-ad-url.mp4',
          duration: 15,
          playAt: 30,
          skippable: true,
          skipAfter: 5
        }
      ]
    },
    analytics: {
      enabled: true,
      onEvent: (event) => console.log('📊 Analytics:', event)
    }
  };

  return (
    <div className="App">
      <MediaPlayer config={config} />
    </div>
  );
}

export default App;
```

## 📖 Documentation

### 🔧 **Configuration Options**

<details>
<summary><strong>Player Configuration</strong></summary>

```typescript
interface PlayerConfig {
  src: {
    url: string;
    mimeType?: string;
    drm?: DRMConfig;
  };
  ui?: {
    showControls?: boolean;
    autoplay?: boolean;
    responsive?: boolean;
    poster?: string;
  };
  ads?: AdConfig;
  analytics?: {
    enabled: boolean;
    onEvent: (event: AnalyticsEvent) => void;
  };
}
```
</details>

<details>
<summary><strong>Ad Configuration</strong></summary>

```typescript
interface AdConfig {
  enabled: boolean;
  preRoll?: Ad[];
  midRoll?: MidRollAd[];
  postRoll?: Ad[];
  vast?: {
    enabled: boolean;
    tagUrl?: string;
  };
}

interface Ad {
  id: string;
  url: string;
  duration: number;
  skippable?: boolean;
  skipAfter?: number;
  interactive?: PollData | QuizData | CTAData | OverlayData;
}
```
</details>

<details>
<summary><strong>DRM Configuration</strong></summary>

```typescript
interface DRMConfig {
  widevine?: {
    licenseServerUrl: string;
    certificateUrl?: string;
  };
  playready?: {
    licenseServerUrl: string;
  };
  fairplay?: {
    licenseServerUrl: string;
    certificateUrl: string;
  };
}
```
</details>

### 🎯 **Interactive Ads**

Create engaging ad experiences with polls, quizzes, and CTAs:

```typescript
const interactiveAd = {
  id: 'poll-ad',
  url: 'https://ad-video.mp4',
  duration: 30,
  interactive: {
    type: 'poll',
    question: 'What\'s your favorite feature?',
    options: ['Video Quality', 'Ad Experience', 'Analytics'],
    position: 'bottom-left'
  }
};
```

### 📊 **Analytics Events**

Track comprehensive player and ad analytics:

```typescript
const handleAnalytics = (event: AnalyticsEvent) => {
  switch (event.type) {
    case 'play':
      console.log('Video started:', event.payload);
      break;
    case 'ad_impression':
      console.log('Ad viewed:', event.payload);
      break;
    case 'interactive_engagement':
      console.log('User engaged:', event.payload);
      break;
  }
};
```

## 🎬 **Example Configurations**

### Basic Video Player
```typescript
const basicConfig = {
  src: { url: 'https://video.mp4' },
  ui: { showControls: true }
};
```

### Complete Ad Experience
```typescript
const adConfig = {
  src: { url: 'https://main-video.mp4' },
  ads: {
    enabled: true,
    preRoll: [{ id: 'pre1', url: 'https://ad1.mp4', duration: 15, skippable: true, skipAfter: 5 }],
    midRoll: [{ id: 'mid1', url: 'https://ad2.mp4', duration: 15, playAt: 60, skippable: true }],
    postRoll: [{ id: 'post1', url: 'https://ad3.mp4', duration: 10 }]
  }
};
```

### DRM-Protected Content
```typescript
const drmConfig = {
  src: {
    url: 'https://encrypted-video.mpd',
    mimeType: 'application/dash+xml',
    drm: {
      widevine: {
        licenseServerUrl: 'https://license-server.com/widevine'
      }
    }
  }
};
```

## 🔧 **API Reference**

### Components
- `<MediaPlayer config={PlayerConfig} />` - Main player component

### Hooks
- `usePlayerState(onEvent?)` - Player state management
- `usePictureInPicture(videoRef)` - PiP functionality

### Types
- `PlayerConfig` - Main configuration interface
- `AnalyticsEvent` - Analytics event structure
- `Ad`, `MidRollAd` - Ad configuration types
- `DRMConfig` - DRM settings interface

## 🌟 **Live Examples**

Check out our comprehensive examples:
- [Basic Usage](./USAGE_EXAMPLE.md)
- [Complete Ad Setup](./COMPLETE_ADS_EXAMPLE.md)

## 🤝 **Contributing**

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

- 📖 [Documentation](https://github.com/YOUR_GITHUB_USERNAME/advanced-react-media-player#readme)
- 🐛 [Issue Tracker](https://github.com/YOUR_GITHUB_USERNAME/advanced-react-media-player/issues)
- 💬 [Discussions](https://github.com/YOUR_GITHUB_USERNAME/advanced-react-media-player/discussions)

## 🎯 **Roadmap**

- [ ] WebRTC streaming support
- [ ] Server-side ad insertion (SSAI)
- [ ] Advanced analytics dashboard
- [ ] React Native version
- [ ] Vue.js version

---

**Made with ❤️ for the React community**