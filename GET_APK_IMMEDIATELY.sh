#!/bin/bash

echo "🚀 Quantum Risk Coach - APK Builder"
echo "=================================="

# Check if Android Studio is installed
if command -v studio &> /dev/null; then
    echo "✅ Android Studio found"
    echo "📱 Opening project in Android Studio..."
    npx cap open android
    echo ""
    echo "🎯 In Android Studio:"
    echo "1. Wait for Gradle sync to complete"
    echo "2. Go to Build → Build Bundle(s) / APK(s) → Build APK(s)"
    echo "3. APK will be in: android/app/build/outputs/apk/debug/app-debug.apk"
else
    echo "⚠️  Android Studio not found"
    echo ""
    echo "📥 Download Android Studio:"
    echo "https://developer.android.com/studio"
    echo ""
    echo "🔧 Alternative: Install Java and build locally"
    echo "1. Download Java JDK 11 from: https://adoptium.net/temurin/releases/"
    echo "2. Install Java"
    echo "3. Run: cd android && ./gradlew assembleDebug"
fi

echo ""
echo "🌐 Check GitHub Actions for cloud build:"
echo "https://github.com/Millsondylan/quantum-risk-coach/actions"
echo ""
echo "📱 Your APK will include:"
echo "- 🎨 Holographic UI Design"
echo "- 🤖 AI-Powered Trading Features"
echo "- 📊 Advanced Analytics"
echo "- 🔗 Multi-Broker Support"
echo "- 📝 Smart Journal"
echo "- 🎯 Trade Builder"
echo ""
echo "🎉 Your Quantum Risk Coach APK is ready to build!" 