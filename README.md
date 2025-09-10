# Custom Media Player

A comprehensive, production-ready video/audio player built with React and TypeScript. Features YouTube-like functionality with advanced ad support, DRM integration, interactive ads, and comprehensive analytics.

## 🌟 Features

### Core Player
- ✅ **Video & Audio Playback** - Supports all modern media formats
- ✅ **Complete Controls** - Play, pause, volume, mute, fullscreen, progress bar with seek
- ✅ **Responsive Design** - Mobile-friendly with touch controls
- ✅ **Keyboard Shortcuts** - Space for play/pause, arrow keys for seek
- ✅ **Auto-hide Controls** - Clean viewing experience

### Ad System
- ✅ **Pre-roll, Mid-roll, Post-roll Ads** - Complete ad insertion support
- ✅ **Skippable Ads** - Configurable skip countdown (e.g., "Skip in 5s")
- ✅ **Ad Countdown** - "Ad ends in Xs" indicators
- ✅ **Multiple Formats** - MP4, VAST, VPAID support
- ✅ **Click Tracking** - Monitor ad interactions
- ✅ **Lazy Loading** - Ads load only when needed

### Interactive Ads
- ✅ **Polls & Quizzes** - Engage viewers during ads
- ✅ **Call-to-Action Buttons** - Drive traffic to landing pages
- ✅ **Overlay Cards** - Product showcases and information cards
- ✅ **Interaction Analytics** - Track user engagement
- ✅ **Local Storage** - Remember user preferences to avoid repetition

### DRM Support
- ✅ **Widevine, PlayReady, FairPlay** - Industry-standard DRM systems
- ✅ **EME/MSE Integration** - Modern browser DRM APIs
- ✅ **License Server Support** - Custom headers and authentication
- ✅ **Fallback Support** - Graceful degradation for non-DRM browsers

### Analytics & Tracking
- ✅ **Comprehensive Events** - Play, pause, seek, volume, fullscreen, errors
- ✅ **Ad Analytics** - Impressions, clicks, skips, completions
- ✅ **Interactive Ad Tracking** - Quiz answers, poll results, CTA clicks
- ✅ **Custom Handlers** - Integrate with Google Analytics, Mixpanel, etc.
- ✅ **Real-time Logging** - Console debugging and external endpoints

### Advanced Features
- ✅ **Picture-in-Picture** - Modern PiP API support
- ✅ **HLS/DASH Streaming** - Adaptive bitrate streaming
- ✅ **Quality Selection** - Manual and automatic quality switching
- ✅ **Themes** - Dark and light mode support
- ✅ **Accessibility** - ARIA labels and keyboard navigation

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd custom-player

# Install dependencies
npm install

# Start development server
npm start
```

### Basic Usage

```tsx
import MediaPlayer from './components/MediaPlayer';
import { PlayerConfig } from './types';

const config: PlayerConfig = {
  src: {
    url: 'https://example.com/video.mp4',
    type: 'video',
    mimeType: 'video/mp4'
  },
  analytics: {
    enabled: true,
    onEvent: (event) => console.log('Analytics:', event)
  },
  ui: {
    theme: 'dark',
    autoplay: false,
    showControls: true
  }
};

function App() {
  return <MediaPlayer config={config} />;
}
```

## 📋 Configuration Examples

### With Ads and Interactive Features

```tsx
const configWithAds: PlayerConfig = {
  src: {
    url: 'https://example.com/main-video.mp4',
    type: 'video'
  },
  ads: {
    preRoll: [{
      id: 'preroll-1',
      url: 'https://example.com/ad-video.mp4',
      duration: 30,
      skippable: true,
      skipAfter: 5,
      interactive: {
        type: 'quiz',
        data: {
          question: 'What do you think about this product?',
          options: ['Love it!', 'It\'s okay', 'Not interested'],
          correctAnswer: 0,
          duration: 15
        }
      }
    }],
    midRoll: [{
      id: 'midroll-1',
      url: 'https://example.com/mid-ad.mp4',
      duration: 15,
      skippable: false,
      playAt: 120, // 2 minutes into content
      interactive: {
        type: 'cta',
        data: {
          text: 'Discover our latest products!',
          url: 'https://example.com/products',
          buttonText: 'Shop Now',
          duration: 10
        }
      }
    }]
  },
  analytics: {
    enabled: true,
    onEvent: (event) => {
      // Send to your analytics service
      console.log('Event:', event);
    }
  }
};
```

### DRM Protected Content

```tsx
const drmConfig: PlayerConfig = {
  src: {
    url: 'https://example.com/encrypted-video.mp4',
    type: 'video',
    drm: {
      type: 'widevine',
      licenseUrl: 'https://license-server.com/widevine/license',
      headers: {
        'X-API-Key': 'your-api-key',
        'Authorization': 'Bearer your-token'
      }
    }
  }
};
```

### HLS/DASH Streaming

```tsx
const hlsConfig: PlayerConfig = {
  src: {
    url: 'https://example.com/stream.m3u8',
    type: 'video',
    mimeType: 'application/x-mpegURL'
  }
};

