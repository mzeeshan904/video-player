#!/bin/bash

# 🚀 Enhanced Analytics Package Test Script
# Tests the new enhanced analytics features

echo "🎬 Testing Enhanced React Media Player NPM Package"
echo "=================================================="
echo "🆕 Version 1.1.0 with Enhanced Analytics"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Please run this script from the project root directory${NC}"
    exit 1
fi

# Step 1: Clean and build
echo -e "${BLUE}📦 Step 1: Clean build with enhanced analytics...${NC}"
rm -rf dist
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful!${NC}"
else
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

# Step 1.5: Verify enhanced analytics exports
echo ""
echo -e "${BLUE}🔍 Step 1.5: Verifying enhanced analytics exports...${NC}"
if grep -q "EnhancedAnalyticsManager" dist/types/index.d.ts; then
    echo -e "${GREEN}✅ EnhancedAnalyticsManager exported${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: EnhancedAnalyticsManager not found in exports${NC}"
fi

if grep -q "EnhancedAnalyticsEvent" dist/types/index.d.ts; then
    echo -e "${GREEN}✅ EnhancedAnalyticsEvent type exported${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: EnhancedAnalyticsEvent not found in exports${NC}"
fi

# Step 2: Check package contents
echo ""
echo -e "${BLUE}📋 Step 2: Package contents verification...${NC}"
echo -e "${YELLOW}Enhanced Analytics Files:${NC}"
if [ -f "ENHANCED_ANALYTICS_GUIDE.md" ]; then
    echo -e "${GREEN}✅ ENHANCED_ANALYTICS_GUIDE.md${NC}"
else
    echo -e "${RED}❌ Missing: ENHANCED_ANALYTICS_GUIDE.md${NC}"
fi

if [ -f "ANALYTICS_MIGRATION_GUIDE.md" ]; then
    echo -e "${GREEN}✅ ANALYTICS_MIGRATION_GUIDE.md${NC}"
else
    echo -e "${RED}❌ Missing: ANALYTICS_MIGRATION_GUIDE.md${NC}"
fi

if [ -f "ENHANCED_ANALYTICS_EXAMPLE.tsx" ]; then
    echo -e "${GREEN}✅ ENHANCED_ANALYTICS_EXAMPLE.tsx${NC}"
else
    echo -e "${RED}❌ Missing: ENHANCED_ANALYTICS_EXAMPLE.tsx${NC}"
fi

# Step 3: Create test package
echo ""
echo -e "${BLUE}📦 Step 3: Creating enhanced test package...${NC}"
PACKAGE_FILE=$(npm pack)
echo -e "${GREEN}✅ Created: $PACKAGE_FILE${NC}"

# Step 4: Test environment setup
echo ""
echo -e "${BLUE}🏗️  Step 4: Setting up enhanced test environment...${NC}"
TEST_DIR="/tmp/test-enhanced-media-player-$(date +%s)"
mkdir -p "$TEST_DIR"
CURRENT_DIR=$(pwd)
cd "$TEST_DIR"

# Step 5: Create test React app
echo -e "${BLUE}⚛️  Step 5: Creating test React app with TypeScript...${NC}"
npm create vite@latest . -- --template react-ts --yes
npm install

# Step 6: Install the enhanced package
echo ""
echo -e "${BLUE}📦 Step 6: Installing enhanced package...${NC}"
npm install "$CURRENT_DIR/$PACKAGE_FILE"

# Step 7: Create comprehensive test component with enhanced analytics
echo ""
echo -e "${BLUE}🧪 Step 7: Creating enhanced analytics test component...${NC}"
cat > src/App.tsx << 'EOF'
import React, { useState } from 'react';
import { 
  MediaPlayer, 
  type PlayerConfig, 
  type AnalyticsEvent,
  type EnhancedAnalyticsEvent,
  EnhancedAnalyticsManager,
  EVENT_NAMES
} from 'advanced-react-media-player';

