import { PlayerConfig } from '../types';
import { sampleVideos, interactiveAdConfigs } from './sampleVideos';

// Configuration 1: Full Featured Test with All Ad Types - AUTOPLAY ENABLED
export const fullFeaturedConfig: PlayerConfig = {
  src: {
    url: sampleVideos.mainContent[0].url, // Big Buck Bunny (596s)
    type: 'video',
    mimeType: 'video/mp4'
  },
  ads: {
    preRoll: [
      {
        id: 'preroll-car-quiz',
        url: sampleVideos.preRollAds[0].url, // Car Ad (15s)
        duration: 15,
        skippable: true,
        skipAfter: 3, // Skip after 3 seconds
        interactive: {
          type: 'quiz',
          data: {
            question: "What's your favorite car feature?",
            options: ["Safety", "Performance", "Style", "Technology"],
            correctAnswer: 0,
            duration: 10
          }
        }
      },
      {
        id: 'preroll-travel-poll',
        url: sampleVideos.preRollAds[1].url, // Travel Ad (15s)
        duration: 15,
        skippable: true,
        skipAfter: 3,
        interactive: {
          type: 'poll',
          data: {
            question: "Where would you like to travel next?",
            options: ["Beach", "Mountains", "City", "Countryside"],
            duration: 8
          }
        }
      }
    ],
    midRoll: [
      {
        id: 'midroll-early',
        url: sampleVideos.midRollAds[0].url, // Lifestyle Ad (15s)
        duration: 15,
        skippable: true,
        skipAfter: 3,
        playAt: 30, // 30 seconds - early for testing
        interactive: {
          type: 'poll',
          data: {
            question: "How do you like this player so far?",
            options: ["Excellent", "Good", "Average", "Poor"],
            duration: 8
          }
        }
      },
      {
        id: 'midroll-middle',
        url: sampleVideos.midRollAds[1].url, // Action Ad (15s)
        duration: 15,
        skippable: true,
        skipAfter: 3,
        playAt: 90, // 1.5 minutes in
        interactive: {
          type: 'cta',
          data: {
            text: "🎯 Special Mid-roll Offer!",
            url: "https://example.com/offer",
            buttonText: "Get Deal",
            duration: 8
          }
        }
      },
      {
        id: 'midroll-late',
        url: sampleVideos.midRollAds[2].url, // Car Commercial (15s)
        duration: 15,
        skippable: true,
        skipAfter: 3,
        playAt: 180, // 3 minutes in
        interactive: {
          type: 'overlay',
          data: {
            content: "🚗 New Model Available - Test Drive Today!",
            position: "bottom-right" as const,
            duration: 10
          }
        }
      }
    ],
    postRoll: [
      {
        id: 'postroll-satisfaction-poll',
        url: sampleVideos.postRollAds[0].url, // Car Ad (15s)
        duration: 15,
        skippable: true,
        skipAfter: 3,
        interactive: {
          type: 'poll',
          data: {
            question: "How did you like this video?",
            options: ["Loved it!", "It was good", "Okay", "Not great"],
            duration: 8
          }
        }
      },
      {
        id: 'postroll-cta-upgrade',
        url: sampleVideos.postRollAds[1].url, // Adventure Ad (15s)
        duration: 15,
        skippable: true,
        skipAfter: 3,
        interactive: {
          type: 'cta',
          data: {
            text: "Try our premium features!",
            url: "https://example.com/premium",
            buttonText: "Upgrade Now",
            duration: 8
          }
        }
      }
    ]
  },
  analytics: {
    enabled: true,
    onEvent: (event) => {
      console.log('🎬 Full Featured Player Event:', event);
      // Enhanced logging for demo
      console.log(`📊 [${new Date().toLocaleTimeString()}] ${event.type}:`, event.payload || 'No data');
    }
  },
  ui: {
    theme: 'dark',
    autoplay: true,  // ✅ AUTOPLAY ENABLED
    muted: true,     // Required for autoplay
    showControls: true
  }
};

// Configuration 2: Quick Test with Short Ads - AUTOPLAY ENABLED
export const quickTestConfig: PlayerConfig = {
  src: {
    url: sampleVideos.mainContent[1].url, // Elephant Dream (653s)
    type: 'video',
    mimeType: 'video/mp4'
  },
  ads: {
    preRoll: [
      {
        id: 'quick-preroll',
        url: sampleVideos.preRollAds[1].url, // Travel Ad (15s)
        duration: 15,
        skippable: true,
        skipAfter: 2, // Quick skip for testing
        interactive: {
          type: 'quiz',
          data: {
            question: "Quick test: What's 2+2?",
            options: ["3", "4", "5", "6"],
            correctAnswer: 1,
            duration: 8
          }
        }
      }
    ],
    midRoll: [
      {
        id: 'quick-midroll',
        url: sampleVideos.midRollAds[1].url, // Action Ad (15s)
        duration: 15,
        skippable: false,
        playAt: 30, // Early for quick testing
        interactive: {
          type: 'cta',
          data: {
            text: "Test CTA - Click to continue",
            url: "https://example.com/test",
            buttonText: "Click Me",
            duration: 6
          }
        }
      }
    ]
  },
  analytics: {
    enabled: true,
    onEvent: (event) => {
      console.log('⚡ Quick Test Event:', event);
      console.log(`🚀 [QUICK] ${event.type} at ${new Date().toLocaleTimeString()}`);
    }
  },
  ui: {
    theme: 'dark',
    autoplay: true,  // ✅ AUTOPLAY ENABLED
    muted: true
  }
};

