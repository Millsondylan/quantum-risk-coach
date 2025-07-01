#!/bin/bash

echo "🚀 Building Quantum Risk Coach APK..."

# Build the web assets
echo "📦 Building web assets..."
npm run build

# Sync with Capacitor
echo "🔄 Syncing with Capacitor..."
npx cap sync

# Check if Java is available
if ! command -v java &> /dev/null; then
    echo "⚠️  Java not found. Installing Java..."
    # Try to install Java using different methods
    if command -v brew &> /dev/null; then
        brew install --cask temurin11
    else
        echo "❌ Please install Java manually:"
        echo "   Download from: https://adoptium.net/temurin/releases/"
        echo "   Or install Android Studio which includes Java"
        exit 1
    fi
fi

# Build APK
echo "🔨 Building APK..."
cd android
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    echo "✅ APK built successfully!"
    echo "📱 APK location: android/app/build/outputs/apk/debug/app-debug.apk"
    
    # Check if APK exists
    if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
        echo "🎉 APK is ready!"
        echo ""
        echo "📥 Download your APK from:"
        echo "   https://github.com/Millsondylan/quantum-risk-coach/releases"
        echo ""
        echo "🔧 Or find it locally at:"
        echo "   $(pwd)/app/build/outputs/apk/debug/app-debug.apk"
        echo ""
        echo "📱 Installation instructions:"
        echo "   1. Download the APK"
        echo "   2. Enable 'Unknown Sources' in Android Settings"
        echo "   3. Install the APK"
        echo "   4. Configure API keys in Settings"
        echo "   5. Start trading with AI insights!"
    else
        echo "❌ APK not found. Check build logs above."
    fi
else
    echo "❌ APK build failed. Check the error messages above."
fi

cd .. 