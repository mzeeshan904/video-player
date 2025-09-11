# 🎬 **Custom Media Player - Usage Examples**

## **🚀 Quick Start Example**

Replace your `src/App.tsx` with this working example:

```tsx
import React from 'react';
import { MediaPlayer, type PlayerConfig, type AnalyticsEvent } from 'custom-media-player';
import 'custom-media-player/dist/index.css';

const App: React.FC = () => {
  // Basic configuration
  const config: PlayerConfig = {
    src: {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      type: 'video',
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
            type: 'poll',
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
      theme: 'dark',
      autoplay: true,
      muted: true
    },
    analytics: {
      enabled: true,
      onEvent: (event: AnalyticsEvent) => {
        console.log('Player Event:', event.type, event);
      }
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#000', minHeight: '100vh' }}>
      <h1 style={{ color: 'white', textAlign: 'center', marginBottom: '30px' }}>
        My Custom Media Player
      </h1>
      
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
    </div>
  );
};

export default App;
```

---

## **🎯 Advanced Example with All Features**

```tsx
import React from 'react';
import { MediaPlayer, type PlayerConfig, type AnalyticsEvent } from 'custom-media-player';
import 'custom-media-player/dist/index.css';

const AdvancedApp: React.FC = () => {
  const advancedConfig: PlayerConfig = {
    src: {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      type: 'video',
      mimeType: 'video/mp4'
    },
    ads: {
      // Pre-roll ads (play before main content)
      preRoll: [
        {
          id: 'preroll-1',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          duration: 15,
          skippable: true,
          skipAfter: 3,
          interactive: {
            type: 'poll',
            data: {
              question: "What interests you most?",
              options: ["Technology", "Entertainment", "Sports"],
              duration: 10
            }
          }
        },
        {
          id: 'preroll-2',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
          duration: 20,
          skippable: true,
          skipAfter: 5,
          interactive: {
            type: 'cta',
            data: {
              text: "Learn More About Our Service",
              url: "https://example.com",
              buttonText: "Click Here",
              duration: 8
            }
          }
        }
      ],
      
      // Mid-roll ads (play during main content)
      midRoll: [
        {
          id: 'midroll-1',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
          duration: 15,
          skippable: true,
          skipAfter: 3,
          playAt: 30, // Play at 30 seconds
          interactive: {
            type: 'quiz',
            data: {
              question: "What's 2+2?",
              options: ["3", "4", "5"],
              correctAnswer: 1,
              duration: 10
            }
          }
        }
      ],
      
      // Post-roll ads (play after main content)
      postRoll: [
        {
          id: 'postroll-1',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
          duration: 10,
          skippable: true,
          skipAfter: 2,
          interactive: {
            type: 'poll',
            data: {
              question: "Rate this experience",
              options: ["Excellent", "Good", "Average"],
              duration: 6
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
      onEvent: (event: AnalyticsEvent) => {
        // Handle analytics events
        switch (event.type) {
          case 'play':
            console.log('▶️ Video started playing');
            break;
          case 'pause':
            console.log('⏸️ Video paused');
            break;
          case 'ad_start':
            console.log('📺 Ad started:', event.payload);
            break;
          case 'ad_complete':
            console.log('✅ Ad completed:', event.payload);
            break;
          case 'ad_interaction':
            console.log('🎯 User interacted with ad:', event.payload);
            break;
          default:
            console.log('📊 Analytics event:', event.type, event.payload);
        }
      }
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#0a0a0a', 
      minHeight: '100vh',
      color: 'white'
    }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ 
          fontSize: '2.5rem',
          background: 'linear-gradient(135deg, #ff6b6b, #4ecdc4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Advanced Media Player Demo
        </h1>
        <p style={{ opacity: 0.8 }}>
          Complete ad experience with analytics
        </p>
      </header>

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
          🎬 <strong>Full Experience:</strong> Pre-roll → Content → Mid-roll → Post-roll → Replay!
        </p>
      </div>
      
      <div style={{ 
        maxWidth: '900px', 
        margin: '0 auto',
        border: '2px solid #333',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      }}>
        <MediaPlayer config={advancedConfig} />
      </div>

      <div style={{ 
        textAlign: 'center', 
        marginTop: '30px',
        opacity: 0.7,
        maxWidth: '600px',
        margin: '30px auto 0'
      }}>
        <h3 style={{ color: '#4ecdc4' }}>Features Being Tested:</h3>
        <ul style={{ 
          listStyle: 'none', 
          padding: 0,
          textAlign: 'left',
          display: 'inline-block'
        }}>
          <li>✅ Multiple pre-roll ads</li>
          <li>✅ Interactive polls and CTAs</li>
          <li>✅ Mid-roll ads during playback</li>
          <li>✅ Post-roll ads after content</li>
          <li>✅ Skip functionality</li>
          <li>✅ Comprehensive analytics</li>
          <li>✅ Replay functionality</li>
        </ul>
      </div>
    </div>
  );
};

export default AdvancedApp;
```

---

## **📱 Simple Example (Minimal Setup)**

```tsx
import React from 'react';
import { MediaPlayer } from 'custom-media-player';
import 'custom-media-player/dist/index.css';

const SimpleApp: React.FC = () => {
  const simpleConfig = {
    src: {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      type: 'video' as const,
      mimeType: 'video/mp4'
    },
    ui: {
      theme: 'dark' as const,
      autoplay: false,
      muted: false
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Simple Video Player</h1>
      <MediaPlayer config={simpleConfig} />
    </div>
  );
};

export default SimpleApp;
```

---

## **🎯 What You'll See:**

### **First Example (Basic):**
1. Dark-themed video player
2. Pre-roll ad with poll
3. Skip button after 3 seconds
4. Main video after ad
5. Analytics in console

### **Second Example (Advanced):**
1. Multiple pre-roll ads
2. Interactive polls and CTAs
3. Mid-roll ad at 30 seconds
4. Post-roll ad after main content
5. Complete replay functionality
6. Comprehensive analytics

### **Third Example (Simple):**
1. Just a basic video player
2. No ads, minimal setup
3. Dark theme, manual controls

---

## **🚀 Next Steps:**

1. **Copy any example above** into your `src/App.tsx`
2. **Start your app:** `npm start`
3. **Visit:** http://localhost:3000
4. **Test all features:** ads, controls, interactions

**Your custom media player is now ready to use!** 🎉
