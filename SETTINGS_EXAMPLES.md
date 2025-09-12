# 🎛️ Settings Menu Examples

Complete examples showing how to use subtitles, video quality, and playback speed settings.

## 📝 **Basic Settings Example**

```tsx
import React from 'react';
import { MediaPlayer, VideoQuality, SubtitleTrack, AnalyticsEvent } from 'advanced-react-media-player';
import 'advanced-react-media-player/dist/index.css';

function App() {
  const config = {
    src: {
      url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      type: 'video',
      mimeType: 'video/mp4'
    },
    
    // 📺 Video Quality Options
    qualities: [
      {
        id: 'quality-1080p',
        label: '1080p Full HD',
        height: 1080,
        width: 1920,
        bitrate: 5000000,
        url: 'https://example.com/video-1080p.mp4'
      },
      {
        id: 'quality-720p',
        label: '720p HD',
        height: 720,
        width: 1280,
        bitrate: 2500000,
        url: 'https://example.com/video-720p.mp4'
      },
      {
        id: 'quality-480p',
        label: '480p',
        height: 480,
        width: 854,
        bitrate: 1000000,
        url: 'https://example.com/video-480p.mp4'
      },
      {
        id: 'quality-360p',
        label: '360p',
        height: 360,
        width: 640,
        bitrate: 500000,
        url: 'https://example.com/video-360p.mp4'
      }
    ],

    // 📝 Subtitle Tracks
    subtitles: [
      {
        id: 'subtitle-en',
        label: 'English',
        language: 'en',
        url: 'https://example.com/subtitles/english.vtt',
        isDefault: true
      },
      {
        id: 'subtitle-es',
        label: 'Español',
        language: 'es',
        url: 'https://example.com/subtitles/spanish.vtt'
      },
      {
        id: 'subtitle-fr',
        label: 'Français',
        language: 'fr',
        url: 'https://example.com/subtitles/french.vtt'
      },
      {
        id: 'subtitle-de',
        label: 'Deutsch',
        language: 'de',
        url: 'https://example.com/subtitles/german.vtt'
      }
    ],

    // ⚙️ Player Settings
    settings: {
      playbackSpeed: 1,        // Normal speed
      autoplay: false,         // Don't autoplay
      loop: false,            // Don't loop
      skipSilence: false,     // Don't skip silence
      pictureInPicture: true  // Enable PiP
    },

    // 🎨 UI Configuration
    ui: {
      theme: 'dark',
      showControls: true,
      showSettings: true,  // 🔑 Enable settings menu
      autoplay: false,
      muted: false
    },

    // 📊 Analytics
    analytics: {
      enabled: true,
      onEvent: (event: AnalyticsEvent) => {
        console.log('📊 Settings Event:', event);
        
        // Handle specific settings events
        switch (event.type) {
          case 'quality_change':
            console.log('🎥 Quality changed to:', event.payload.quality.label);
            break;
          case 'subtitle_change':
            console.log('📝 Subtitle changed to:', event.payload.subtitle?.label || 'Off');
            break;
          case 'speed_change':
            console.log('⚡ Speed changed to:', event.payload.speed + 'x');
            break;
          case 'settings_open':
            console.log('⚙️ Settings menu opened');
            break;
          case 'settings_close':
            console.log('⚙️ Settings menu closed');
            break;
        }
      }
    }
  } as const;

  return (
    <div className="App">
      <h1>🎛️ Advanced Media Player with Settings</h1>
      <MediaPlayer config={config} />
    </div>
  );
}

export default App;
```

## 🚀 **Advanced Implementation with Real Subtitle Files**

