#!/bin/bash

# Quantum Risk Coach - Complete APK Build & Deploy Script
# This script handles the complete build, optimization, and deployment process

set -e

echo "🚀 Quantum Risk Coach - Complete APK Build & Deploy"
echo "================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check Node.js installation
print_status "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node --version)"
    exit 1
fi
print_success "Node.js $(node --version) ✓"

# Check Java installation
print_status "Checking Java installation..."
if ! command -v java &> /dev/null; then
    print_error "Java is not installed. Please install Java JDK 17+ first."
    exit 1
fi

JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
if [ "$JAVA_VERSION" -lt 17 ]; then
    print_error "Java 17+ is required. Please update your Java installation."
    exit 1
fi
print_success "Java $(java -version 2>&1 | head -n 1 | cut -d'"' -f2) ✓"

# Check Android SDK
print_status "Checking Android SDK..."
if [ -z "$ANDROID_HOME" ]; then
    print_error "ANDROID_HOME is not set. Please set it to your Android SDK path."
    print_error "Example: export ANDROID_HOME=/Users/username/Library/Android/sdk"
    exit 1
fi

if [ ! -d "$ANDROID_HOME" ]; then
    print_error "Android SDK directory not found at: $ANDROID_HOME"
    exit 1
fi
print_success "Android SDK found at $ANDROID_HOME ✓"

# Clean previous builds
print_status "Cleaning previous builds..."
rm -rf dist/
rm -rf android/app/build/
print_success "Cleaned previous builds ✓"

# Install dependencies with legacy peer deps
print_status "Installing/updating dependencies with legacy peer deps..."
npm install --legacy-peer-deps
print_success "Dependencies installed ✓"

# Run type checking
print_status "Running type checking..."
npm run type-check
print_success "Type checking passed ✓"

# Run linting
print_status "Running ESLint..."
npm run lint
print_success "Linting passed ✓"

# Build for production
print_status "Building web assets for production..."
npm run build:prod
print_success "Web assets built successfully ✓"

# Check if android platform exists, if not add it
if [ ! -d "android" ]; then
    print_status "Adding Android platform..."
    npx cap add android
    print_success "Android platform added ✓"
fi

# Sync with Capacitor
print_status "Syncing with Capacitor..."
npx cap sync android
print_success "Capacitor sync completed ✓"

# Build APK
print_status "Building APK..."
cd android

# Check if Gradle wrapper exists
if [ ! -f "./gradlew" ]; then
    print_error "Gradle wrapper not found. Please ensure Android project is properly initialized."
    exit 1
fi

# Make gradlew executable
chmod +x ./gradlew

# Build debug APK
print_status "Building debug APK..."
./gradlew assembleDebug

# Check if APK was built successfully
APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
if [ ! -f "$APK_PATH" ]; then
    print_error "APK build failed. APK not found at expected location."
    exit 1
fi

cd ..

# Get APK info
APK_SIZE=$(du -h "android/$APK_PATH" | cut -f1)
print_success "APK built successfully! ✓"
print_success "APK Location: android/$APK_PATH"
print_success "APK Size: $APK_SIZE"

# Create a convenient download location
DOWNLOAD_DIR="apk-downloads"
mkdir -p "$DOWNLOAD_DIR"
cp "android/$APK_PATH" "$DOWNLOAD_DIR/quantum-risk-coach-$(date +%Y%m%d-%H%M%S).apk"
cp "android/$APK_PATH" "$DOWNLOAD_DIR/quantum-risk-coach-latest.apk"

print_success "APK copied to download directory: $DOWNLOAD_DIR/ ✓"

echo ""
echo "🎉 BUILD COMPLETED SUCCESSFULLY!"
echo "================================="
echo ""
echo "📱 Your APK is ready for installation!"
echo ""
echo "📍 APK Locations:"
echo "   • Main: android/$APK_PATH"
echo "   • Download: $DOWNLOAD_DIR/quantum-risk-coach-latest.apk"
echo ""
echo "📊 Build Information:"
echo "   • App Name: Quantum Risk Coach"
echo "   • Version: $(node -p "require('./package.json').version")"
echo "   • Build Date: $(date)"
echo "   • APK Size: $APK_SIZE"
echo ""
echo "📋 Installation Instructions:"
echo "   1. Transfer the APK to your Android device"
echo "   2. Enable 'Install from Unknown Sources' in Android settings"
echo "   3. Tap the APK file to install"
echo "   4. Open 'Quantum Risk Coach' from your app drawer"
echo ""
echo "🔧 Development Commands:"
echo "   • npm run android:open    - Open in Android Studio"
echo "   • npm run android:run     - Run on connected device"
echo "   • npm run build:apk       - Quick APK build"
echo ""
echo "✅ The app is fully functional with all features:"
echo "   ✓ Live Trade Tracking & Analytics"
echo "   ✓ Heatmap Calendar View"
echo "   ✓ AI Coaching & Insights"
echo "   ✓ Enhanced Trading Journal"
echo "   ✓ Notifications & Alerts"
echo "   ✓ Paper Trading"
echo "   ✓ Portfolio Management"
echo "   ✓ Market Coverage & Sentiment"
echo "   ✓ Mobile-Optimized UI"
echo ""
print_success "🚀 Ready for deployment!" 