#!/bin/bash

# 🚀 Advanced React Media Player - Local Installation Script
# This script helps you install the media player package in your React project

echo "🎬 Advanced React Media Player - Local Installation"
echo "=================================================="

# Check if target directory is provided
if [ -z "$1" ]; then
    echo "❌ Error: Please provide your React project directory"
    echo "📝 Usage: ./install-local.sh /path/to/your/react-project"
    echo ""
    echo "📁 Example: ./install-local.sh ~/Projects/my-react-app"
    exit 1
fi

TARGET_DIR="$1"
PACKAGE_FILE="advanced-react-media-player-1.3.0.tgz"
CURRENT_DIR="$(pwd)"

# Check if target directory exists
if [ ! -d "$TARGET_DIR" ]; then
    echo "❌ Error: Directory '$TARGET_DIR' does not exist"
    exit 1
fi

# Check if package file exists
if [ ! -f "$PACKAGE_FILE" ]; then
    echo "❌ Error: Package file '$PACKAGE_FILE' not found"
    echo "🔧 Run 'npm run build && npm pack' first"
    exit 1
fi

echo "📦 Package found: $PACKAGE_FILE"
echo "📁 Target directory: $TARGET_DIR"
echo ""

# Copy package to target directory
echo "📋 Copying package to target directory..."
cp "$PACKAGE_FILE" "$TARGET_DIR/"

# Navigate to target directory
cd "$TARGET_DIR"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ Error: No package.json found in '$TARGET_DIR'"
    echo "🔧 Make sure this is a valid React project directory"
    exit 1
fi

echo "✅ Package copied successfully"
echo ""

# Install the package
echo "📦 Installing advanced-react-media-player..."
npm install "./$PACKAGE_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Package installed successfully!"
else
    echo "❌ Package installation failed"
    exit 1
fi

echo ""

# Check and install dependencies
echo "🔧 Checking dependencies..."

# Check for React
if ! npm list react > /dev/null 2>&1; then
    echo "📦 Installing React..."
    npm install react react-dom
fi

# Check for streaming dependencies
echo "📺 Installing streaming dependencies..."
npm install hls.js dashjs shaka-player

echo ""
echo "🎉 Installation Complete!"
echo "======================="
echo ""
echo "📝 Next Steps:"
echo "1. Copy the test component from QUICK_TEST.tsx"
echo "2. Import the CSS: import 'advanced-react-media-player/dist/index.css'"
echo "3. Use the MediaPlayer component in your app"
echo ""
echo "📚 Documentation:"
echo "- See LOCAL_INSTALLATION_GUIDE.md for detailed instructions"
echo "- Check QUICK_TEST.tsx for a ready-to-use test component"
echo ""
echo "🧪 Testing:"
echo "- Open browser console (F12) to see DASH analysis and error handling"
echo "- Watch for buffer error warnings (should be non-critical)"
echo "- Verify ad sequence works correctly"
echo ""
echo "✨ Happy coding!"

# Return to original directory
cd "$CURRENT_DIR"