```tsx
import React, { useState } from 'react';
import { MediaPlayer, VideoQuality, SubtitleTrack } from 'advanced-react-media-player';

function AdvancedPlayerExample() {
  const [currentQuality, setCurrentQuality] = useState<VideoQuality | null>(null);
  const [currentSubtitle, setCurrentSubtitle] = useState<SubtitleTrack | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Real subtitle files (WebVTT format)
  const subtitleTracks: SubtitleTrack[] = [
    {
      id: 'en-us',
      label: 'English (US)',
      language: 'en-US',
      url: '/subtitles/big-buck-bunny-en.vtt',
      isDefault: true
    },
    {
      id: 'es-es',
      label: 'Spanish (Spain)',
      language: 'es-ES',
      url: '/subtitles/big-buck-bunny-es.vtt'
    },
    {
      id: 'fr-fr',
      label: 'French (France)',
      language: 'fr-FR',
      url: '/subtitles/big-buck-bunny-fr.vtt'
    },
    {
      id: 'de-de',
      label: 'German (Germany)',
      language: 'de-DE',
      url: '/subtitles/big-buck-bunny-de.vtt'
    },
    {
      id: 'ja-jp',
      label: '日本語 (Japanese)',
      language: 'ja-JP',
      url: '/subtitles/big-buck-bunny-ja.vtt'
    }
  ];

  // Multiple quality sources
  const qualityOptions: VideoQuality[] = [
    {
      id: 'uhd-4k',
      label: '4K Ultra HD',
      height: 2160,
      width: 3840,
      bitrate: 15000000,
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    },
    {
      id: 'fhd-1080p',
      label: '1080p Full HD',
      height: 1080,
      width: 1920,
      bitrate: 5000000,
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    },
    {
      id: 'hd-720p',
      label: '720p HD',
      height: 720,
      width: 1280,
      bitrate: 2500000,
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    },
    {
      id: 'sd-480p',
      label: '480p SD',
      height: 480,
      width: 854,
      bitrate: 1000000,
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    },
    {
      id: 'mobile-360p',
      label: '360p Mobile',
      height: 360,
      width: 640,
      bitrate: 500000,
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    }
  ];

  const config = {
    src: {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      type: 'video' as const,
      mimeType: 'video/mp4'
    },

    qualities: qualityOptions,
    subtitles: subtitleTracks,

    settings: {
      playbackSpeed: playbackSpeed,
      autoplay: false,
      loop: false,
      skipSilence: false,
      pictureInPicture: true
    },

    ui: {
      theme: 'dark' as const,
      showControls: true,
      showSettings: true,
      autoplay: false,
      muted: false
    },

    analytics: {
      enabled: true,
      onEvent: (event) => {
        console.log('📊 Player Event:', event);

        // Update local state based on settings changes
        switch (event.type) {
          case 'quality_change':
            setCurrentQuality(event.payload.quality);
            console.log(`🎥 Quality switched to: ${event.payload.quality?.label || 'Auto'}`);
            break;

          case 'subtitle_change':
            setCurrentSubtitle(event.payload.subtitle);
            console.log(`📝 Subtitles switched to: ${event.payload.subtitle?.label || 'Off'}`);
            break;

          case 'speed_change':
            setPlaybackSpeed(event.payload.speed);
            console.log(`⚡ Playback speed: ${event.payload.speed}x`);
            break;

          case 'settings_open':
            console.log('⚙️ Settings panel opened');
            break;

          case 'settings_close':
            console.log('⚙️ Settings panel closed');
            break;
        }
      }
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>🎬 Advanced Media Player</h2>
      
      {/* Status Display */}
      <div style={{ 
        background: '#f5f5f5', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        fontSize: '14px'
      }}>
        <div><strong>📺 Quality:</strong> {currentQuality?.label || 'Auto'}</div>
        <div><strong>📝 Subtitles:</strong> {currentSubtitle?.label || 'Off'}</div>
        <div><strong>⚡ Speed:</strong> {playbackSpeed}x</div>
      </div>

      {/* Media Player */}
      <MediaPlayer config={config} />

      {/* Instructions */}
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <h3>🎛️ How to Use Settings:</h3>
        <ol>
          <li>Click the <strong>⚙️ settings gear</strong> button in the player controls</li>
          <li>Use the <strong>Quality tab</strong> to change video resolution</li>
          <li>Use the <strong>Subtitles tab</strong> to enable/disable captions</li>
          <li>Use the <strong>Speed tab</strong> to adjust playback speed</li>
          <li>Click outside the menu or the <strong>×</strong> to close</li>
        </ol>
      </div>
    </div>
  );
}

export default AdvancedPlayerExample;
```

## 📝 **WebVTT Subtitle File Format**

Create subtitle files in WebVTT format:

