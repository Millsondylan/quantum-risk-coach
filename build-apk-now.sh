#!/bin/bash

# QUICK APK BUILD SCRIPT
# This script builds the APK directly from terminal

echo "🚀 QUANTUM RISK COACH - QUICK APK BUILD"
echo "======================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}📋 BUILDING APK FROM TERMINAL...${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run from project root.${NC}"
    exit 1
fi

# Check if Android platform exists
if [ ! -d "android" ]; then
    echo -e "${RED}❌ Error: Android platform not found. Run 'npx cap add android' first.${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Building web assets...${NC}"
npm run build:prod

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Web build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Web assets built successfully${NC}"

echo -e "${YELLOW}Step 2: Syncing with Capacitor...${NC}"
npx cap sync android

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Capacitor sync failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Capacitor sync completed${NC}"

echo -e "${YELLOW}Step 3: Building APK...${NC}"
cd android

# Check if gradlew exists
if [ ! -f "./gradlew" ]; then
    echo -e "${RED}❌ Gradle wrapper not found${NC}"
    exit 1
fi

# Make gradlew executable
chmod +x ./gradlew

# Build debug APK
echo -e "${BLUE}Building debug APK...${NC}"
./gradlew assembleDebug

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ APK build failed${NC}"
    exit 1
fi

cd ..

# Check if APK was created
APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"
if [ ! -f "$APK_PATH" ]; then
    echo -e "${RED}❌ APK not found at expected location${NC}"
    exit 1
fi

# Get APK info
APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
APK_PATH_ABSOLUTE=$(realpath "$APK_PATH")

echo ""
echo -e "${GREEN}🎉 APK BUILT SUCCESSFULLY!${NC}"
echo "=================================="
echo ""
echo -e "${BLUE}📱 APK Information:${NC}"
echo "   • Location: $APK_PATH_ABSOLUTE"
echo "   • Size: $APK_SIZE"
echo "   • Type: Debug APK"
echo ""
echo -e "${YELLOW}📋 Installation Instructions:${NC}"
echo "   1. Transfer APK to your Android device"
echo "   2. Enable 'Unknown Sources' in Android Settings"
echo "   3. Install APK by tapping the file"
echo "   4. Launch Quantum Risk Coach"
echo ""
echo -e "${GREEN}✨ Features Included:${NC}"
echo "   ✅ MT4/MT5 Auto-Sync → Calendar → AI Coach"
echo "   ✅ Real-time trade tracking"
echo "   ✅ Professional UltraTrader UI"
echo "   ✅ Risk management & analytics"
echo "   ✅ Push notifications"
echo "   ✅ Multi-broker support"
echo ""
echo -e "${BLUE}🔗 Quick Access:${NC}"
echo "   • Open in Finder: open $(dirname "$APK_PATH_ABSOLUTE")"
echo "   • Copy to Downloads: cp '$APK_PATH_ABSOLUTE' ~/Downloads/"
echo ""
echo -e "${GREEN}🚀 Your Quantum Risk Coach APK is ready!${NC}" 