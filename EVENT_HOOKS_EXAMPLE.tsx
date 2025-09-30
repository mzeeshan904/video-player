import React from 'react';
import { MediaPlayer, PlayerConfig, EventHooks } from 'advanced-react-media-player';

const EventHooksExample: React.FC = () => {
  // ✅ Define your custom event handlers
  const eventHooks: EventHooks = {
    // When skip button is clicked
    onSkip: (item: any) => {
      console.log("⏭ Skip clicked for:", item?.id || "unknown");
      // Example: send analytics
      // analyticsService.track("skip", { itemId: item.id });
    },

    // When any item (video or ad) completes
    onItemCompleted: (item: any) => {
      console.log("🏁 Item completed:", item?.id || "unknown");
      // Example: autoplay next
      // player.playNext();
    },

    // When an ad starts
    onAdStarted: (ad: any) => {
      console.log("📢 Ad started:", ad?.id);
      // Example: send impression event
      // adService.trackImpression(ad.id);
    },

    // When an ad finishes
    onAdCompleted: (ad: any) => {
      console.log("✅ Ad completed:", ad?.id);
      // Example: report completion to ad server
      // adService.trackCompletion(ad.id);
    },

    // When playback starts
    onPlayStarted: (src: any) => {
      console.log("▶️ Playback started:", src?.url);
      // Example: start session tracking
      // sessionService.startSession();
    },

    // When playback is paused
    onPause: (src: any) => {
      console.log("⏸ Paused at position:", src?.currentTime);
      // Example: pause session tracking
      // sessionService.pauseSession(src.currentTime);
    },

    // When error occurs
    onError: (error: any) => {
      console.error("❌ Player error:", error);
      // Example: error reporting
      // errorService.reportError(error);
    },

    // When quality changes
    onQualityChange: (oldQ: any, newQ: any) => {
      console.log("🎥 Quality changed:", oldQ?.label, "➡️", newQ?.label);
      // Example: track quality changes
      // analyticsService.trackQualityChange(oldQ, newQ);
    },

    // When subtitle changes
    onSubtitleChange: (subtitle: any) => {
      console.log("💬 Subtitle switched to:", subtitle?.label || "Off");
      // Example: accessibility tracking
      // accessibilityService.trackSubtitleChange(subtitle);
    },
  };

  const playerConfig: PlayerConfig = {
    src: {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      type: 'video',
      mimeType: 'video/mp4'
    },
    
    // Add some sample ads to test ad-related hooks
    ads: {
      preRoll: [
        {
          id: 'preroll-1',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          duration: 15,
          skippable: true,
          skipAfter: 5
        }
      ],
      postRoll: [
        {
          id: 'postroll-1',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
          duration: 10,
          skippable: false
        }
      ]
    },

    // Enhanced analytics (still works alongside event hooks)
    analytics: {
      enabled: true,
      enhancedAnalytics: true,
      userId: 'user123',
      onEvent: (event) => {
        console.log('📊 Enhanced Analytics:', event.type, event.payload);
      }
    },

    // ✅ NEW: Optional Dynamic Event Hooks
    events: eventHooks,

    ui: {
      theme: 'dark',
      autoplay: true,
      showControls: true,
      showSettings: true
    }
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      backgroundColor: '#1a1a1a',
      borderRadius: '8px' 
    }}>
      <h1 style={{ color: 'white', textAlign: 'center', marginBottom: '20px' }}>
        🎬 Event Hooks Example
      </h1>
      
      <div style={{ 
        marginBottom: '20px', 
        padding: '15px', 
        backgroundColor: '#2a2a2a', 
        borderRadius: '5px',
        color: 'white'
      }}>
        <h3>🎯 Event Hooks Enabled:</h3>
        <ul style={{ fontSize: '14px', lineHeight: '1.6' }}>
          <li>✅ onSkip - Skip button clicks</li>
          <li>✅ onItemCompleted - Video/ad completions</li>
          <li>✅ onAdStarted - Ad starts</li>
          <li>✅ onAdCompleted - Ad completions</li>
          <li>✅ onPlayStarted - Playback starts</li>
          <li>✅ onPause - Playback pauses</li>
          <li>✅ onError - Error handling</li>
          <li>✅ onQualityChange - Quality switches</li>
          <li>✅ onSubtitleChange - Subtitle changes</li>
        </ul>
        <p style={{ fontSize: '12px', opacity: 0.8, marginTop: '10px' }}>
          📋 Check browser console to see event hooks firing!
        </p>
      </div>

      <MediaPlayer config={playerConfig} />
      
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#2a2a2a', 
        borderRadius: '5px',
        color: 'white',
        fontSize: '12px'
      }}>
        <h4>🧪 Test Instructions:</h4>
        <ol>
          <li>Watch the pre-roll ad and try skipping it</li>
          <li>Play/pause the main video</li>
          <li>Change quality settings</li>
          <li>Toggle subtitles on/off</li>
          <li>Watch until the post-roll ad</li>
        </ol>
        <p style={{ marginTop: '10px', opacity: 0.8 }}>
          Each action will trigger corresponding event hooks in the console! 🎉
        </p>
      </div>
    </div>
  );
};

export default EventHooksExample;

// ✅ Usage Guide:
//
// 1. Install the package:
//    npm install /Users/apple/Desktop/localPlayer/custom-player/advanced-react-media-player-1.1.6.tgz
//
// 2. Import the types:
//    import { MediaPlayer, PlayerConfig, EventHooks } from 'advanced-react-media-player';
//
// 3. Define your event handlers:
//    const events: EventHooks = {
//      onSkip: (item) => { /* your logic */ },
//      onPlayStarted: (src) => { /* your logic */ },
//      // ... other hooks
//    };
//
// 4. Add to player config:
//    const config: PlayerConfig = {
//      // ... other config
//      events: events
//    };
//
// 5. Render the player:
//    <MediaPlayer config={config} />
//
// 🎯 All event hooks are optional and dynamically called when events occur!