**`english.vtt`:**
```vtt
WEBVTT

00:00:01.000 --> 00:00:04.000
Welcome to Big Buck Bunny!

00:00:05.000 --> 00:00:08.000
A short animated film by the Blender Foundation.

00:00:10.000 --> 00:00:13.000
Enjoy the adventure!
```

**`spanish.vtt`:**
```vtt
WEBVTT

00:00:01.000 --> 00:00:04.000
¡Bienvenido a Big Buck Bunny!

00:00:05.000 --> 00:00:08.000
Un cortometraje animado de la Fundación Blender.

00:00:10.000 --> 00:00:13.000
¡Disfruta la aventura!
```

## ⚡ **Speed Control Usage Examples**

```tsx
// Different speed presets for different content types
const documentaryConfig = {
  settings: {
    playbackSpeed: 1.25,  // Slightly faster for educational content
    // ... other settings
  }
};

const musicVideoConfig = {
  settings: {
    playbackSpeed: 1,     // Normal speed for music
    // ... other settings
  }
};

const tutorialConfig = {
  settings: {
    playbackSpeed: 0.75,  // Slower for complex tutorials
    // ... other settings
  }
};
```

## 🎨 **Custom Settings Integration**

```tsx
import React, { useState, useCallback } from 'react';
import { MediaPlayer, SettingsMenu } from 'advanced-react-media-player';

function CustomSettingsExample() {
  const [showCustomSettings, setShowCustomSettings] = useState(false);

  const handleSettingsChange = useCallback((type: string, value: any) => {
    console.log(`Settings changed: ${type} = `, value);
    
    // Save to localStorage
    localStorage.setItem(`player-${type}`, JSON.stringify(value));
    
    // Send to analytics
    analytics.track('player_setting_changed', {
      setting: type,
      value: value,
      timestamp: Date.now()
    });
  }, []);

  // ... config setup

  return (
    <div>
      <MediaPlayer config={config} />
      
      {/* Custom settings UI */}
      {showCustomSettings && (
        <SettingsMenu
          state={playerState}
          qualities={config.qualities}
          subtitles={config.subtitles}
          onQualityChange={(quality) => handleSettingsChange('quality', quality)}
          onSubtitleChange={(subtitle) => handleSettingsChange('subtitle', subtitle)}
          onSpeedChange={(speed) => handleSettingsChange('speed', speed)}
          onClose={() => setShowCustomSettings(false)}
        />
      )}
    </div>
  );
}
```

## 📊 **Analytics Integration Example**

```tsx
const analyticsConfig = {
  analytics: {
    enabled: true,
    onEvent: (event) => {
      // Google Analytics 4
      if (window.gtag) {
        window.gtag('event', event.type, {
          event_category: 'media_player',
          event_label: event.payload?.quality?.label || event.payload?.subtitle?.label,
          value: event.payload?.speed || 1
        });
      }

      // Custom analytics
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: event.type,
          payload: event.payload,
          timestamp: event.timestamp,
          user_id: getCurrentUserId(),
          session_id: getSessionId()
        })
      });
    }
  }
};
```

## 🎯 **Installation & Usage**

```bash
# Install the package
npm install advanced-react-media-player

# Import and use
import { MediaPlayer } from 'advanced-react-media-player';
import 'advanced-react-media-player/dist/index.css';
```

## 🔧 **TypeScript Support**

```tsx
import type { 
  PlayerConfig, 
  VideoQuality, 
  SubtitleTrack, 
  AnalyticsEvent 
} from 'advanced-react-media-player';

// Fully typed configuration
const config: PlayerConfig = {
  // ... your config with full type safety
};
```

## 🎬 **Features Summary**

- ✅ **Quality Selection**: Auto + manual quality switching
- ✅ **Subtitle Support**: WebVTT files with multiple languages  
- ✅ **Speed Control**: 0.25x to 2x playback speeds
- ✅ **Professional UI**: Tabbed settings with smooth animations
- ✅ **Analytics**: Comprehensive event tracking
- ✅ **TypeScript**: Full type safety and IntelliSense
- ✅ **Responsive**: Works on desktop and mobile
- ✅ **Accessible**: ARIA labels and keyboard navigation

**Your media player now has enterprise-level settings functionality!** 🎉
