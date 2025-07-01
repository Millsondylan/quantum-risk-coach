#!/bin/bash

# TradeMind AI APK Build Script
# This script automates the process of building an APK for the TradeMind AI app

set -e

echo "🚀 TradeMind AI - APK Build Script"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "❌ Java is not installed. Please install Java JDK 11 or higher."
    exit 1
fi

# Check if Android SDK is available
if [ -z "$ANDROID_HOME" ]; then
    echo "⚠️  ANDROID_HOME is not set. Please set it to your Android SDK path."
    echo "   Example: export ANDROID_HOME=/Users/username/Library/Android/sdk"
fi

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building web assets..."
npm run build

echo "📱 Syncing with Capacitor..."
npx cap sync

echo "✅ Build completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Open Android Studio: npm run android:open"
echo "2. Wait for Gradle sync to complete"
echo "3. Go to Build → Build Bundle(s) / APK(s) → Build APK(s)"
echo "4. APK will be generated in android/app/build/outputs/apk/debug/"
echo ""
echo "🔧 Alternative command line build:"
echo "   cd android && ./gradlew assembleDebug"
echo ""
echo "📱 The APK will be ready for installation on Android devices!" 