// Sample video URLs for testing - using verified working sources
export const sampleVideos = {
  // Main content videos - verified working URLs
  mainContent: [
    {
      title: "Big Buck Bunny",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      duration: 596,
      thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg"
    },
    {
      title: "Elephant Dream",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      duration: 653,
      thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg"
    },
    {
      title: "Sintel",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
      duration: 888,
      thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg"
    }
  ],

  // Pre-roll ad videos - Google's reliable ad content
  preRollAds: [
    {
      title: "For Bigger Blazes - Car Ad",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      duration: 15,
      thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg"
    },
    {
      title: "For Bigger Escape - Travel Ad",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      duration: 15,
      thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg"
    },
    {
      title: "For Bigger Fun - Entertainment Ad",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      duration: 60,
      thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFun.jpg"
    }
  ],

  // Mid-roll ad videos - Google's reliable content
  midRollAds: [
    {
      title: "For Bigger Joy - Lifestyle Ad",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      duration: 15,
      thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerJoyrides.jpg"
    },
    {
      title: "For Bigger Meltdowns - Action Ad",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
      duration: 15,
      thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerMeltdowns.jpg"
    },
    {
      title: "Subaru Outback - Car Commercial",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
      duration: 15,
      thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/SubaruOutbackOnStreetAndDirt.jpg"
    }
  ],

  // Post-roll ad videos - Google's reliable content
  postRollAds: [
    {
      title: "Volkswagen GTI - Car Ad",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
      duration: 15,
      thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/VolkswagenGTIReview.jpg"
    },
    {
      title: "We Are Going On Bullrun - Adventure Ad",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
      duration: 15,
      thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/WeAreGoingOnBullrun.jpg"
    },
    {
      title: "For Bigger Blazes - Car Ad",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      duration: 15,
      thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg"
    }
  ],

  // Streaming content (HLS/DASH)
  streaming: {
    hls: [
      {
        title: "Apple Test Stream (HLS)",
        url: "https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8",
        type: "application/x-mpegURL"
      },
      {
        title: "Apple Advanced Stream (HLS)",
        url: "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8",
        type: "application/x-mpegURL"
      }
    ],
    dash: [
      {
        title: "Big Buck Bunny (DASH)",
        url: "https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd",
        type: "application/dash+xml"
      },
      {
        title: "Tears of Steel (DASH)",
        url: "https://dash.akamaized.net/dash264/TestCases/2c/qualcomm/1/MultiResMPEG2.mpd",
        type: "application/dash+xml"
      }
    ]
  },

  // Audio content
  audio: [
    {
      title: "Sample Audio Track",
      url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
      duration: 3
    }
  ]
};

// Interactive ad configurations
export const interactiveAdConfigs = {
  quiz: {
    automotive: {
      question: "Which feature is most important in a car?",
      options: ["Safety", "Performance", "Fuel Efficiency", "Technology"],
      correctAnswer: 0,
      duration: 15
    },
    travel: {
      question: "What's your dream vacation destination?",
      options: ["Beach Resort", "Mountain Adventure", "City Exploration", "Cultural Tour"],
      correctAnswer: -1, // No correct answer for preference
      duration: 12
    },
    entertainment: {
      question: "How do you prefer to watch movies?",
      options: ["Theater Experience", "Home Streaming", "Mobile Device", "Outdoor Cinema"],
      correctAnswer: -1,
      duration: 10
    }
  },
  
  poll: {
    satisfaction: {
      question: "How would you rate this video?",
      options: ["Excellent", "Good", "Average", "Poor"],
      duration: 8
    },
    preference: {
      question: "What type of content do you enjoy most?",
      options: ["Action", "Comedy", "Documentary", "Drama"],
      duration: 10
    }
  },
  
  cta: {
    automotive: {
      text: "Discover the all-new features that make driving safer and more enjoyable!",
      url: "https://example.com/car-features",
      buttonText: "Learn More",
      duration: 8
    },
    travel: {
      text: "Book your dream vacation today and save up to 30%!",
      url: "https://example.com/travel-deals",
      buttonText: "Book Now",
      duration: 10
    },
    technology: {
      text: "Get the latest tech gadgets with free shipping!",
      url: "https://example.com/tech-store",
      buttonText: "Shop Now",
      duration: 12
    }
  },
  
  overlay: {
    product: {
      content: "🚗 New Model Available - Starting at $25,999",
      position: "bottom-right" as const,
      duration: 8
    },
    discount: {
      content: "🎯 Limited Time: 20% OFF All Products!",
      position: "top-right" as const,
      duration: 10
    }
  }
};
