import "./App.css";
import { MediaPlayer } from "advanced-react-media-player";
import "advanced-react-media-player/dist/index.css";
import { useMemo } from "react";

function App() {
  // ✅ CRITICAL: Wrap config in useMemo to prevent re-creation on every render
  const config = useMemo(() => ({
    src: {
      url: "https://dspk-sandbox.airfi.io/content/dreamstream/video/eng/4ac34b49-03b4-4238-9053-865fba832d2d/d8a4241a-d2d1-4637-af30-c3014aa2f254.mpd",
      type: "video" as const,
      mimeType: "application/dash+xml",
    },
    ads: {
      preRoll: [
        {
          id: "preroll-1",
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
          duration: 15,
          skippable: true,
          skipAfter: 5,
        },
        {
          id: "preroll-2",
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
          duration: 15,
          skippable: true,
          skipAfter: 3,
        },
      ],
      midRoll: [
        {
          id: "midroll-1",
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
          duration: 20,
          skippable: true,
          skipAfter: 5,
          playAt: 15,
        },
      ],
    },
    ui: {
      theme: "dark" as const,
      autoplay: true,
      muted: true,
      showControls: true,
    },
  }), []); // ✅ Empty dependency array - config never changes

  return (
    <div style={{ padding: "20px", backgroundColor: "#0a0a0a", minHeight: "100vh" }}>
      <h1 style={{ color: "white", textAlign: "center" }}>
        ✅ CLEAN TEST - Pre-roll → DASH Content
      </h1>
      <div style={{ maxWidth: "1000px", margin: "20px auto" }}>
        <MediaPlayer config={config} />
      </div>
    </div>
  );
}

export default App;

