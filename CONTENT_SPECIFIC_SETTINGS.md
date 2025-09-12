# 🎬 Content-Specific Settings Examples

The settings (qualities, subtitles, chapters) are now embedded within each video's `src` object, making them content-specific and optional.

## 🎯 **New Structure Overview**

```tsx
const config = {
  src: {
    url: 'video.mp4',
    type: 'video',
    mimeType: 'video/mp4',
    
    // ✨ Optional: Video-specific quality options
    qualities: [...],
    
    // ✨ Optional: Video-specific subtitle tracks  
    subtitles: [...],
    
    // ✨ Optional: Video chapters
    chapters: [...]
  },
  ui: {
    showSettings: true  // Settings button always available
  }
};
```

## 📺 **Complete Example: Movie with Multiple Qualities & Subtitles**

```tsx
import React from 'react';
import { MediaPlayer } from 'advanced-react-media-player';
import 'advanced-react-media-player/dist/index.css';

function MoviePlayer() {
  const movieConfig = {
    src: {
      url: 'https://example.com/movies/big-buck-bunny-1080p.mp4',
      type: 'video' as const,
      mimeType: 'video/mp4',
      
      // 🎥 Multiple quality options for this specific movie
      qualities: [
        {
          id: 'uhd-4k',
          label: '4K Ultra HD',
          height: 2160,
          width: 3840,
          bitrate: 15000000,
          url: 'https://example.com/movies/big-buck-bunny-4k.mp4'
        },
        {
          id: 'fhd-1080p',
          label: '1080p Full HD', 
          height: 1080,
          width: 1920,
          bitrate: 5000000,
          url: 'https://example.com/movies/big-buck-bunny-1080p.mp4'
        },
        {
          id: 'hd-720p',
          label: '720p HD',
          height: 720,
          width: 1280,
          bitrate: 2500000,
          url: 'https://example.com/movies/big-buck-bunny-720p.mp4'
        },
        {
          id: 'sd-480p',
          label: '480p SD',
          height: 480,
          width: 854,
          bitrate: 1000000,
          url: 'https://example.com/movies/big-buck-bunny-480p.mp4'
        }
      ],

      // 📝 Multiple subtitle tracks for this specific movie
      subtitles: [
        {
          id: 'en-us',
          label: 'English (US)',
          language: 'en-US',
          url: 'https://example.com/subtitles/big-buck-bunny/en-us.vtt',
          isDefault: true
        },
        {
          id: 'es-es',
          label: 'Español (España)',
          language: 'es-ES',
          url: 'https://example.com/subtitles/big-buck-bunny/es-es.vtt'
        },
        {
          id: 'fr-fr',
          label: 'Français',
          language: 'fr-FR',
          url: 'https://example.com/subtitles/big-buck-bunny/fr-fr.vtt'
        },
        {
          id: 'de-de',
          label: 'Deutsch',
          language: 'de-DE',
          url: 'https://example.com/subtitles/big-buck-bunny/de-de.vtt'
        },
        {
          id: 'pt-br',
          label: 'Português (Brasil)',
          language: 'pt-BR',
          url: 'https://example.com/subtitles/big-buck-bunny/pt-br.vtt'
        },
        {
          id: 'ja-jp',
          label: '日本語',
          language: 'ja-JP',
          url: 'https://example.com/subtitles/big-buck-bunny/ja-jp.vtt'
        }
      ],

      // 📚 Chapter markers for easy navigation
      chapters: [
        {
          id: 'opening',
          title: 'Opening Credits',
          startTime: 0
        },
        {
          id: 'intro',
          title: 'Character Introduction',
          startTime: 45
        },
        {
          id: 'forest-scene',
          title: 'Forest Adventure',
          startTime: 120
        },
        {
          id: 'conflict',
          title: 'The Conflict',
          startTime: 300
        },
        {
          id: 'resolution',
          title: 'Resolution',
          startTime: 480
        },
        {
          id: 'credits',
          title: 'End Credits',
          startTime: 580
        }
      ]
    },

    ui: {
      theme: 'dark',
      showControls: true,
      showSettings: true  // Settings button always visible
    },

    analytics: {
      enabled: true,
      onEvent: (event) => {
        console.log(`🎬 Movie Event:`, event);
      }
    }
  };

  return (
    <div>
      <h2>🎬 Big Buck Bunny - Full Movie</h2>
      <MediaPlayer config={movieConfig} />
    </div>
  );
}

export default MoviePlayer;
```

## 📚 **Example: Educational Video with Different Content**

```tsx
function EducationalVideo() {
  const tutorialConfig = {
    src: {
      url: 'https://example.com/tutorials/react-basics.mp4',
      type: 'video' as const,
      mimeType: 'video/mp4',
      
      // 🎓 Different qualities for tutorial content
      qualities: [
        {
          id: 'tutorial-hd',
          label: '1080p (Recommended)',
          height: 1080,
          width: 1920,
          bitrate: 3000000,
          url: 'https://example.com/tutorials/react-basics-1080p.mp4'
        },
        {
          id: 'tutorial-mobile',
          label: '720p (Mobile)',
          height: 720,
          width: 1280,
          bitrate: 1500000,
          url: 'https://example.com/tutorials/react-basics-720p.mp4'
        }
      ],

      // 📝 Educational subtitles
      subtitles: [
        {
          id: 'tutorial-en',
          label: 'English',
          language: 'en',
          url: 'https://example.com/subtitles/react-basics-en.vtt',
          isDefault: true
        },
        {
          id: 'tutorial-es',
          label: 'Spanish',
          language: 'es',
          url: 'https://example.com/subtitles/react-basics-es.vtt'
        }
      ],

      // 📚 Tutorial chapters
      chapters: [
        {
          id: 'intro',
          title: 'Introduction to React',
          startTime: 0
        },
        {
          id: 'components',
          title: 'Creating Components',
          startTime: 180
        },
        {
          id: 'props',
          title: 'Understanding Props',
          startTime: 420
        },
        {
          id: 'state',
          title: 'Managing State',
          startTime: 720
        },
        {
          id: 'events',
          title: 'Handling Events',
          startTime: 960
        }
      ]
    },

    settings: {
      playbackSpeed: 0.75  // Slower speed for learning
    },

    ui: {
      showSettings: true
    }
  };

  return <MediaPlayer config={tutorialConfig} />;
}
```

