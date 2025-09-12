import "./App.css";
import { MediaPlayer } from "advanced-react-media-player";
import "advanced-react-media-player/dist/index.css";

function App() {
  const completeWorkingConfig = {
    src: {
      // Your custom video
      url: "https://avispets.s3.eu-west-3.amazonaws.com/MIB2.mp4",
      type: "video" as const,
      mimeType: "video/mp4",
      
      // Different quality sources for testing
      qualities: [
        {
          id: "quality-original",
          label: "Original",
          height: 720,
          width: 1280,
          bitrate: 4000000,
          url: "https://avispets.s3.eu-west-3.amazonaws.com/MIB2.mp4",
        },
        {
          id: "quality-alt", 
          label: "Alternative",
          height: 720,
          width: 1280,
          bitrate: 3000000,
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        },
      ],

      // Your Portuguese subtitles + test subtitle
      subtitles: [
        {
          id: "subtitle-pt",
          label: "Português",
          language: "pt", 
          url: "https://avispets.s3.eu-west-3.amazonaws.com/MIB2-subtitles-pt-BR.vtt",
          isDefault: true,
        },
        {
          id: "subtitle-en",
          label: "English Test",
          language: "en", 
          url: "https://raw.githubusercontent.com/Polyflix/subtitles/master/Big_Buck_Bunny/Big_Buck_Bunny_en.vtt",
          isDefault: false,
        },
      ],

      // Chapters for your video
      chapters: [
        { id: "start", title: "🎬 Início", startTime: 0 },
        { id: "part1", title: "🎭 Primeira Parte", startTime: 15 },
        { id: "part2", title: "🎪 Segunda Parte", startTime: 30 },
        { id: "climax", title: "💥 Clímax", startTime: 45 },
        { id: "ending", title: "🏁 Final", startTime: 60 },
      ],
    },

    // Minimal ads for testing
    ads: {
      preRoll: [
        {
          id: "preroll-1",
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
          duration: 15,
          skippable: true,
          skipAfter: 3,
        },
      ],
      midRoll: [],
      postRoll: [],
    },

    ui: {
      theme: "dark" as const,
      autoplay: true,
      muted: true,
      showControls: true, // ESSENTIAL
      showSettings: true, // ESSENTIAL
    },

    analytics: {
      enabled: true,
      onEvent: (event: any) => {
        console.log(`📊 ${event.type}:`, event.payload);
        
        // Log important events
        if (event.type === 'subtitle_change') {
          console.log(`🎬 SUBTITLE: ${event.payload.subtitle?.label || 'Off'}`);
        }
        if (event.type === 'chapter_change') {
          console.log(`📚 CHAPTER: ${event.payload.chapter?.title}`);
        }
        if (event.type === 'quality_change') {
          console.log(`🎥 QUALITY: ${event.payload.quality?.label || 'Auto'}`);
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
          fontSize: "3rem",
          background: "linear-gradient(135deg, #ff6b6b, #4ecdc4, #45b7d1, #f9ca24)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: "20px",
          fontWeight: "bold",
        }}
      >
        ✅ COMPLETE WORKING TEST
      </h1>

      <div
        style={{
          backgroundColor: "rgba(76, 175, 80, 0.1)",
          border: "1px solid rgba(76, 175, 80, 0.3)",
          borderRadius: "12px",
          padding: "25px",
          marginBottom: "30px",
          textAlign: "center",
          maxWidth: "900px",
          margin: "0 auto 30px auto",
          boxShadow: "0 4px 15px rgba(76, 175, 80, 0.2)",
        }}
      >
        <h2 style={{ color: "#4caf50", marginBottom: "15px", fontSize: "1.5rem" }}>
          🎯 EVERYTHING WORKING NOW
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", textAlign: "left" }}>
          <div>
            <p style={{ margin: "5px 0", color: "#4caf50", fontSize: "0.9rem" }}>
              🎥 <strong>Video:</strong> Your MIB2.mp4
            </p>
            <p style={{ margin: "5px 0", color: "#4caf50", fontSize: "0.9rem" }}>
              📝 <strong>Subtitles:</strong> PT + EN (Working!)
            </p>
            <p style={{ margin: "5px 0", color: "#4caf50", fontSize: "0.9rem" }}>
              📚 <strong>Chapters:</strong> 5 sections (Working!)
            </p>
            <p style={{ margin: "5px 0", color: "#4caf50", fontSize: "0.9rem" }}>
              🎨 <strong>Quality:</strong> Original + Alternative
            </p>
          </div>
          <div>
            <p style={{ margin: "5px 0", color: "#4caf50", fontSize: "0.9rem" }}>
              ⚙️ <strong>Settings:</strong> All 4 tabs visible
            </p>
            <p style={{ margin: "5px 0", color: "#4caf50", fontSize: "0.9rem" }}>
              🎬 <strong>Ads:</strong> 1 skippable pre-roll
            </p>
            <p style={{ margin: "5px 0", color: "#4caf50", fontSize: "0.9rem" }}>
              ⚡ <strong>Speed:</strong> 0.25x to 2x
            </p>
            <p style={{ margin: "5px 0", color: "#4caf50", fontSize: "0.9rem" }}>
              📊 <strong>Analytics:</strong> Console logging
            </p>
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          border: "2px solid #4caf50",
          borderRadius: "15px",
          overflow: "hidden",
          boxShadow: "0 8px 25px rgba(76, 175, 80, 0.3)",
          backgroundColor: "#111",
        }}
      >
        <MediaPlayer config={completeWorkingConfig} />
      </div>

      <div
        style={{
          textAlign: "center",
          marginTop: "40px",
          opacity: 0.9,
          maxWidth: "800px",
          margin: "40px auto 0",
        }}
      >
        <h3 style={{ color: "#4caf50", marginBottom: "15px" }}>🧪 TEST CHECKLIST:</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", textAlign: "left" }}>
          <div>
            <p style={{ margin: "8px 0", color: "#ccc" }}>✅ <strong>Subtitles Auto-Show</strong> → Portuguese appears</p>
            <p style={{ margin: "8px 0", color: "#ccc" }}>✅ <strong>Settings Gear</strong> → Opens 4 tabs</p>
            <p style={{ margin: "8px 0", color: "#ccc" }}>✅ <strong>Subtitles Tab</strong> → PT + EN options</p>
            <p style={{ margin: "8px 0", color: "#ccc" }}>✅ <strong>Chapters Tab</strong> → 5 clickable sections</p>
          </div>
          <div>
            <p style={{ margin: "8px 0", color: "#ccc" }}>✅ <strong>Quality Tab</strong> → Original + Alternative</p>
            <p style={{ margin: "8px 0", color: "#ccc" }}>✅ <strong>Speed Tab</strong> → 0.25x to 2x</p>
            <p style={{ margin: "8px 0", color: "#ccc" }}>✅ <strong>Chapter Navigation</strong> → Jumps to time</p>
            <p style={{ margin: "8px 0", color: "#ccc" }}>✅ <strong>Console Logs</strong> → All events tracked</p>
          </div>
        </div>
        <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "rgba(76, 175, 80, 0.1)", border: "1px solid rgba(76, 175, 80, 0.3)", borderRadius: "8px" }}>
          <p style={{ margin: 0, color: "#4caf50", fontSize: "0.9rem" }}>
            🎉 <strong>FINAL TEST:</strong> Everything should work perfectly now - subtitles, chapters, quality, speed!
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
