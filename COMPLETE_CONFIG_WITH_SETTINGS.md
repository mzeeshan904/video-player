# 🎬 Complete Configuration: Ads + Settings + Analytics

## 🚀 **Copy-Paste Ready Configuration**

Here's your complete configuration with 2 pre-roll + 2 mid-roll + 1 post-roll ads, plus comprehensive video quality, subtitles, chapters, and analytics:

```tsx
import React from 'react';
import { MediaPlayer } from 'advanced-react-media-player';
import 'advanced-react-media-player/dist/index.css';

const App: React.FC = () => {
  const completeConfig = {
    src: {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      type: 'video' as const,
      mimeType: 'video/mp4',
      
      // 📺 Video Quality Options (5 different resolutions)
      qualities: [
        {
          id: 'quality-4k',
          label: '4K Ultra HD',
          height: 2160,
          width: 3840,
          bitrate: 15000000,
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
        },
        {
          id: 'quality-1080p',
          label: '1080p Full HD',
          height: 1080,
          width: 1920,
          bitrate: 5000000,
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
        },
        {
          id: 'quality-720p',
          label: '720p HD',
          height: 720,
          width: 1280,
          bitrate: 2500000,
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
        },
        {
          id: 'quality-480p',
          label: '480p SD',
          height: 480,
          width: 854,
          bitrate: 1000000,
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
        },
        {
          id: 'quality-360p',
          label: '360p Mobile',
          height: 360,
          width: 640,
          bitrate: 500000,
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
        }
      ],

      // 📝 Subtitle Tracks (13 languages)
      subtitles: [
        {
          id: 'subtitle-en-us',
          label: 'English (US)',
          language: 'en-US',
          url: 'https://example.com/subtitles/big-buck-bunny/en-us.vtt',
          isDefault: true
        },
        {
          id: 'subtitle-en-uk',
          label: 'English (UK)',
          language: 'en-GB',
          url: 'https://example.com/subtitles/big-buck-bunny/en-gb.vtt'
        },
        {
          id: 'subtitle-es-es',
          label: 'Español (España)',
          language: 'es-ES',
          url: 'https://example.com/subtitles/big-buck-bunny/es-es.vtt'
        },
        {
          id: 'subtitle-es-mx',
          label: 'Español (México)',
          language: 'es-MX',
          url: 'https://example.com/subtitles/big-buck-bunny/es-mx.vtt'
        },
        {
          id: 'subtitle-fr-fr',
          label: 'Français (France)',
          language: 'fr-FR',
          url: 'https://example.com/subtitles/big-buck-bunny/fr-fr.vtt'
        },
        {
          id: 'subtitle-de-de',
          label: 'Deutsch',
          language: 'de-DE',
          url: 'https://example.com/subtitles/big-buck-bunny/de-de.vtt'
        },
        {
          id: 'subtitle-it-it',
          label: 'Italiano',
          language: 'it-IT',
          url: 'https://example.com/subtitles/big-buck-bunny/it-it.vtt'
        },
        {
          id: 'subtitle-pt-br',
          label: 'Português (Brasil)',
          language: 'pt-BR',
          url: 'https://example.com/subtitles/big-buck-bunny/pt-br.vtt'
        },
        {
          id: 'subtitle-ru-ru',
          label: 'Русский',
          language: 'ru-RU',
          url: 'https://example.com/subtitles/big-buck-bunny/ru-ru.vtt'
        },
        {
          id: 'subtitle-ja-jp',
          label: '日本語',
          language: 'ja-JP',
          url: 'https://example.com/subtitles/big-buck-bunny/ja-jp.vtt'
        },
        {
          id: 'subtitle-ko-kr',
          label: '한국어',
          language: 'ko-KR',
          url: 'https://example.com/subtitles/big-buck-bunny/ko-kr.vtt'
        },
        {
          id: 'subtitle-zh-cn',
          label: '中文 (简体)',
          language: 'zh-CN',
          url: 'https://example.com/subtitles/big-buck-bunny/zh-cn.vtt'
        },
        {
          id: 'subtitle-ar-sa',
          label: 'العربية',
          language: 'ar-SA',
          url: 'https://example.com/subtitles/big-buck-bunny/ar-sa.vtt'
        }
      ],

      // 📚 Video Chapters (9 chapters for easy navigation)
      chapters: [
        { id: 'opening', title: 'Opening Credits', startTime: 0 },
        { id: 'intro', title: 'Meet Big Buck Bunny', startTime: 15 },
        { id: 'forest', title: 'Peaceful Forest', startTime: 45 },
        { id: 'squirrels', title: 'Flying Squirrels Appear', startTime: 120 },
        { id: 'conflict', title: 'The Conflict Begins', startTime: 180 },
        { id: 'revenge', title: 'Bunny\'s Revenge', startTime: 240 },
        { id: 'apple', title: 'The Apple Throw', startTime: 300 },
        { id: 'resolution', title: 'Resolution', startTime: 360 },
        { id: 'credits', title: 'End Credits', startTime: 420 }
      ]
    },

    // 🎬 Complete Ad Configuration (2+2+1)
    ads: {
      // PRE-ROLL ADS (2 ads before main content)
      preRoll: [
        {
          id: 'preroll-1',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          duration: 15,
          skippable: true,
          skipAfter: 5,
          interactive: {
            type: 'poll' as const,
            data: {
              question: "🚀 What brings you here today?",
              options: ["Entertainment", "Learning", "Business"],
              duration: 10,
              position: 'bottom-left' as const
            }
          }
        },
        {
          id: 'preroll-2',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
          duration: 15,
          skippable: true,
          skipAfter: 3,
          interactive: {
            type: 'cta' as const,
            data: {
              text: "🎯 Special Offer - Limited Time!",
              url: "https://example.com/offer",
              buttonText: "Get 50% Off",
              duration: 8,
              position: 'bottom-left' as const
            }
          }
        }
      ],

      // MID-ROLL ADS (2 ads during main content)
      midRoll: [
        {
          id: 'midroll-1',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
          duration: 15,
          skippable: true,
          skipAfter: 4,
          playAt: 30, // Play at 30 seconds
          interactive: {
            type: 'quiz' as const,
            data: {
              question: "🧠 Quick Quiz: What's the capital of France?",
              options: ["London", "Berlin", "Paris", "Madrid"],
              correctAnswer: 2,
              duration: 12,
              position: 'bottom-left' as const
            }
          }
        },
        {
          id: 'midroll-2',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
          duration: 15,
          skippable: true,
          skipAfter: 3,
          playAt: 90, // Play at 90 seconds
          interactive: {
            type: 'poll' as const,
            data: {
              question: "🎪 How's your viewing experience so far?",
              options: ["🔥 Amazing!", "👍 Pretty good", "😐 It's okay", "👎 Not great"],
              duration: 10,
              position: 'bottom-left' as const
            }
          }
        }
      ],

      // POST-ROLL AD (1 ad after main content)
      postRoll: [
        {
          id: 'postroll-1',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
          duration: 60,
          skippable: true,
          skipAfter: 5,
          interactive: {
            type: 'cta' as const,
            data: {
              text: "🌟 Thanks for watching! Subscribe for more",
              url: "https://example.com/subscribe",
              buttonText: "Subscribe Now",
              duration: 15,
              position: 'bottom-left' as const
            }
          }
        }
      ]
    },

    // 🎨 UI Configuration
    ui: {
      theme: 'dark' as const,
      autoplay: true,
      muted: true,
      showControls: true,
      showSettings: true  // ✨ Enable complete settings menu
    },

    // 📊 Comprehensive Analytics
    analytics: {
      enabled: true,
      onEvent: (event: any) => {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`📊 [${timestamp}] ${event.type}:`, event.payload);
        
        // Handle all event types
        switch (event.type) {
          // Playback events
          case 'play':
            console.log('▶️ Video started playing');
            break;
          case 'pause':
            console.log('⏸️ Video paused');
            break;
          case 'seek':
            console.log(`⏯️ Seeked to: ${event.payload.currentTime}s`);
            break;
          
          // Settings events (NEW!)
          case 'quality_change':
            console.log(`🎥 Quality: ${event.payload.quality?.label || 'Auto'}`);
            break;
          case 'subtitle_change':
            console.log(`📝 Subtitles: ${event.payload.subtitle?.label || 'Off'}`);
            break;
          case 'speed_change':
            console.log(`⚡ Speed: ${event.payload.speed}x`);
            break;
          case 'chapter_change':
            console.log(`📚 Chapter: ${event.payload.chapter?.title}`);
            break;
          case 'settings_open':
            console.log(`⚙️ Settings opened`);
            break;
          case 'settings_close':
            console.log(`⚙️ Settings closed`);
            break;
          
          // Ad events
          case 'ad_start':
            console.log(`🎬 Ad started: ${event.payload.adId} (${event.payload.adType})`);
            break;
          case 'ad_complete':
            console.log(`✅ Ad completed: ${event.payload.adId}`);
            break;
          case 'ad_skip':
            console.log(`⏭️ Ad skipped: ${event.payload.adId}`);
            break;
          case 'ad_interaction':
            console.log(`🎯 Ad interaction: ${event.payload.type}`, event.payload.data);
            break;
        }
      }
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h1>🎬 Complete Media Player Demo</h1>
      <p>
        <strong>Features:</strong> 2 Pre-roll + 2 Mid-roll + 1 Post-roll ads, 
        5 video qualities, 13 subtitle languages, 9 chapters, interactive ads, 
        comprehensive analytics.
      </p>
      
      <MediaPlayer config={completeConfig} />
      
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <h3>🎛️ Available Settings:</h3>
        <ul>
          <li><strong>Quality:</strong> Auto, 4K, 1080p, 720p, 480p, 360p</li>
          <li><strong>Subtitles:</strong> 13 languages including English, Spanish, French, German, Japanese, Chinese, Arabic</li>
          <li><strong>Speed:</strong> 0.25x to 2x playback speed</li>
          <li><strong>Chapters:</strong> 9 clickable chapter markers for easy navigation</li>
        </ul>
        
        <h3>🎬 Ad Sequence:</h3>
        <ol>
          <li><strong>Pre-roll 1:</strong> 15s ad with poll (skip after 5s)</li>
          <li><strong>Pre-roll 2:</strong> 15s ad with CTA (skip after 3s)</li>
          <li><strong>Main video:</strong> Big Buck Bunny with all settings</li>
          <li><strong>Mid-roll 1:</strong> 15s ad with quiz at 30s (skip after 4s)</li>
          <li><strong>Mid-roll 2:</strong> 15s ad with poll at 90s (skip after 3s)</li>
          <li><strong>Post-roll:</strong> 60s ad with CTA (skip after 5s)</li>
          <li><strong>Replay option:</strong> Restart entire sequence</li>
        </ol>
      </div>
    </div>
  );
};

export default App;
```

