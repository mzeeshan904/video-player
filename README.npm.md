# Custom Media Player

A professional, feature-rich React media player component with advanced ad support, DRM integration, interactive features, and comprehensive analytics.

[![npm version](https://badge.fury.io/js/%40your-org%2Fcustom-media-player.svg)](https://badge.fury.io/js/%40your-org%2Fcustom-media-player)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

### 🎬 **Core Player Features**
- Video and audio playback support
- Standard controls (Play, Pause, Volume, Mute, Fullscreen)
- Progress bar with seek functionality
- Responsive and mobile-friendly design
- Picture-in-Picture mode support

### 📺 **Advanced Ad System**
- **Pre-roll, Mid-roll, Post-roll ads**
- **Skippable ads** with customizable skip timers
- **Interactive ads** with polls, quizzes, and CTAs
- **Multiple ad formats** (MP4, VAST, VPAID support)
- **Seek-aware ad insertion**
- **Ad sequencing** and replay functionality

### 🔐 **DRM Support**
- Encrypted Media Extensions (EME) integration
- **Widevine**, **PlayReady**, and **FairPlay** support
- Configurable license server URLs
- Fallback support for non-DRM browsers

### 🎥 **Adaptive Streaming**
- **HLS** streaming support
- **DASH** streaming support
- Automatic quality adaptation
- Custom streaming configurations

### 📊 **Analytics & Tracking**
- Comprehensive event tracking
- Player events (play, pause, seek, etc.)
- Ad events (impressions, clicks, completions)
- Interactive ad engagement metrics
- Custom analytics integration

## Installation

```bash
npm install @your-org/custom-media-player
```

### Peer Dependencies

```bash
npm install react react-dom
```

## Quick Start

```tsx
import React from 'react';
import { MediaPlayer, PlayerConfig } from '@your-org/custom-media-player';

const config: PlayerConfig = {
  src: {
    url: 'https://example.com/video.mp4',
    type: 'video',
    mimeType: 'video/mp4'
  },
  ads: {
    preRoll: [
      {
        id: 'preroll-1',
        url: 'https://example.com/ad.mp4',
        duration: 15,
        skippable: true,
        skipAfter: 5
      }
    ]
  },
  ui: {
    theme: 'dark',
    autoplay: false,
    muted: false
  }
};

function App() {
  return (
    <div style={{ width: '800px', height: '450px' }}>
      <MediaPlayer config={config} />
    </div>
  );
}

export default App;
```

## Configuration

### Basic Configuration

```tsx
const config: PlayerConfig = {
  src: {
    url: 'video-url.mp4',
    type: 'video', // 'video' | 'audio'
    mimeType: 'video/mp4'
  },
  ui: {
    theme: 'dark', // 'dark' | 'light'
    autoplay: false,
    muted: false,
    showControls: true
  }
};
```

### DRM Configuration

```tsx
const drmConfig: PlayerConfig = {
  src: {
    url: 'encrypted-video.mp4',
    type: 'video',
    drm: {
      type: 'widevine', // 'widevine' | 'playready' | 'fairplay'
      licenseUrl: 'https://license-server.com/license',
      headers: { 'X-API-Key': 'your-key' }
    }
  }
};
```

### HLS/DASH Streaming

```tsx
const streamingConfig: PlayerConfig = {
  src: {
    url: 'https://example.com/stream.m3u8',
    type: 'video',
    mimeType: 'application/x-mpegURL' // HLS
    // mimeType: 'application/dash+xml' // DASH
  }
};
```

### Interactive Ads

```tsx
const interactiveAdsConfig: PlayerConfig = {
  ads: {
    preRoll: [
      {
        id: 'interactive-ad',
        url: 'ad-video.mp4',
        duration: 30,
        skippable: true,
        skipAfter: 5,
        interactive: {
          type: 'poll',
          data: {
            question: "What's your favorite feature?",
            options: ["Video Quality", "Ad Experience", "UI Design"],
            duration: 10
          }
        }
      }
    ]
  }
};
```

### Analytics Integration

```tsx
const analyticsConfig: PlayerConfig = {
  analytics: {
    enabled: true,
    onEvent: (event) => {
      console.log('Player Event:', event);
      // Send to your analytics service
      gtag('event', event.type, {
        event_category: 'video',
        event_label: event.payload?.currentTime
      });
    }
  }
};
```

## API Reference

### PlayerConfig

| Property | Type | Description |
|----------|------|-------------|
| `src` | `MediaSource` | Video/audio source configuration |
| `ads?` | `AdConfig` | Ad configuration |
| `drm?` | `DRMConfig` | DRM settings |
| `analytics?` | `AnalyticsConfig` | Analytics configuration |
| `ui?` | `UIConfig` | UI customization options |

### Events

The player emits various events through the analytics system:

- `play` - Video starts playing
- `pause` - Video is paused
- `seek` - User seeks to different position
- `volumechange` - Volume is changed
- `fullscreen` - Fullscreen mode toggled
- `ad_start` - Ad begins playing
- `ad_complete` - Ad finishes
- `ad_skip` - Ad is skipped
- `ad_click` - Ad is clicked
- `ad_interaction` - Interactive ad engagement

## TypeScript Support

This package includes TypeScript definitions. All types are exported:

```tsx
import { 
  PlayerConfig, 
  PlayerState, 
  AnalyticsEvent, 
  AdConfig,
  DRMConfig 
} from '@your-org/custom-media-player';
```

## Browser Support

- **Modern browsers** with ES2015+ support
- **Chrome 60+**
- **Firefox 55+**
- **Safari 12+**
- **Edge 79+**

### Required Browser APIs
- Media Source Extensions (MSE) for adaptive streaming
- Encrypted Media Extensions (EME) for DRM
- Picture-in-Picture API (optional)

## Examples

Check out the `/demo` folder for complete examples including:

- Basic video playback
- Ad-supported videos
- DRM-protected content
- HLS/DASH streaming
- Interactive ads
- Analytics integration

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT © [Your Name]

## Support

- 📚 [Documentation](https://github.com/your-username/custom-media-player)
- 🐛 [Issues](https://github.com/your-username/custom-media-player/issues)
- 💬 [Discussions](https://github.com/your-username/custom-media-player/discussions)
