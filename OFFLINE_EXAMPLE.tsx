import React from "react";
import { MediaPlayer } from "advanced-react-media-player";
import "advanced-react-media-player/dist/index.css";

function OfflineExampleApp() {
  const offlineEnabledConfig = {
    src: {
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      type: "video" as const,
      mimeType: "video/mp4",
      qualities: [
        {
          id: "quality-1080p",
          label: "1080p Full HD",
          height: 1080,
          width: 1920,
          bitrate: 5000000,
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        },
        {
          id: "quality-720p",
          label: "720p HD",
          height: 720,
          width: 1280,
          bitrate: 2500000,
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        },
        {
          id: "quality-480p",
          label: "480p SD",
          height: 480,
          width: 854,
          bitrate: 1000000,
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        },
      ],
      subtitles: [
        {
          id: "subtitle-en",
          label: "English",
          language: "en",
          url: "https://raw.githubusercontent.com/Polyflix/subtitles/master/Big_Buck_Bunny/Big_Buck_Bunny_en.vtt",
          isDefault: true,
        },
        {
          id: "subtitle-es",
          label: "Español",
          language: "es",
          url: "https://raw.githubusercontent.com/Polyflix/subtitles/master/Big_Buck_Bunny/Big_Buck_Bunny_es.vtt",
        },
      ],
      chapters: [
        { id: "intro", title: "Opening Scene", startTime: 0 },
        { id: "butterflies", title: "Butterflies Appear", startTime: 60 },
        { id: "squirrels", title: "Mischief by Squirrels", startTime: 120 },
        { id: "conflict", title: "The Conflict", startTime: 180 },
        { id: "revenge", title: "Bunny's Revenge", startTime: 240 },
        { id: "ending", title: "Ending Scene", startTime: 360 },
      ],
    },

    // 📥 OFFLINE SUPPORT CONFIGURATION
    offline: {
      downloadEnabled: true,          // Enable download functionality
      maxDownloads: 5,               // Maximum number of videos to store
      expiryDays: 30,               // Videos expire after 30 days
      maxFileSize: 500,             // Maximum file size in MB
      allowMeteredConnection: false, // Don't download on metered connections
      storageQuota: 2000,           // Maximum storage usage in MB
    },

    // 🎨 UI CONFIGURATION
    ui: {
      theme: "dark" as const,
      autoplay: true,
      muted: true,
      showControls: true,
      showSettings: true,
      showDownload: true,            // Show download button in controls
    },

    // 📊 ANALYTICS
    analytics: {
      enabled: true,
      onEvent: (event: any) => {
        console.log(`📊 ${event.type}:`, event.payload);
        
        // Log download-specific events
        if (event.type.startsWith('download_') || event.type.startsWith('offline_')) {
          console.log(`💾 Offline Event: ${event.type}`, event.payload);
        }
      },
    },

    // 🎬 ADS (Optional - works with offline too)
    ads: {
      preRoll: [
        {
          id: "preroll-1",
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
          duration: 15,
          skippable: true,
          skipAfter: 5,
        },
      ],
    },
  };

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#0a0a0a",
        minHeight: "100vh",
        color: "white",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          fontSize: "2.5rem",
          background: "linear-gradient(135deg, #4CAF50, #2196F3)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: "20px",
        }}
      >
        📥 Offline Video Player Demo
      </h1>

      <div
        style={{
          backgroundColor: "rgba(76, 175, 80, 0.1)",
          border: "1px solid rgba(76, 175, 80, 0.3)",
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "30px",
          textAlign: "center",
          maxWidth: "800px",
          margin: "0 auto 30px auto",
        }}
      >
        <h3 style={{ margin: "0 0 15px 0", color: "#4caf50" }}>
          🎯 Offline Features Demo
        </h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "center", fontSize: "14px" }}>
          <div>
            <strong>💾 Download:</strong><br />
            Click download button to save for offline
          </div>
          <div>
            <strong>🔄 Auto-Resume:</strong><br />
            Automatically loads offline version when available
          </div>
          <div>
            <strong>📊 Storage:</strong><br />
            Intelligent storage management with quotas
          </div>
          <div>
            <strong>⏰ Expiry:</strong><br />
            Videos expire after 30 days
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          border: "2px solid #333",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <MediaPlayer config={offlineEnabledConfig} />
      </div>

      <div style={{ textAlign: "center", marginTop: "30px", opacity: 0.8 }}>
        <h4 style={{ color: "#4caf50", marginBottom: "15px" }}>📋 How to Test Offline Functionality:</h4>
        <div style={{ textAlign: "left", maxWidth: "600px", margin: "0 auto", fontSize: "14px", lineHeight: "1.6" }}>
          <p><strong>1. Download Video:</strong> Click the download button (⬇️) in the player controls</p>
          <p><strong>2. Monitor Progress:</strong> Watch the download progress bar and storage usage</p>
          <p><strong>3. Test Offline:</strong> Refresh the page or disable network to see offline playback</p>
          <p><strong>4. Manage Storage:</strong> Use the delete button to remove downloaded videos</p>
          <p><strong>5. Check Analytics:</strong> Open console (F12) to see download events</p>
        </div>
      </div>

      <div style={{ 
        textAlign: "center", 
        marginTop: "20px", 
        padding: "15px", 
        backgroundColor: "rgba(33, 150, 243, 0.1)",
        border: "1px solid rgba(33, 150, 243, 0.3)",
        borderRadius: "8px",
        maxWidth: "600px",
        margin: "20px auto 0",
        fontSize: "13px"
      }}>
        <p style={{ margin: 0, color: "#2196F3" }}>
          💡 <strong>Pro Tip:</strong> Downloaded videos include subtitles and work completely offline. 
          The player automatically detects and loads offline versions when available.
        </p>
      </div>
    </div>
  );
}

export default OfflineExampleApp;
