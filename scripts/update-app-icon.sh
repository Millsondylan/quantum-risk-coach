#!/bin/bash

# App Icon Update Script for Quantum Risk Coach
# This script helps replace the app icon with a new image

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Quantum Risk Coach - App Icon Update Script${NC}"
echo "=================================================="

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo -e "${RED}❌ ImageMagick is not installed. Please install it first:${NC}"
    echo "   macOS: brew install imagemagick"
    echo "   Ubuntu: sudo apt-get install imagemagick"
    echo "   Windows: Download from https://imagemagick.org/"
    exit 1
fi

# Check if input file is provided
if [ $# -eq 0 ]; then
    echo -e "${YELLOW}📁 Usage: $0 <path-to-your-icon-image>${NC}"
    echo ""
    echo "Supported formats: PNG, JPG, JPEG, SVG"
    echo "Recommended: Square PNG image, at least 1024x1024 pixels"
    echo ""
    echo "Example:"
    echo "  $0 ~/Desktop/my-app-icon.png"
    exit 1
fi

INPUT_FILE="$1"

# Check if input file exists
if [ ! -f "$INPUT_FILE" ]; then
    echo -e "${RED}❌ Error: File '$INPUT_FILE' not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Input file found: $INPUT_FILE${NC}"

# Create backup directory
BACKUP_DIR="icon-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}📦 Creating backup of current icons...${NC}"

# Backup current icons
cp -r public/favicon.ico "$BACKUP_DIR/" 2>/dev/null || true
cp -r public/qlarity-icon.png "$BACKUP_DIR/" 2>/dev/null || true
cp -r android/app/src/main/res/mipmap-* "$BACKUP_DIR/" 2>/dev/null || true

echo -e "${GREEN}✅ Backup created in: $BACKUP_DIR${NC}"

# Function to create icon with specific size
create_icon() {
    local size=$1
    local output_path=$2
    local format=${3:-png}
    
    echo "Creating ${size}x${size} icon..."
    convert "$INPUT_FILE" -resize "${size}x${size}" -background transparent -gravity center -extent "${size}x${size}" "$output_path"
}

# Create web icons
echo -e "${BLUE}🌐 Creating web icons...${NC}"
create_icon 32 "public/favicon-32x32.png"
create_icon 16 "public/favicon-16x16.png"
create_icon 192 "public/android-chrome-192x192.png"
create_icon 512 "public/android-chrome-512x512.png"

# Create favicon.ico (16x16, 32x32, 48x48)
echo "Creating favicon.ico..."
convert "$INPUT_FILE" -resize 16x16 public/favicon-16x16.png
convert "$INPUT_FILE" -resize 32x32 public/favicon-32x32.png
convert "$INPUT_FILE" -resize 48x48 public/favicon-48x48.png
convert public/favicon-16x16.png public/favicon-32x32.png public/favicon-48x48.png public/favicon.ico

# Create main web app icon
create_icon 512 "public/qlarity-icon.png"

# Create Android icons
echo -e "${BLUE}📱 Creating Android icons...${NC}"

# MDPI (48x48)
create_icon 48 "android/app/src/main/res/mipmap-mdpi/ic_launcher.png"
create_icon 48 "android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png"

# HDPI (72x72)
create_icon 72 "android/app/src/main/res/mipmap-hdpi/ic_launcher.png"
create_icon 72 "android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png"

# XHDPI (96x96)
create_icon 96 "android/app/src/main/res/mipmap-xhdpi/ic_launcher.png"
create_icon 96 "android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png"

# XXHDPI (144x144)
create_icon 144 "android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png"
create_icon 144 "android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png"

# XXXHDPI (192x192)
create_icon 192 "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png"
create_icon 192 "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png"

# Create adaptive icon foreground (108x108 for xxxhdpi)
create_icon 108 "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png"

echo -e "${GREEN}✅ All icons created successfully!${NC}"

# Update manifest.json if it exists
if [ -f "public/manifest.json" ]; then
    echo -e "${BLUE}📄 Updating manifest.json...${NC}"
    # This is a simple update - you might want to manually verify the manifest
    echo "Please verify the manifest.json file has the correct icon paths:"
    echo "  - android-chrome-192x192.png"
    echo "  - android-chrome-512x512.png"
fi

echo ""
echo -e "${GREEN}🎉 App icon update completed!${NC}"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "1. Test the web app: npm run dev"
echo "2. Build the Android app: npm run build:android"
echo "3. If you need to revert: restore from $BACKUP_DIR"
echo ""
echo -e "${BLUE}💡 Tips:${NC}"
echo "- The new icon will appear in browsers and when you build the APK"
echo "- For iOS, you'll need to add iOS-specific icons if you add iOS support"
echo "- Make sure your icon looks good at small sizes (16x16, 32x32)" 