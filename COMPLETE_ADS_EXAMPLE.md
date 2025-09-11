# 🎬 **Complete Ads Configuration Example**

## **🎯 2 Pre-roll + 2 Mid-roll + 1 Post-roll with Interactivity**

Copy this exact code into your `src/App.tsx`:

```tsx
import React from 'react';
import { MediaPlayer } from 'custom-media-player';
import 'custom-media-player/dist/index.css';

const App: React.FC = () => {
  const completeAdsConfig = {
    src: {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      type: 'video' as const,
      mimeType: 'video/mp4'
    },
    ads: {
      // 🎬 PRE-ROLL ADS (2 ads before main content)
      preRoll: [
        {
          id: 'preroll-1',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          duration: 20,
          skippable: true,
          skipAfter: 5,
          interactive: {
            type: 'poll' as const,
            data: {
              question: "🚀 What brings you here today?",
              options: ["Entertainment", "Learning", "Business"],
              duration: 10
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
              duration: 8
            }
          }
        }
      ],

      // 🎭 MID-ROLL ADS (2 ads during main content)
      midRoll: [
        {
          id: 'midroll-1',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
          duration: 18,
          skippable: true,
          skipAfter: 4,
          playAt: 30, // Play at 30 seconds into main video
          interactive: {
            type: 'quiz' as const,
            data: {
              question: "🧠 Quick Quiz: What's the capital of France?",
              options: ["London", "Berlin", "Paris", "Madrid"],
              correctAnswer: 2, // Paris (index 2)
              duration: 12
            }
          }
        },
        {
          id: 'midroll-2',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
          duration: 16,
          skippable: true,
          skipAfter: 3,
          playAt: 90, // Play at 90 seconds (1.5 minutes)
          interactive: {
            type: 'poll' as const,
            data: {
              question: "🎪 How's your viewing experience so far?",
              options: ["🔥 Amazing!", "👍 Pretty good", "😐 It's okay", "👎 Not great"],
              duration: 10
            }
          }
        }
      ],

      // 🏁 POST-ROLL AD (1 ad after main content)
      postRoll: [
        {
          id: 'postroll-1',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
          duration: 22,
          skippable: true,
          skipAfter: 5,
          interactive: {
            type: 'cta' as const,
            data: {
              text: "🌟 Thanks for watching! Subscribe for more content",
              url: "https://example.com/subscribe",
              buttonText: "Subscribe Now",
              duration: 15
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
        // Enhanced analytics logging
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] 📊 ${event.type}:`, event.payload);
        
        // Handle specific events
        switch (event.type) {
          case 'play':
            console.log('▶️ Video started playing');
            break;
          case 'pause':
            console.log('⏸️ Video paused');
            break;
          case 'ad_start':
            console.log(`📺 Ad started: ${event.payload.adId}`);
            break;
          case 'ad_complete':
            console.log(`✅ Ad completed: ${event.payload.adId}`);
            break;
          case 'ad_skip':
            console.log(`⏭️ Ad skipped: ${event.payload.adId}`);
            break;
          case 'ad_interaction':
            console.log(`🎯 User interacted: ${event.payload.type}`, event.payload.data);
            break;
          case 'seek':
            console.log(`⏯️ User seeked to: ${event.payload.currentTime}s`);
            break;
        }
      }
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#0a0a0a', 
      minHeight: '100vh',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ 
          fontSize: '2.5rem',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #ff6b6b, #4ecdc4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '10px'
        }}>
          🎬 Complete Ads Experience
        </h1>
        <p style={{ opacity: 0.8, fontSize: '1.1rem' }}>
          2 Pre-roll → Main Content → 2 Mid-roll → 1 Post-roll + Interactive Features
        </p>
      </header>

      {/* Ad Sequence Info */}
      <div style={{
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        border: '1px solid rgba(76, 175, 80, 0.3)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '30px',
        textAlign: 'center',
        maxWidth: '900px',
        margin: '0 auto 30px auto'
      }}>
        <h3 style={{ color: '#4caf50', marginBottom: '15px' }}>
          🎯 Complete Ad Experience
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          textAlign: 'left'
        }}>
          <div>
            <strong>🎬 Pre-roll Ads:</strong>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              <li>Poll: "What brings you here?"</li>
              <li>CTA: "Special Offer"</li>
            </ul>
          </div>
          <div>
            <strong>🎭 Mid-roll Ads:</strong>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              <li>Quiz at 30s: "Capital of France?"</li>
              <li>Poll at 90s: "Experience rating"</li>
            </ul>
          </div>
          <div>
            <strong>🏁 Post-roll Ad:</strong>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              <li>CTA: "Subscribe for more"</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Media Player */}
      <div style={{ 
        maxWidth: '1000px', 
        margin: '0 auto',
        border: '2px solid #333',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      }}>
        <MediaPlayer config={completeAdsConfig} />
      </div>

      {/* Instructions */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: '40px',
        opacity: 0.8,
        maxWidth: '800px',
        margin: '40px auto 0'
      }}>
        <h3 style={{ color: '#4ecdc4', marginBottom: '20px' }}>
          🎯 How to Test:
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          textAlign: 'left'
        }}>
          <div style={{ 
            backgroundColor: 'rgba(255, 193, 7, 0.1)',
            padding: '15px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 193, 7, 0.3)'
          }}>
            <strong>📺 Ad Experience:</strong>
            <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
              <li>Watch pre-roll ads with interactions</li>
              <li>Skip ads after countdown</li>
              <li>Mid-rolls appear at 30s & 90s</li>
              <li>Post-roll after main content</li>
            </ul>
          </div>
          <div style={{ 
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            padding: '15px',
            borderRadius: '8px',
            border: '1px solid rgba(33, 150, 243, 0.3)'
          }}>
            <strong>🎮 Interactions:</strong>
            <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
              <li>Vote in polls (bottom-left)</li>
              <li>Answer quiz questions</li>
              <li>Click CTA buttons</li>
              <li>Skip when available</li>
            </ul>
          </div>
          <div style={{ 
            backgroundColor: 'rgba(156, 39, 176, 0.1)',
            padding: '15px',
            borderRadius: '8px',
            border: '1px solid rgba(156, 39, 176, 0.3)'
          }}>
            <strong>📊 Analytics:</strong>
            <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
              <li>Open console (F12)</li>
              <li>Watch event logging</li>
              <li>See interaction data</li>
              <li>Track user behavior</li>
            </ul>
          </div>
        </div>
        
        <p style={{ 
          marginTop: '25px', 
          padding: '15px',
          backgroundColor: 'rgba(233, 30, 99, 0.1)',
          border: '1px solid rgba(233, 30, 99, 0.3)',
          borderRadius: '8px',
          fontSize: '1.1rem'
        }}>
          🔄 <strong>Pro Tip:</strong> After the complete sequence, use the replay button to start over and test different interactions!
        </p>
      </div>
    </div>
  );
};