// Configuration 3: Interactive Ads Showcase
export const interactiveAdsConfig: PlayerConfig = {
  src: {
    url: sampleVideos.mainContent[2].url, // Sintel
    type: 'video',
    mimeType: 'video/mp4'
  },
  ads: {
    preRoll: [
      {
        id: 'interactive-poll',
        url: sampleVideos.preRollAds[2].url, // Entertainment Ad
        duration: 60,
        skippable: true,
        skipAfter: 10,
        interactive: {
          type: 'poll',
          data: interactiveAdConfigs.poll.satisfaction
        }
      }
    ],
    midRoll: [
      {
        id: 'interactive-quiz',
        url: sampleVideos.midRollAds[1].url,
        duration: 15,
        skippable: false,
        playAt: 120,
        interactive: {
          type: 'quiz',
          data: interactiveAdConfigs.quiz.entertainment
        }
      },
      {
        id: 'interactive-overlay',
        url: sampleVideos.midRollAds[0].url,
        duration: 15,
        skippable: true,
        skipAfter: 7,
        playAt: 240,
        interactive: {
          type: 'overlay',
          data: interactiveAdConfigs.overlay.product
        }
      }
    ],
    postRoll: [
      {
        id: 'interactive-cta',
        url: sampleVideos.postRollAds[2].url, // Adventure Ad
        duration: 15,
        skippable: true,
        skipAfter: 5,
        interactive: {
          type: 'cta',
          data: interactiveAdConfigs.cta.technology
        }
      }
    ]
  },
  analytics: {
    enabled: true,
    onEvent: (event) => {
      console.log('🎯 Interactive Ads Event:', event);
      // Special logging for interactive events
      if (event.type === 'ad_interaction') {
        console.log('🎪 User Interaction:', event.payload);
      }
    }
  },
  ui: {
    theme: 'dark',
    autoplay: false,
    muted: true
  }
};

// Configuration 4: No Ads (Clean Playback)
export const noAdsConfig: PlayerConfig = {
  src: {
    url: sampleVideos.mainContent[0].url,
    type: 'video',
    mimeType: 'video/mp4'
  },
  analytics: {
    enabled: true,
    onEvent: (event) => console.log('🎥 Clean Playback Event:', event)
  },
  ui: {
    theme: 'light',
    autoplay: false,
    muted: false,
    showControls: true
  }
};

// Configuration 5: HLS Streaming Test
export const hlsStreamingConfig: PlayerConfig = {
  src: {
    url: sampleVideos.streaming.hls[0].url,
    type: 'video',
    mimeType: 'application/x-mpegURL'
  },
  ads: {
    preRoll: [
      {
        id: 'hls-preroll',
        url: sampleVideos.preRollAds[0].url,
        duration: 15,
        skippable: true,
        skipAfter: 5,
        interactive: {
          type: 'quiz',
          data: {
            question: "What is HLS?",
            options: ["HTTP Live Streaming", "High Level Security", "Home Link System", "Heavy Load Support"],
            correctAnswer: 0,
            duration: 12
          }
        }
      }
    ]
  },
  analytics: {
    enabled: true,
    onEvent: (event) => console.log('🌐 HLS Streaming Event:', event)
  },
  ui: {
    theme: 'dark',
    autoplay: false,
    muted: true
  }
};

// Configuration 6: DASH Streaming Test
export const dashStreamingConfig: PlayerConfig = {
  src: {
    url: sampleVideos.streaming.dash[0].url,
    type: 'video',
    mimeType: 'application/dash+xml'
  },
  ads: {
    preRoll: [
      {
        id: 'dash-preroll',
        url: sampleVideos.preRollAds[1].url,
        duration: 15,
        skippable: true,
        skipAfter: 4,
        interactive: {
          type: 'cta',
          data: {
            text: "Experience DASH streaming technology!",
            url: "https://example.com/dash-info",
            buttonText: "Learn More",
            duration: 8
          }
        }
      }
    ]
  },
  analytics: {
    enabled: true,
    onEvent: (event) => console.log('📡 DASH Streaming Event:', event)
  },
  ui: {
    theme: 'dark',
    autoplay: false,
    muted: true
  }
};

