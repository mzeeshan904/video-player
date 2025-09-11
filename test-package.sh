#!/bin/bash

# 🧪 Quick NPM Package Test Script

echo "🚀 Testing Custom Media Player NPM Package"
echo "=========================================="

# Step 1: Build the package
echo "📦 Step 1: Building package..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

# Step 2: Check package contents
echo ""
echo "📋 Step 2: Package contents..."
npm pack --dry-run | tail -20

# Step 3: Create package tarball
echo ""
echo "📦 Step 3: Creating test package..."
PACKAGE_FILE=$(npm pack)
echo "✅ Created: $PACKAGE_FILE"

# Step 4: Test directory setup
echo ""
echo "🏗️  Step 4: Setting up test environment..."
TEST_DIR="/tmp/test-media-player-$(date +%s)"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

# Step 5: Create test React app with Vite
echo "⚛️  Step 5: Creating test React app with Vite..."
npm create vite@latest . -- --template react-ts
npm install

# Step 6: Install the package
echo ""
echo "📦 Step 6: Installing your package..."
npm install "$(pwd)/../custom-player/$PACKAGE_FILE"

# Step 7: Create test component
echo ""
echo "🧪 Step 7: Creating test component..."
cat > src/App.tsx << 'EOF'
import React from 'react';
import { MediaPlayer, PlayerConfig, type AnalyticsEvent } from 'custom-media-player';

const config: PlayerConfig = {
  src: {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    type: 'video',
    mimeType: 'video/mp4'
  },
  ads: {
    preRoll: [
      {
        id: 'test-preroll',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        duration: 15,
        skippable: true,
        skipAfter: 3,
        interactive: {
          type: 'poll',
          data: {
            question: "🧪 Testing NPM Package! How's it working?",
            options: ["Perfect!", "Good", "Needs work"],
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
    onEvent: (event: AnalyticsEvent) => console.log('📊 Analytics Event:', event)
  }
};

function App() {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#0a0a0a', 
      minHeight: '100vh',
      color: 'white'
    }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ 
          fontSize: '2rem',
          background: 'linear-gradient(135deg, #ff6b6b, #4ecdc4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          🧪 NPM Package Test
        </h1>
        <p style={{ opacity: 0.8 }}>
          Testing custom-media-player
        </p>
      </header>
      
      <div style={{ 
        width: '800px', 
        height: '450px', 
        margin: '0 auto',
        border: '2px solid #333',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <MediaPlayer config={config} />
      </div>
      
      <footer style={{ textAlign: 'center', marginTop: '30px', opacity: 0.7 }}>
        <p>✅ If you see the video player above, the package works!</p>
        <p>🎬 Test: Pre-roll ad → Main content → All controls</p>
      </footer>
    </div>
  );
}

export default App;
EOF

# Step 8: Install CSS handling
echo ""
echo "🎨 Step 8: Setting up CSS imports..."
cat > src/main.tsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import 'custom-media-player/dist/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF

# Step 9: Start the test server
echo ""
echo "🚀 Step 9: Starting test server..."
echo "📱 Opening: http://localhost:3001"
echo ""
echo "✅ Test what to look for:"
echo "   - Video player renders"
echo "   - Pre-roll ad plays first"
echo "   - Interactive poll appears"
echo "   - Can skip ad after 3 seconds"
echo "   - Main video plays after ad"
echo "   - All controls work"
echo ""

npm run dev -- --port 3001

echo ""
echo "🧹 Cleanup: You can delete the test directory:"
echo "rm -rf $TEST_DIR"
