#!/bin/bash

# 🧪 Media Player Test Runner Script
# This script helps you quickly test different streaming and DRM scenarios

echo "🎬 Advanced React Media Player - Test Suite"
echo "============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if node modules are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🔍 Available Test Options:"
echo ""
echo "1. 🚀 Comprehensive Test Runner (All tests in one interface)"
echo "2. 📡 DASH & HLS Streaming Tests Only"
echo "3. 🔐 DRM Protected Content Tests Only"
echo "4. ⚡ Quick Basic Tests"
echo "5. 🌐 Start Development Server"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo "🚀 Starting Comprehensive Test Runner..."
        echo "This will open the main test interface with all capabilities"
        echo ""
        echo "📝 Test Instructions:"
        echo "- System capabilities will be detected automatically"
        echo "- Use the navigation to switch between test suites"
        echo "- Monitor browser console for detailed logs"
        echo "- Test on different browsers for full compatibility"
        echo ""
        # You would modify src/App.tsx to import COMPREHENSIVE_TEST_RUNNER
        echo "To use: Import and render COMPREHENSIVE_TEST_RUNNER.tsx in your App.tsx"
        ;;
    2)
        echo "📡 Starting DASH & HLS Tests..."
        echo "This will test adaptive bitrate streaming protocols"
        echo ""
        echo "🧪 Test URLs included:"
        echo "  📱 HLS - Apple test streams (bipbop)"
        echo "  📡 DASH - Akamai test streams (Big Buck Bunny)"
        echo "  🎥 JW Player test streams"
        echo ""
        echo "To use: Import and render DASH_HLS_TEST.tsx in your App.tsx"
        ;;
    3)
        echo "🔐 Starting DRM Tests..."
        echo "This will test Digital Rights Management systems"
        echo ""
        echo "⚠️  Requirements:"
        echo "  - HTTPS server (DRM requires secure context)"
        echo "  - Modern browser with EME support"
        echo "  - Correct DRM system for your browser"
        echo ""
        echo "🛡️  DRM Systems included:"
        echo "  - Widevine (Chrome, Firefox, Edge)"
        echo "  - PlayReady (Edge, Windows)"
        echo "  - FairPlay (Safari, iOS)"
        echo ""
        echo "To use: Import and render DRM_TEST.tsx in your App.tsx"
        ;;
    4)
        echo "⚡ Quick Basic Tests..."
        echo "This runs basic functionality tests"
        echo ""
        echo "🎯 Quick tests include:"
        echo "  - Basic MP4 playback"
        echo "  - HLS streaming (quick)"
        echo "  - DASH streaming (quick)"
        echo "  - DRM protected content (quick)"
        echo "  - Complete ad experience"
        echo ""
        echo "These are available in the Overview section of COMPREHENSIVE_TEST_RUNNER.tsx"
        ;;
    5)
        echo "🌐 Starting Development Server..."
        echo "This will start the React development server"
        echo ""
        echo "📝 Instructions:"
        echo "1. Server will start on http://localhost:3000"
        echo "2. For DRM testing, you may need HTTPS"
        echo "3. Import your desired test component in src/App.tsx"
        echo ""
        npm start
        ;;
    *)
        echo "❌ Invalid choice. Please select 1-5."
        exit 1
        ;;
esac

echo ""
echo "📋 Testing Tips:"
echo "==============="
echo ""
echo "🔍 Browser Console:"
echo "  - Keep browser console open for detailed logs"
echo "  - Look for streaming and DRM related messages"
echo "  - Monitor for error messages and warnings"
echo ""
echo "📱 Cross-Browser Testing:"
echo "  - Chrome: Best for Widevine DRM and DASH"
echo "  - Safari: Native HLS and FairPlay DRM"
echo "  - Firefox: Good DASH support and Widevine"
echo "  - Edge: PlayReady DRM support"
echo ""
echo "🔐 DRM Testing:"
echo "  - Ensure HTTPS is enabled"
echo "  - Test appropriate DRM system for each browser"
echo "  - Monitor license acquisition in console"
echo ""
echo "📡 Streaming Testing:"
echo "  - Test quality switching manually"
echo "  - Try seeking to different positions"
echo "  - Monitor adaptive bitrate behavior"
echo ""
echo "🚀 For detailed testing instructions, see TESTING_README.md"
echo ""
