import "./App.css";
import { MediaPlayer } from "advanced-react-media-player";
import "advanced-react-media-player/dist/index.css";

function App() {
  const subtitleTestConfig = {
    src: {
      // Your custom video
      url: "https://avispets.s3.eu-west-3.amazonaws.com/MIB2.mp4",
      type: "video" as const,
      mimeType: "video/mp4",
      
      // Your custom subtitle
      subtitles: [
        {
          id: "subtitle-pt",
          label: "Português",
          language: "pt", 
          url: "https://avispets.s3.eu-west-3.amazonaws.com/MIB2-subtitles-pt-BR.vtt",
          isDefault: true,
        },
      ],

      // Test chapters
      chapters: [
        { id: "start", title: "🎬 Início", startTime: 0 },
        { id: "middle", title: "🎭 Meio", startTime: 30 },
        { id: "end", title: "🏁 Final", startTime: 60 },
      ],
    },

    // NO ADS for testing - just subtitles
    ads: {
      preRoll: [],
      midRoll: [],
      postRoll: [],
    },

    ui: {
      theme: "dark" as const,
      autoplay: true,
      muted: true,
      showControls: true,
      showSettings: true,
    },

    analytics: {
      enabled: true,
      onEvent: (event: any) => {
        console.log(`📊 ${event.type}:`, event.payload);
        
        // Focus on subtitle events
        if (event.type === 'subtitle_change') {
          console.log(`🎬 SUBTITLE CHANGE: ${event.payload.subtitle?.label || 'Off'}`);
        }
      },
    },
  };

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#0a0a0a",
        minHeight: "100vh",
        color: "white",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          fontSize: "2.5rem",
          background: "linear-gradient(135deg, #ff6b6b, #4ecdc4)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: "20px",
          fontWeight: "bold",
        }}
      >
        🎬 Subtitle Test - Your Custom Video
      </h1>

      <div
        style={{
          backgroundColor: "rgba(255, 107, 107, 0.1)",
          border: "1px solid rgba(255, 107, 107, 0.3)",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "30px",
          textAlign: "center",
          maxWidth: "800px",
          margin: "0 auto 30px auto",
        }}
      >
        <h2 style={{ color: "#ff6b6b", marginBottom: "15px" }}>🔬 Subtitle Testing</h2>
        <p style={{ margin: "10px 0", color: "#ff6b6b" }}>
          ✅ <strong>Video:</strong> Your MIB2.mp4 file
        </p>
        <p style={{ margin: "10px 0", color: "#ff6b6b" }}>
          📝 <strong>Subtitles:</strong> Your Portuguese WebVTT file
        </p>
        <p style={{ margin: "10px 0", color: "#ff6b6b" }}>
          🚫 <strong>No Ads:</strong> Pure subtitle testing
        </p>
        <p style={{ margin: "10px 0", color: "#ff6b6b" }}>
          📊 <strong>Console:</strong> Watch for subtitle setup logs
        </p>
      </div>

      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          border: "2px solid #ff6b6b",
          borderRadius: "15px",
          overflow: "hidden",
          boxShadow: "0 8px 25px rgba(255, 107, 107, 0.3)",
          backgroundColor: "#111",
        }}
      >
        <MediaPlayer config={subtitleTestConfig} />
      </div>

      <div
        style={{
          textAlign: "center",
          marginTop: "30px",
          opacity: 0.9,
          maxWidth: "600px",
          margin: "30px auto 0",
        }}
      >
        <h3 style={{ color: "#ff6b6b", marginBottom: "15px" }}>🧪 Testing Steps:</h3>
        <div style={{ textAlign: "left", color: "#ccc" }}>
          <p style={{ margin: "8px 0" }}>1. <strong>Play video</strong> → Portuguese subtitles should appear automatically</p>
          <p style={{ margin: "8px 0" }}>2. <strong>Open console (F12)</strong> → Look for subtitle setup logs</p>
          <p style={{ margin: "8px 0" }}>3. <strong>Settings gear</strong> → Go to Subtitles tab</p>
          <p style={{ margin: "8px 0" }}>4. <strong>Toggle subtitles</strong> → Turn Off/On to test switching</p>
          <p style={{ margin: "8px 0" }}>5. <strong>Look for text</strong> → White text with black background should appear</p>
        </div>
        <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "rgba(76, 175, 80, 0.1)", border: "1px solid rgba(76, 175, 80, 0.3)", borderRadius: "8px" }}>
          <p style={{ margin: 0, color: "#4caf50", fontSize: "0.9rem" }}>
            📝 <strong>Expected:</strong> Your Portuguese subtitles from the WebVTT file should display!
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