## 🎵 **Example: Music Video (Audio-only or Minimal Settings)**

```tsx
function MusicPlayer() {
  const musicConfig = {
    src: {
      url: 'https://example.com/music/song.mp3',
      type: 'audio' as const,
      mimeType: 'audio/mpeg'
      
      // ✨ No qualities or subtitles - settings button still available
      // Only playback speed will be available in settings
    },

    settings: {
      playbackSpeed: 1,
      loop: true  // Music often loops
    },

    ui: {
      showSettings: true  // Settings button available even with minimal options
    }
  };

  return <MediaPlayer config={musicConfig} />;
}
```

## 🎮 **Example: Multiple Videos with Different Settings**

```tsx
function VideoLibrary() {
  const [currentVideo, setCurrentVideo] = useState('movie');

  const videoConfigs = {
    movie: {
      src: {
        url: 'https://example.com/movie.mp4',
        type: 'video' as const,
        mimeType: 'video/mp4',
        qualities: [
          // Movie qualities...
        ],
        subtitles: [
          // Movie subtitles...
        ]
      }
    },

    documentary: {
      src: {
        url: 'https://example.com/documentary.mp4', 
        type: 'video' as const,
        mimeType: 'video/mp4',
        qualities: [
          // Different documentary qualities...
        ],
        subtitles: [
          // Different documentary subtitles...
        ]
      }
    },

    tutorial: {
      src: {
        url: 'https://example.com/tutorial.mp4',
        type: 'video' as const,
        mimeType: 'video/mp4',
        // No qualities or subtitles - settings still available
      }
    }
  };

  return (
    <div>
      <div>
        <button onClick={() => setCurrentVideo('movie')}>Movie</button>
        <button onClick={() => setCurrentVideo('documentary')}>Documentary</button>
        <button onClick={() => setCurrentVideo('tutorial')}>Tutorial</button>
      </div>
      
      <MediaPlayer 
        key={currentVideo} // Force re-render with new settings
        config={{
          ...videoConfigs[currentVideo],
          ui: { showSettings: true }
        }} 
      />
    </div>
  );
}
```

## 🎯 **Settings Behavior:**

### **Settings Button Always Available:**
- ✅ Settings ⚙️ button shows in controls regardless of content
- ✅ Speed control always available (0.25x - 2x)
- ✅ Quality tab appears only if `src.qualities` exists
- ✅ Subtitles tab appears only if `src.subtitles` exists
- ✅ Chapters tab appears only if `src.chapters` exists

### **Dynamic Settings Menu:**
```
If video has qualities + subtitles + chapters:
┌─ Quality ─┬─ Subtitles ─┬─ Speed ─┬─ Chapters ─┐

If video has only subtitles:
┌─ Subtitles ─┬─ Speed ─┐

If video has no extra settings:
┌─ Speed ─┐
```

## 🔧 **Real-World Integration:**

```tsx
// Content Management System integration
const videoFromCMS = {
  src: {
    url: video.primaryUrl,
    type: 'video',
    mimeType: video.mimeType,
    
    // Dynamic qualities from CMS
    qualities: video.encodings?.map(encoding => ({
      id: encoding.id,
      label: encoding.label,
      height: encoding.height,
      width: encoding.width,
      bitrate: encoding.bitrate,
      url: encoding.url
    })),

    // Dynamic subtitles from CMS
    subtitles: video.captions?.map(caption => ({
      id: caption.id,
      label: caption.language_name,
      language: caption.language_code,
      url: caption.vtt_url,
      isDefault: caption.is_default
    })),

    // Dynamic chapters from CMS
    chapters: video.chapters?.map(chapter => ({
      id: chapter.id,
      title: chapter.title,
      startTime: chapter.start_time,
      endTime: chapter.end_time
    }))
  },

  ui: {
    showSettings: true
  }
};
```

## 📊 **Analytics with Content-Specific Data:**

```tsx
analytics: {
  enabled: true,
  onEvent: (event) => {
    // Analytics now include content-specific context
    const analyticsData = {
      ...event,
      video_id: video.id,
      video_title: video.title,
      content_type: video.type,
      available_qualities: video.src.qualities?.length || 0,
      available_subtitles: video.src.subtitles?.length || 0,
      has_chapters: !!video.src.chapters?.length
    };
    
    // Send to analytics service
    analytics.track('media_player_event', analyticsData);
  }
}
```

## ✨ **Key Benefits:**

1. **Content-Specific Settings** - Each video has its own qualities and subtitles
2. **Optional Settings** - Settings only appear if content provides them
3. **Always Available Controls** - Settings button and speed control always present
4. **Flexible Structure** - Works with any combination of settings
5. **CMS Integration** - Easy to integrate with content management systems
6. **Performance** - Only loads settings data for current video

**This approach makes the player much more practical for real-world use where different videos have different quality options and subtitle availability!** 🎯
