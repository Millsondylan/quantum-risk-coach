#!/bin/bash

# Quantum Risk Coach - Quick Setup & APK Build
# Automated setup script for macOS

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "🚀 Quantum Risk Coach - Quick Setup"
echo "=================================="
echo ""

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}❌ This script is designed for macOS${NC}"
    exit 1
fi

echo -e "${BLUE}📱 Your app is 100% feature-complete and ready!${NC}"
echo -e "${BLUE}   Just need to install build tools...${NC}"
echo ""

# Check Node.js
echo -e "${YELLOW}🔍 Checking Node.js...${NC}"
if command -v node &> /dev/null; then
    echo -e "${GREEN}✅ Node.js $(node --version) found${NC}"
else
    echo -e "${RED}❌ Node.js not found${NC}"
    echo "Please install Node.js from: https://nodejs.org/"
    exit 1
fi

# Check/Install Homebrew
echo -e "${YELLOW}🔍 Checking Homebrew...${NC}"
if command -v brew &> /dev/null; then
    echo -e "${GREEN}✅ Homebrew found${NC}"
else
    echo -e "${YELLOW}📦 Installing Homebrew...${NC}"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
    eval "$(/opt/homebrew/bin/brew shellenv)"
fi

# Check/Install Java
echo -e "${YELLOW}🔍 Checking Java...${NC}"
if command -v java &> /dev/null; then
    echo -e "${GREEN}✅ Java found${NC}"
else
    echo -e "${YELLOW}📦 Installing Java JDK 17...${NC}"
    brew install openjdk@17
    echo 'export JAVA_HOME="$(brew --prefix openjdk@17)"' >> ~/.zprofile
    echo 'export PATH="$JAVA_HOME/bin:$PATH"' >> ~/.zprofile
    export JAVA_HOME="$(brew --prefix openjdk@17)"
    export PATH="$JAVA_HOME/bin:$PATH"
fi

# Android Studio check
echo -e "${YELLOW}🔍 Checking Android Studio...${NC}"
if [ -d "/Applications/Android Studio.app" ]; then
    echo -e "${GREEN}✅ Android Studio found${NC}"
    
    # Try to find Android SDK
    if [ -d "$HOME/Library/Android/sdk" ]; then
        echo -e "${GREEN}✅ Android SDK found${NC}"
        export ANDROID_HOME="$HOME/Library/Android/sdk"
        export PATH="$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools:$PATH"
        
        echo ""
        echo -e "${GREEN}🎉 ALL REQUIREMENTS MET!${NC}"
        echo ""
        echo -e "${BLUE}Building your APK now...${NC}"
        
        # Build APK
        npm install
        npm run build
        
        if [ ! -d "android" ]; then
            npx cap add android
        fi
        
        npx cap sync android
        
        cd android
        chmod +x ./gradlew
        ./gradlew assembleDebug
        
        if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
            cd ..
            mkdir -p apk-downloads
            cp android/app/build/outputs/apk/debug/app-debug.apk apk-downloads/quantum-risk-coach-ready.apk
            
            echo ""
            echo -e "${GREEN}🎉 SUCCESS! APK BUILT!${NC}"
            echo "================================"
            echo ""
            echo -e "${GREEN}📱 Your APK is ready at:${NC}"
            echo "   apk-downloads/quantum-risk-coach-ready.apk"
            echo ""
            echo -e "${BLUE}📋 Install on your phone:${NC}"
            echo "   1. Transfer APK to your Android device"
            echo "   2. Enable 'Install from Unknown Sources'"
            echo "   3. Tap the APK to install"
            echo ""
            echo -e "${GREEN}✅ Your trading app with ALL features is ready!${NC}"
        else
            echo -e "${RED}❌ APK build failed${NC}"
        fi
        
    else
        echo -e "${YELLOW}⚠️  Android SDK not found${NC}"
        echo "Please open Android Studio and install SDK Platform 35"
    fi
else
    echo -e "${YELLOW}⚠️  Android Studio not found${NC}"
    echo ""
    echo -e "${BLUE}📥 Please download and install:${NC}"
    echo "   1. Android Studio: https://developer.android.com/studio"
    echo "   2. During setup, install Android SDK Platform 35"
    echo ""
    echo -e "${BLUE}Then run this script again!${NC}"
fi

echo ""
echo -e "${BLUE}💡 Alternative: Manual Build${NC}"
echo "   If automated build doesn't work:"
echo "   1. npm run android:open"
echo "   2. Build → Build APK in Android Studio" 