export default App;
```

---

## **🎯 What This Configuration Includes:**

### **🎬 Pre-roll Ads (2):**
1. **Poll Ad** - "What brings you here?" (20s, skip after 5s)
2. **CTA Ad** - "Special Offer" button (15s, skip after 3s)

### **🎭 Mid-roll Ads (2):**
1. **Quiz Ad** - "Capital of France?" at 30 seconds (18s, skip after 4s)
2. **Poll Ad** - "Experience rating" at 90 seconds (16s, skip after 3s)

### **🏁 Post-roll Ad (1):**
1. **CTA Ad** - "Subscribe" button (22s, skip after 5s)

---

## **🎮 Interactive Features:**

- **📊 Polls** - Multiple choice questions with voting
- **🧠 Quizzes** - Questions with correct/incorrect answers
- **🎯 CTAs** - Clickable call-to-action buttons
- **⏭️ Skip Options** - All ads skippable after countdown
- **📈 Analytics** - Comprehensive event tracking

---

## **✅ Expected Experience:**

1. **Pre-roll 1** → Poll about user intent
2. **Pre-roll 2** → CTA for special offer
3. **Main video** starts playing
4. **Mid-roll 1** → Quiz at 30 seconds
5. **Continue main video**
6. **Mid-roll 2** → Poll at 90 seconds  
7. **Finish main video**
8. **Post-roll** → Subscribe CTA
9. **Replay option** to start over

**Copy this code and you'll have the complete ads experience with all interactive features!** 🎉
