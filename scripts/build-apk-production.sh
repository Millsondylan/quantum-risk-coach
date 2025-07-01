#!/bin/bash

# Quantum Risk Coach - Production APK Build Script
# This script builds a production-ready APK with all API integrations

echo "🚀 Building Quantum Risk Coach APK - Production Version"
echo "=================================================="

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

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found, creating from template"
    cp env.example .env
    print_warning "Please edit .env file with your API keys before continuing"
    read -p "Press Enter once you've updated .env file..."
fi

# Validate required environment variables
print_status "Validating environment variables..."

required_vars=(
    "VITE_SUPABASE_URL"
    "VITE_SUPABASE_ANON_KEY"
    "VITE_OPENAI_API_KEY"
    "VITE_GROQ_API_KEY"
    "VITE_GEMINI_API_KEY"
    "VITE_NEWS_API_KEY"
    "VITE_ALPHA_VANTAGE_API_KEY"
)

missing_vars=()
for var in "${required_vars[@]}"; do
    if ! grep -q "^$var=" .env || grep -q "^$var=your_.*_here" .env; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    print_error "Missing or placeholder values for required environment variables:"
    printf '%s\n' "${missing_vars[@]}"
    exit 1
fi

print_success "Environment variables validated"

# Build web assets
print_status "Building web assets for production..."
npm run build
if [ $? -ne 0 ]; then
    print_error "Web build failed"
    exit 1
fi
print_success "Web assets built successfully"

# Sync Capacitor
print_status "Syncing Capacitor..."
npx cap copy android
npx cap sync android
if [ $? -ne 0 ]; then
    print_error "Capacitor sync failed"
    exit 1
fi
print_success "Capacitor sync completed"

# Build APK
print_status "Building APK..."
cd android

# Build release APK
print_status "Building release APK (this may take a few minutes)..."
./gradlew assembleRelease
if [ $? -ne 0 ]; then
    print_error "APK build failed"
    exit 1
fi

# Get APK info
APK_PATH="app/build/outputs/apk/release/app-release-unsigned.apk"
APK_SIZE=$(ls -lh "$APK_PATH" | awk '{print $5}')
print_success "APK built successfully!"
print_success "APK Size: $APK_SIZE"

cd ..

# Create output directory
OUTPUT_DIR="apk-builds"
mkdir -p "$OUTPUT_DIR"

# Copy APK to output directory with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
OUTPUT_APK="$OUTPUT_DIR/quantum-risk-coach-v1.0.0-$TIMESTAMP.apk"
cp "android/$APK_PATH" "$OUTPUT_APK"

print_success "APK copied to: $OUTPUT_APK"

echo ""
echo "🎉 APK Build Complete!"
echo "📱 Your APK is ready at: $OUTPUT_APK"
echo "🚀 Your Quantum Risk Coach app is ready to launch!" 