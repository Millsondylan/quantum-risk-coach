#!/bin/bash

echo "🚀 Quantum Risk Coach - APK Build Completion Script"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "✅ Project structure verified"

# Check if Android Studio is installed
if [ -d "/Applications/Android Studio.app" ]; then
    echo "✅ Android Studio found"
    ANDROID_STUDIO_AVAILABLE=true
else
    echo "⚠️  Android Studio not found in /Applications"
    echo "   Please install Android Studio from: https://developer.android.com/studio"
    ANDROID_STUDIO_AVAILABLE=false
fi

# Check Java installation
if command -v java &> /dev/null; then
    echo "✅ Java found"
    java -version 2>/dev/null || echo "⚠️  Java found but may need configuration"
else
    echo "❌ Java not found"
    echo "   Installing Java..."
    
    # Try to install Java using different methods
    if command -v brew &> /dev/null; then
        echo "📦 Installing Java via Homebrew..."
        brew install openjdk@11
        echo "export JAVA_HOME=\$(/usr/libexec/java_home -v 11)" >> ~/.zshrc
        echo "export PATH=\$JAVA_HOME/bin:\$PATH" >> ~/.zshrc
        source ~/.zshrc
    else
        echo "❌ Homebrew not found. Please install Java manually:"
        echo "   1. Visit: https://www.oracle.com/java/technologies/javase-jdk11-downloads.html"
        echo "   2. Download and install JDK 11 for macOS"
        echo "   3. Set JAVA_HOME environment variable"
    fi
fi

# Check if Android SDK is available
if [ -d "$HOME/Library/Android/sdk" ]; then
    echo "✅ Android SDK found"
    export ANDROID_HOME="$HOME/Library/Android/sdk"
    export PATH="$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools:$PATH"
else
    echo "⚠️  Android SDK not found"
    echo "   Please install Android SDK via Android Studio"
fi

echo ""
echo "🔨 Building APK..."

# Try to build using Gradle
cd android

if [ -f "gradlew" ]; then
    echo "📱 Using Gradle wrapper..."
    chmod +x gradlew
    
    # Try to build
    if ./gradlew assembleDebug; then
        echo ""
        echo "🎉 APK Build Successful!"
        echo "========================="
        echo ""
        echo "📱 Your APK is ready at:"
        echo "   android/app/build/outputs/apk/debug/app-debug.apk"
        echo ""
        echo "📋 APK Details:"
        if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
            ls -lh app/build/outputs/apk/debug/app-debug.apk
            echo ""
            echo "✅ APK file exists and is ready for installation!"
        else
            echo "❌ APK file not found. Please check build logs above."
        fi
    else
        echo ""
        echo "❌ Gradle build failed"
        echo "========================="
        echo ""
        echo "🔧 Troubleshooting steps:"
        echo "1. Install Android Studio: https://developer.android.com/studio"
        echo "2. Install Java JDK 11"
        echo "3. Set up Android SDK"
        echo "4. Open project in Android Studio and build from there"
        echo ""
        echo "📱 Alternative: Use Android Studio"
        echo "   npm run android:open"
        echo "   Then: Build → Build Bundle(s) / APK(s) → Build APK(s)"
    fi
else
    echo "❌ Gradle wrapper not found"
    echo "   Please run: npm run build:mobile"
fi

cd ..

echo ""
echo "📱 Installation Instructions:"
echo "============================="
echo ""
echo "1. Transfer APK to your Android device"
echo "2. Enable 'Unknown Sources' in device settings"
echo "3. Open APK file and install"
echo ""
echo "🔧 For development testing:"
echo "   adb install android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "🎯 Next Steps:"
echo "1. Install APK on your device"
echo "2. Configure API keys in app settings"
echo "3. Connect your MT4/MT5 account"
echo "4. Start using AI-powered trading insights!"
echo ""
echo "🚀 Quantum Risk Coach APK Build Complete!" 