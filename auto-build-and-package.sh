#!/bin/bash

# 🚀 Auto Build & Package Script
# Automatically builds, packages, and provides installation command

echo "🔄 Auto Build & Package - Enhanced React Media Player"
echo "====================================================="

# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "📦 Current version: $CURRENT_VERSION"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Step 1: Clean previous builds
echo ""
echo -e "${BLUE}🧹 Step 1: Cleaning previous builds...${NC}"
rm -rf dist
rm -f advanced-react-media-player-*.tgz

# Step 2: Build the package
echo ""
echo -e "${BLUE}📦 Step 2: Building package with latest changes...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful!${NC}"
else
    echo -e "${RED}❌ Build failed! Please fix errors and try again.${NC}"
    exit 1
fi

# Step 3: Auto-increment version (patch)
echo ""
echo -e "${BLUE}📈 Step 3: Auto-incrementing version...${NC}"
npm version patch --no-git-tag-version

NEW_VERSION=$(node -p "require('./package.json').version")
echo -e "${GREEN}✅ Version updated: $CURRENT_VERSION → $NEW_VERSION${NC}"

# Step 4: Rebuild with new version
echo ""
echo -e "${BLUE}🔄 Step 4: Rebuilding with new version...${NC}"
npm run build

# Step 5: Create TGZ package
echo ""
echo -e "${BLUE}📦 Step 5: Creating TGZ package...${NC}"
PACKAGE_FILE=$(npm pack)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Package created: $PACKAGE_FILE${NC}"
else
    echo -e "${RED}❌ Package creation failed!${NC}"
    exit 1
fi

# Step 6: Get package info
PACKAGE_SIZE=$(ls -lh "$PACKAGE_FILE" | awk '{print $5}')
FULL_PATH=$(pwd)/$PACKAGE_FILE

echo ""
echo -e "${PURPLE}📊 Package Information:${NC}"
echo -e "   📁 File: $PACKAGE_FILE"
echo -e "   📏 Size: $PACKAGE_SIZE"
echo -e "   🆕 Version: $NEW_VERSION"
echo -e "   📍 Path: $FULL_PATH"

# Step 7: Generate installation commands
echo ""
echo -e "${YELLOW}🚀 INSTALLATION COMMANDS:${NC}"
echo ""
echo -e "${GREEN}📋 Copy and paste this command to install:${NC}"
echo ""
echo -e "${BLUE}npm install $FULL_PATH${NC}"
echo ""
echo -e "${GREEN}📋 Or use relative path:${NC}"
echo ""
echo -e "${BLUE}npm install ./$PACKAGE_FILE${NC}"
echo ""

# Step 8: Generate test commands
echo -e "${YELLOW}🧪 TESTING COMMANDS:${NC}"
echo ""
echo -e "${GREEN}📋 Run comprehensive test:${NC}"
echo -e "${BLUE}./test-enhanced-package.sh${NC}"
echo ""
echo -e "${GREEN}📋 Test analytics issue debug:${NC}"
echo -e "${BLUE}# Copy DEBUG_ANALYTICS_ISSUE.tsx to your project and render it${NC}"
echo ""

# Step 9: Show what's new
echo -e "${YELLOW}🆕 WHAT'S NEW IN v$NEW_VERSION:${NC}"
echo "   ✅ Enhanced Analytics System"
echo "   ✅ Real-time Engagement Scoring" 
echo "   ✅ Performance Metrics Tracking"
echo "   ✅ Device Information Collection"
echo "   ✅ Session Management"
echo "   ✅ Complete Event Schema"
echo "   ✅ Backward Compatibility"
echo ""

# Step 10: Quick verification
echo -e "${BLUE}🔍 Step 10: Package verification...${NC}"
echo -e "${GREEN}✅ Files included in package:${NC}"
npm pack --dry-run | grep -E '\.(tsx?|md|json)$' | head -10
echo "   ... and more"
echo ""

# Step 11: Save command to file for easy copy
INSTALL_COMMAND="npm install $FULL_PATH"
echo "$INSTALL_COMMAND" > LATEST_INSTALL_COMMAND.txt

echo -e "${PURPLE}💾 Installation command saved to: LATEST_INSTALL_COMMAND.txt${NC}"
echo ""
echo -e "${GREEN}🎉 Ready to install and test!${NC}"
echo ""
echo -e "${YELLOW}📞 Next Steps:${NC}"
echo "   1. Copy the installation command above"
echo "   2. Run it in your test project"
echo "   3. Use the analytics configuration with enhancedAnalytics: true"
echo "   4. Test multiple events to verify they fire repeatedly"
echo ""
