#!/bin/bash

# 🔥 Nuclear NPM Fix Script for v1.1.8
# This script will FORCE npm to install the correct version

echo "🔥 Starting Nuclear NPM Fix for v1.1.8..."

# Check if we're in the right directory
if [ ! -f "advanced-react-media-player-1.1.8.tgz" ]; then
    echo "❌ Error: Please run this from the custom-player directory"
    echo "   Expected: /Users/apple/Desktop/localPlayer/custom-player"
    exit 1
fi

# Get the target directory from user
if [ -z "$1" ]; then
    echo "❌ Usage: ./nuclear-npm-fix.sh /path/to/your/player-testing"
    echo "   Example: ./nuclear-npm-fix.sh /Users/apple/Desktop/localPlayer/player-testing"
    exit 1
fi

TARGET_DIR="$1"

if [ ! -d "$TARGET_DIR" ]; then
    echo "❌ Error: Directory $TARGET_DIR does not exist"
    exit 1
fi

echo "🎯 Target directory: $TARGET_DIR"
echo "📦 Package: $(pwd)/advanced-react-media-player-1.1.8.tgz"

# Step 1: Go to target directory
cd "$TARGET_DIR" || exit 1

echo ""
echo "🧹 Step 1: Complete cleanup..."

# Remove all traces
npm uninstall advanced-react-media-player 2>/dev/null || true
rm -f package-lock.json
rm -f yarn.lock
rm -rf node_modules
rm -f .npmrc

# Kill npm processes
killall npm 2>/dev/null || true

# Clear all npm caches
npm cache clean --force
rm -rf ~/.npm/_cacache 2>/dev/null || true

echo "✅ Cleanup complete"

echo ""
echo "🔍 Step 2: Check package.json for hardcoded references..."

if grep -q "advanced-react-media-player.*1\.1\.7" package.json 2>/dev/null; then
    echo "⚠️  Found hardcoded 1.1.7 reference in package.json!"
    echo "   Please manually remove the line with 'advanced-react-media-player': '1.1.7'"
    echo "   Then re-run this script."
    exit 1
fi

echo "✅ No hardcoded references found"

echo ""
echo "📦 Step 3: Fresh install..."

# Install dependencies
npm install

echo ""
echo "🚀 Step 4: Install v1.1.8 with file:// protocol..."

# Use absolute path with file:// protocol
PACKAGE_PATH="/Users/apple/Desktop/localPlayer/custom-player/advanced-react-media-player-1.1.8.tgz"

if npm install "file://$PACKAGE_PATH"; then
    echo "✅ SUCCESS! Package installed with file:// protocol"
else
    echo "⚠️  file:// failed, trying manual extraction..."
    
    # Manual extraction method
    echo "📂 Extracting package manually..."
    
    mkdir -p node_modules/advanced-react-media-player
    cd node_modules/advanced-react-media-player
    
    if tar -xzf "$PACKAGE_PATH" --strip-components=1; then
        cd ../../
        echo "✅ SUCCESS! Package extracted manually"
        
        # Update package.json
        if command -v jq >/dev/null 2>&1; then
            jq '.dependencies["advanced-react-media-player"] = "1.1.8"' package.json > package.json.tmp
            mv package.json.tmp package.json
            echo "✅ Updated package.json with jq"
        else
            echo "⚠️  Please manually add to package.json dependencies:"
            echo '   "advanced-react-media-player": "1.1.8"'
        fi
    else
        echo "❌ Manual extraction failed"
        exit 1
    fi
fi

echo ""
echo "🔍 Step 5: Verification..."

# Verify installation
if npm list advanced-react-media-player 2>/dev/null | grep -q "1.1.8"; then
    echo "✅ SUCCESS! advanced-react-media-player@1.1.8 is installed"
    
    # Test import
    if node -e "console.log('Package version:', require('advanced-react-media-player/package.json').version)" 2>/dev/null; then
        echo "✅ Package import test passed"
    else
        echo "⚠️  Package installed but import test failed"
    fi
    
    echo ""
    echo "🎉 INSTALLATION COMPLETE!"
    echo "   You can now use advanced-react-media-player@1.1.8"
    echo "   The enriched analytics should now work properly."
    
else
    echo "❌ Verification failed - package not properly installed"
    echo "📋 Debug info:"
    npm list advanced-react-media-player 2>/dev/null || echo "   Package not found in npm list"
    ls -la node_modules/ | grep advanced || echo "   No advanced-react-media-player in node_modules"
    exit 1
fi

echo ""
echo "🚀 Next steps:"
echo "   1. Test your React app"
echo "   2. Check console for enriched analytics events"
echo "   3. Report back if you see the enhanced JSON format!"