// Configuration 7: Automotive Theme
export const automotiveConfig: PlayerConfig = {
  src: {
    url: sampleVideos.mainContent[0].url,
    type: 'video',
    mimeType: 'video/mp4'
  },
  ads: {
    preRoll: [
      {
        id: 'auto-preroll',
        url: sampleVideos.preRollAds[0].url, // Car ad
        duration: 15,
        skippable: true,
        skipAfter: 5,
        interactive: {
          type: 'quiz',
          data: interactiveAdConfigs.quiz.automotive
        }
      }
    ],
    midRoll: [
      {
        id: 'auto-midroll',
        url: sampleVideos.midRollAds[2].url, // Subaru commercial
        duration: 15,
        skippable: true,
        skipAfter: 6,
        playAt: 150,
        interactive: {
          type: 'overlay',
          data: interactiveAdConfigs.overlay.product
        }
      }
    ],
    postRoll: [
      {
        id: 'auto-postroll',
        url: sampleVideos.postRollAds[1].url, // Volkswagen ad
        duration: 15,
        skippable: true,
        skipAfter: 4,
        interactive: {
          type: 'cta',
          data: interactiveAdConfigs.cta.automotive
        }
      }
    ]
  },
  analytics: {
    enabled: true,
    onEvent: (event) => console.log('🚗 Automotive Event:', event)
  },
  ui: {
    theme: 'dark',
    autoplay: false,
    muted: true
  }
};

// Configuration 8: Instant Demo - FASTEST TESTING
export const instantDemoConfig: PlayerConfig = {
  src: {
    url: sampleVideos.mainContent[0].url, // Big Buck Bunny
    type: 'video',
    mimeType: 'video/mp4'
  },
  ads: {
    preRoll: [
      {
        id: 'instant-preroll-1',
        url: sampleVideos.preRollAds[0].url, // Car Ad (15s)
        duration: 15,
        skippable: true,
        skipAfter: 2, // Skip after 2 seconds
        interactive: {
          type: 'poll',
          data: {
            question: "🎬 First Pre-roll Demo! How excited are you?",
            options: ["Very!", "Somewhat", "Not really"],
            duration: 6
          }
        }
      },
      {
        id: 'instant-preroll-2',
        url: sampleVideos.preRollAds[1].url, // Travel Ad (15s)
        duration: 15,
        skippable: true,
        skipAfter: 1, // Very quick skip
        interactive: {
          type: 'cta',
          data: {
            text: "🎯 Second Pre-roll Demo!",
            url: "https://example.com/demo",
            buttonText: "Learn More",
            duration: 4
          }
        }
      }
    ],
    midRoll: [
      {
        id: 'instant-midroll-1',
        url: sampleVideos.midRollAds[0].url, // Lifestyle Ad (15s)
        duration: 15,
        skippable: true,
        skipAfter: 1,
        playAt: 20, // 20 seconds in for quick demo
        interactive: {
          type: 'cta',
          data: {
            text: "🚀 First Mid-roll Demo!",
            url: "https://github.com",
            buttonText: "Visit GitHub",
            duration: 4
          }
        }
      },
      {
        id: 'instant-midroll-2',
        url: sampleVideos.midRollAds[1].url, // Action Ad (15s)
        duration: 15,
        skippable: true,
        skipAfter: 1,
        playAt: 60, // 1 minute in
        interactive: {
          type: 'poll',
          data: {
            question: "Testing seek functionality?",
            options: ["Yes, it works!", "Still testing", "Having issues"],
            duration: 4
          }
        }
      }
    ],
    postRoll: [
      {
        id: 'instant-postroll',
        url: sampleVideos.postRollAds[0].url, // Car Ad (15s)
        duration: 15,
        skippable: true,
        skipAfter: 1,
        interactive: {
          type: 'poll',
          data: {
            question: "Rate this demo experience!",
            options: ["🔥 Amazing!", "👍 Good", "😐 Okay"],
            duration: 5
          }
        }
      }
    ]
  },
  analytics: {
    enabled: true,
    onEvent: (event) => {
      console.log('🚀 INSTANT DEMO:', event);
      // Big visual indicator in console
      console.log(`%c🎯 ${event.type.toUpperCase()} EVENT FIRED!`, 'color: #ff6b6b; font-size: 14px; font-weight: bold;');
    }
  },
  ui: {
    theme: 'dark',
    autoplay: true,  // ✅ AUTOPLAY ENABLED
    muted: true,
    showControls: true
  }
};

// Export all configurations
export const testConfigurations = {
  '🚀 Instant Demo (AUTOPLAY)': instantDemoConfig,
  '🎬 Full Featured Test': fullFeaturedConfig,
  '⚡ Quick Test': quickTestConfig,
  'Interactive Ads Showcase': interactiveAdsConfig,
  'No Ads (Clean)': noAdsConfig,
  'HLS Streaming': hlsStreamingConfig,
  'DASH Streaming': dashStreamingConfig,
  'Automotive Theme': automotiveConfig,
};