const dashConfig: PlayerConfig = {
  src: {
    url: 'https://example.com/manifest.mpd',
    type: 'video',
    mimeType: 'application/dash+xml'
  }
};
```

## 🔧 API Reference

### PlayerConfig Interface

```tsx
interface PlayerConfig {
  src: MediaSource;
  ads?: AdConfig;
  analytics?: AnalyticsConfig;
  ui?: UIConfig;
}
```

### MediaSource Interface

```tsx
interface MediaSource {
  url: string;
  type: 'video' | 'audio';
  mimeType?: string;
  drm?: DRMConfig;
}
```

### AdConfig Interface

```tsx
interface AdConfig {
  preRoll?: Ad[];
  midRoll?: MidRollAd[];
  postRoll?: Ad[];
}

interface Ad {
  id: string;
  url: string;
  duration: number;
  skippable: boolean;
  skipAfter?: number;
  interactive?: InteractiveAdConfig;
}
```

### Interactive Ad Types

```tsx
interface InteractiveAdConfig {
  type: 'poll' | 'quiz' | 'cta' | 'overlay';
  data: PollData | QuizData | CTAData | OverlayData;
}

// Poll Example
interface PollData {
  question: string;
  options: string[];
  duration: number;
}

// Quiz Example
interface QuizData {
  question: string;
  options: string[];
  correctAnswer: number;
  duration: number;
}

// Call-to-Action Example
interface CTAData {
  text: string;
  url: string;
  buttonText: string;
  duration: number;
}
```

## 📊 Analytics Events

The player tracks the following events:

| Event Type | Description | Payload |
|------------|-------------|---------|
| `play` | Video starts playing | `{ currentTime }` |
| `pause` | Video is paused | `{ currentTime }` |
| `seek` | User seeks to different time | `{ currentTime }` |
| `volumechange` | Volume or mute state changes | `{ volume, muted }` |
| `fullscreen` | Fullscreen mode toggled | `{ fullscreen }` |
| `error` | Playback error occurs | `{ error }` |
| `ad_start` | Ad begins playing | `{ adId, adType }` |
| `ad_complete` | Ad finishes playing | `{ adId }` |
| `ad_skip` | User skips an ad | `{ adId }` |
| `ad_click` | User clicks on ad | `{ adId, url? }` |
| `ad_interaction` | Interactive ad engagement | `{ adId, interactionType, data }` |
| `buffering_start` | Video starts buffering | `{}` |
| `buffering_end` | Video stops buffering | `{}` |

## 🎨 Theming

The player supports dark and light themes:

```tsx
const config: PlayerConfig = {
  // ... other config
  ui: {
    theme: 'dark', // or 'light'
    // ... other UI options
  }
};
```

## 📱 Mobile Support

The player is fully responsive and includes:
- Touch-friendly controls
- Optimized button sizes for mobile
- Responsive layout that adapts to screen size
- Touch gestures for seek and volume

## 🔧 Browser Support

- **Chrome 60+** - Full support including DRM
- **Firefox 55+** - Full support including DRM
- **Safari 11+** - Full support including FairPlay DRM
- **Edge 79+** - Full support including DRM
- **Mobile browsers** - iOS Safari 11+, Chrome Mobile 60+

## 🛠️ Development

### Project Structure

```
src/
├── components/
│   ├── MediaPlayer.tsx      # Main player component
│   ├── PlayerControls.tsx   # Control bar
│   ├── AdOverlay.tsx        # Ad display overlay
│   └── InteractiveAdOverlay.tsx # Interactive ad features
├── hooks/
│   ├── usePlayerState.ts    # Player state management
│   └── usePictureInPicture.ts # PiP functionality
├── utils/
│   ├── drmManager.ts        # DRM handling
│   ├── adManager.ts         # Ad scheduling and tracking
│   └── streamingManager.ts  # HLS/DASH support
├── types/
│   └── index.ts             # TypeScript interfaces
└── App.tsx                  # Example application
```

### Available Scripts

```bash
npm start          # Start development server
npm build          # Build for production
npm test           # Run tests
npm run eject      # Eject from Create React App
```

## 🔒 DRM Configuration

### Widevine (Google)

```tsx
const drmConfig = {
  type: 'widevine',
  licenseUrl: 'https://your-server.com/widevine/license',
  headers: {
    'X-API-Key': 'your-api-key'
  }
};
```

### PlayReady (Microsoft)

```tsx
const drmConfig = {
  type: 'playready',
  licenseUrl: 'https://your-server.com/playready/license',
  headers: {
    'Authorization': 'Bearer your-token'
  }
};
```

### FairPlay (Apple)

```tsx
const drmConfig = {
  type: 'fairplay',
  licenseUrl: 'https://your-server.com/fairplay/license',
  certificateUrl: 'https://your-server.com/fairplay/cert',
  headers: {
    'X-API-Key': 'your-api-key'
  }
};
```

## 📈 Analytics Integration

### Google Analytics

```tsx
const analyticsConfig = {
  enabled: true,
  onEvent: (event) => {
    if (window.gtag) {
      window.gtag('event', event.type, {
        custom_parameter: event.payload,
        timestamp: event.timestamp
      });
    }
  }
};
```

### Custom Analytics

```tsx
const analyticsConfig = {
  enabled: true,
  endpoint: 'https://your-analytics-server.com/events',
  onEvent: async (event) => {
    await fetch('https://your-analytics-server.com/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    });
  }
};
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the example configurations in `src/App.tsx`

## 🎯 Roadmap

- [ ] 360° video support
- [ ] VR/AR integration
- [ ] Advanced analytics dashboard
- [ ] Server-side ad insertion (SSAI)
- [ ] Content recommendation engine
- [ ] Multi-language subtitle support