const App: React.FC = () => {
  const [analyticsEvents, setAnalyticsEvents] = useState<any[]>([]);
  const [isEnhancedMode, setIsEnhancedMode] = useState(true);

  // 📊 Enhanced Analytics Handler
  const handleEnhancedAnalytics = (event: AnalyticsEvent) => {
    console.log('📊 Raw Event:', event.type, event);
    
    if (event.payload && typeof event.payload === 'object' && 'sessionId' in event.payload) {
      // Enhanced analytics event
      const enhancedEvent = event.payload as EnhancedAnalyticsEvent;
      setAnalyticsEvents(prev => [...prev, {
        type: 'enhanced',
        eventName: enhancedEvent.eventName,
        timestamp: enhancedEvent.timestamp,
        engagementScore: enhancedEvent.engagementScore,
        sessionDuration: enhancedEvent.sessionDuration,
        totalWatchTime: enhancedEvent.engagementMetrics?.totalWatchTime || 0,
        interactionCount: enhancedEvent.engagementMetrics?.interactionCount || 0,
        bandwidth: enhancedEvent.playerData?.bandwidth || 0
      }]);
      
      console.log('🎯 Enhanced Event:', enhancedEvent.eventName, {
        engagementScore: enhancedEvent.engagementScore,
        watchTime: enhancedEvent.engagementMetrics?.totalWatchTime,
        interactions: enhancedEvent.engagementMetrics?.interactionCount
      });
    } else {
      // Legacy analytics event
      setAnalyticsEvents(prev => [...prev, {
        type: 'legacy',
        eventName: event.type,
        timestamp: event.timestamp,
        payload: event.payload
      }]);
    }
  };

  // 📊 Legacy Analytics Handler
  const handleLegacyAnalytics = (event: AnalyticsEvent) => {
    console.log('📊 Legacy Event:', event.type, event);
    setAnalyticsEvents(prev => [...prev, {
      type: 'legacy',
      eventName: event.type,
      timestamp: event.timestamp,
      payload: event.payload
    }]);
  };

  // Player configuration
  const config: PlayerConfig = {
    src: {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      type: 'video',
      mimeType: 'video/mp4'
    },
    
    // 📺 Complete ad sequence for testing
    ads: {
      preRoll: [
        {
          id: 'enhanced-test-preroll',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          duration: 15,
          skippable: true,
          skipAfter: 3,
          interactive: {
            type: 'poll',
            data: {
              question: "🧪 Testing Enhanced Analytics! How's the experience?",
              options: ["Excellent!", "Very Good", "Good"],
              duration: 8
            }
          }
        }
      ],
      midRoll: [
        {
          id: 'enhanced-test-midroll',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
          duration: 15,
          playAt: 30,
          skippable: true,
          skipAfter: 5
        }
      ]
    },

    // 📊 Enhanced Analytics Configuration
    analytics: {
      enabled: true,
      enhancedAnalytics: isEnhancedMode,      // 🔥 Toggle enhanced analytics
      userId: 'test-user-12345',              // Test user ID
      onEvent: isEnhancedMode ? handleEnhancedAnalytics : handleLegacyAnalytics
    },

    ui: {
      theme: 'dark',
      autoplay: true,
      muted: true,
      showControls: true,
      showSettings: true
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#0a0a0a', 
      minHeight: '100vh',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ 
          fontSize: '2.5rem',
          background: 'linear-gradient(135deg, #ff6b6b, #4ecdc4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '10px'
        }}>
          🧪 Enhanced Analytics Test v1.1.0
        </h1>
        <p style={{ opacity: 0.8, fontSize: '1.1rem' }}>
          Testing advanced-react-media-player with enhanced analytics
        </p>
        
        {/* Analytics Mode Toggle */}
        <div style={{ 
          margin: '20px 0',
          padding: '15px',
          background: '#1a1a1a',
          borderRadius: '8px',
          display: 'inline-block'
        }}>
          <label style={{ fontSize: '16px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={isEnhancedMode}
              onChange={(e) => setIsEnhancedMode(e.target.checked)}
              style={{ marginRight: '10px' }}
            />
            📊 Enhanced Analytics Mode
          </label>
          <div style={{ fontSize: '14px', opacity: 0.7, marginTop: '5px' }}>
            {isEnhancedMode ? '🎯 Rich engagement & performance tracking' : '📝 Basic event tracking'}
          </div>
        </div>
      </header>

      {/* Media Player */}
      <div style={{ 
        width: '900px', 
        height: '506px', 
        margin: '0 auto 30px',
        border: '2px solid #333',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
      }}>
        <MediaPlayer config={config} />
      </div>

      {/* Analytics Dashboard */}
      <div style={{ 
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px'
      }}>
        {/* Event Log */}
        <div style={{
          background: '#1a1a1a',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #333'
        }}>
          <h3 style={{ marginTop: 0, color: '#4ecdc4' }}>📊 Live Analytics Events</h3>
          <div style={{ fontSize: '14px', color: '#888', marginBottom: '15px' }}>
            Total Events: {analyticsEvents.length}
          </div>
          
          <div style={{ 
            maxHeight: '400px', 
            overflow: 'auto',
            fontSize: '13px'
          }}>
            {analyticsEvents.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#666', padding: '40px 0' }}>
                🎬 Start playing the video to see events
              </div>
            ) : (
              analyticsEvents.slice(-10).reverse().map((event, index) => (
                <div 
                  key={`${event.timestamp}-${index}`}
                  style={{
                    background: event.type === 'enhanced' ? '#0a2a0a' : '#2a1a0a',
                    padding: '12px',
                    marginBottom: '8px',
                    borderRadius: '6px',
                    borderLeft: `4px solid ${event.type === 'enhanced' ? '#4ecdc4' : '#ff6b6b'}`
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    fontWeight: 'bold',
                    marginBottom: '6px'
                  }}>
                    <span>{event.eventName}</span>
                    <span style={{ 
                      fontSize: '11px', 
                      opacity: 0.7,
                      background: event.type === 'enhanced' ? '#4ecdc4' : '#ff6b6b',
                      color: 'black',
                      padding: '2px 6px',
                      borderRadius: '3px'
                    }}>
                      {event.type}
                    </span>
                  </div>
                  
                  {event.type === 'enhanced' && (
                    <div style={{ fontSize: '11px', color: '#ccc' }}>
                      <div>📈 Engagement: {event.engagementScore}%</div>
                      <div>⏱️ Watch Time: {Math.round(event.totalWatchTime / 1000)}s</div>
                      <div>👆 Interactions: {event.interactionCount}</div>
                      {event.bandwidth > 0 && (
                        <div>📶 Bandwidth: {Math.round(event.bandwidth / 1000000)}Mbps</div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Test Checklist */}
        <div style={{
          background: '#1a1a1a',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #333'
        }}>
          <h3 style={{ marginTop: 0, color: '#ff6b6b' }}>✅ Test Checklist</h3>
          
          <div style={{ fontSize: '14px' }}>
            <h4 style={{ color: '#4ecdc4', fontSize: '16px' }}>📊 Enhanced Analytics Features</h4>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
              <li>Toggle enhanced analytics mode</li>
              <li>Check engagement score calculation</li>
              <li>Verify event structure in console</li>
              <li>Test session tracking</li>
              <li>Monitor performance metrics</li>
            </ul>

            <h4 style={{ color: '#4ecdc4', fontSize: '16px' }}>🎬 Player Functionality</h4>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
              <li>Video player renders correctly</li>
              <li>Pre-roll ad plays first (15s)</li>
              <li>Interactive poll appears during ad</li>
              <li>Can skip ad after 3 seconds</li>
              <li>Main video plays after ad</li>
              <li>Mid-roll ad triggers at 30s</li>
              <li>All controls work (play/pause/seek)</li>
              <li>Settings menu functions</li>
              <li>Fullscreen mode works</li>
            </ul>

            <h4 style={{ color: '#4ecdc4', fontSize: '16px' }}>🔍 What to Check</h4>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
              <li>Browser console for detailed logs</li>
              <li>Event type indicators (enhanced vs legacy)</li>
              <li>Engagement score progression</li>
              <li>Watch time accumulation</li>
              <li>Interaction counting</li>
            </ul>
          </div>
        </div>
      </div>

      <footer style={{ 
        textAlign: 'center', 
        marginTop: '40px', 
        padding: '20px',
        opacity: 0.8,
        borderTop: '1px solid #333'
      }}>
        <p style={{ fontSize: '18px', marginBottom: '10px' }}>
          🎉 <strong>Enhanced Analytics v1.1.0 Test Complete!</strong>
        </p>
        <p style={{ fontSize: '14px', color: '#888' }}>
          Check browser console for detailed analytics logs
        </p>
        <div style={{ marginTop: '15px', fontSize: '12px' }}>
          <span style={{ marginRight: '20px' }}>📊 Enhanced Events</span>
          <span style={{ marginRight: '20px' }}>📈 Engagement Tracking</span>
          <span>⚡ Performance Monitoring</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
EOF

# Step 8: Update main.tsx for proper imports
echo -e "${BLUE}🎨 Step 8: Setting up enhanced CSS imports...${NC}"
cat > src/main.tsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import 'advanced-react-media-player/dist/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF

# Step 9: Install additional dependencies for testing
echo ""
echo -e "${BLUE}📦 Step 9: Installing additional dependencies...${NC}"
npm install @types/node

# Step 10: Start test server
echo ""
echo -e "${GREEN}🚀 Step 10: Starting enhanced analytics test server...${NC}"
echo ""
echo -e "${YELLOW}📱 Test URL: http://localhost:5173${NC}"
echo ""
echo -e "${GREEN}✅ Enhanced Analytics Features to Test:${NC}"
echo "   📊 Toggle between enhanced and legacy analytics"
echo "   📈 Real-time engagement score calculation"
echo "   ⏱️  Watch time tracking"
echo "   👆 Interaction counting"
echo "   🎯 Event type differentiation"
echo "   📺 Complete ad sequence with analytics"
echo ""
echo -e "${YELLOW}🔍 Debug Instructions:${NC}"
echo "   1. Open browser developer console"
echo "   2. Watch for analytics events in console"
echo "   3. Toggle enhanced analytics mode"
echo "   4. Compare event structures"
echo "   5. Test all player interactions"
echo ""
echo -e "${BLUE}📊 Expected Enhanced Event Structure:${NC}"
echo '   {
     "sessionId": "session_...",
     "eventName": "onPlay", 
     "engagementScore": 60,
     "engagementMetrics": { ... },
     "performanceMetrics": { ... },
     "deviceInfo": { ... }
   }'
echo ""

# Make sure the script doesn't exit
echo -e "${GREEN}🎬 Starting development server...${NC}"
npm run dev

# Cleanup instructions
echo ""
echo -e "${BLUE}🧹 Cleanup Instructions:${NC}"
echo "   Delete test directory: rm -rf $TEST_DIR"
echo "   Return to project: cd $CURRENT_DIR"