## 🎯 **Features Summary**

### **📺 Video Settings:**
- ✅ **5 Quality Options:** 4K, 1080p, 720p, 480p, 360p
- ✅ **13 Subtitle Languages:** English (US/UK), Spanish (ES/MX), French, German, Italian, Portuguese, Russian, Japanese, Korean, Chinese, Arabic
- ✅ **9 Video Chapters:** Easy navigation through the content
- ✅ **Speed Control:** 0.25x to 2x playback speeds

### **🎬 Complete Ad System:**
- ✅ **2 Pre-roll Ads:** Before main content with interactive elements
- ✅ **2 Mid-roll Ads:** At 30s and 90s with interactive features
- ✅ **1 Post-roll Ad:** After main content with subscription CTA
- ✅ **Interactive Elements:** Polls, quizzes, and CTAs in all ads
- ✅ **Skip Functionality:** Different skip timing for each ad

### **📊 Advanced Analytics:**
- ✅ **Settings Tracking:** Quality changes, subtitle toggles, speed adjustments
- ✅ **Ad Analytics:** Start, complete, skip, and interaction events
- ✅ **Playback Events:** Play, pause, seek tracking
- ✅ **Timestamped Logging:** All events logged with timestamps

### **🎨 Professional UI:**
- ✅ **Dark Theme:** Professional appearance
- ✅ **Settings Menu:** Gear icon with tabbed interface
- ✅ **Mobile Responsive:** Works on all devices
- ✅ **Smooth Animations:** Professional transitions and effects

## 🚀 **Installation & Usage**

```bash
# Install the package
npm install advanced-react-media-player

# Import and use
import { MediaPlayer } from 'advanced-react-media-player';
import 'advanced-react-media-player/dist/index.css';
```

## 📱 **Expected User Experience**

1. **Video loads** with autoplay (muted)
2. **Pre-roll ads play** (2 ads with interactive elements)
3. **Main video starts** with full settings available
4. **Mid-roll ads insert** at 30s and 90s
5. **Settings menu** always accessible via gear icon
6. **Post-roll ad plays** after main content
7. **Replay option** restarts entire sequence

## 🔧 **Console Output Example**

```
📊 [10:30:15] ad_start: {adId: "preroll-1", adType: "preroll"}
📊 [10:30:20] ad_interaction: {type: "poll", answer: "Entertainment"}
📊 [10:30:25] ad_skip: {adId: "preroll-1"}
📊 [10:30:26] play: {currentTime: 0}
📊 [10:30:35] settings_open: {}
🎥 Quality: 720p HD
📝 Subtitles: Español (España)
⚡ Speed: 1.25x
📊 [10:30:40] settings_close: {}
📊 [10:31:00] ad_start: {adId: "midroll-1", adType: "midroll"}
```

**This configuration gives you everything: complete ad sequences, comprehensive settings, and detailed analytics!** 🎉
