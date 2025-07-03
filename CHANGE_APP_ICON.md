# 🎨 How to Change the App Icon

This guide will help you change the app icon for Quantum Risk Coach across all platforms (web and Android).

## 📋 Requirements

Your icon image should be:
- **Format**: PNG, JPG, JPEG, or SVG
- **Size**: At least 1024x1024 pixels (square)
- **Quality**: High resolution, clear at small sizes
- **Style**: Simple, recognizable design that works at 16x16 pixels

## 🚀 Quick Start

### Option 1: Using the Node.js Script (Recommended)

1. **Place your icon image** in the project directory (e.g., `~/Desktop/my-icon.png`)

2. **Run the update script**:
   ```bash
   node scripts/update-app-icon.js ~/Desktop/my-icon.png
   ```

3. **The script will automatically**:
   - ✅ Install Sharp (image processing library) if needed
   - ✅ Create a backup of current icons
   - ✅ Generate all required sizes for web and Android
   - ✅ Replace all icon files

### Option 2: Using the Bash Script (requires ImageMagick)

1. **Install ImageMagick** (if not already installed):
   ```bash
   # macOS
   brew install imagemagick
   
   # Ubuntu/Debian
   sudo apt-get install imagemagick
   
   # Windows
   # Download from https://imagemagick.org/
   ```

2. **Run the bash script**:
   ```bash
   ./scripts/update-app-icon.sh ~/Desktop/my-icon.png
   ```

## 📱 What Gets Updated

### Web Icons
- `public/favicon.ico` - Browser favicon
- `public/qlarity-icon.png` - Main web app icon
- `public/favicon-16x16.png` - Small favicon
- `public/favicon-32x32.png` - Standard favicon
- `public/android-chrome-192x192.png` - Android Chrome icon
- `public/android-chrome-512x512.png` - Large Android Chrome icon

### Android Icons
- `android/app/src/main/res/mipmap-mdpi/` - 48x48 icons
- `android/app/src/main/res/mipmap-hdpi/` - 72x72 icons
- `android/app/src/main/res/mipmap-xhdpi/` - 96x96 icons
- `android/app/src/main/res/mipmap-xxhdpi/` - 144x144 icons
- `android/app/src/main/res/mipmap-xxxhdpi/` - 192x192 icons

## 🔄 After Updating Icons

### 1. Test the Web App
```bash
npm run dev
```
Open http://localhost:8090 and check:
- Browser tab favicon
- App icon in browser bookmarks
- PWA icon when installed

### 2. Build and Test Android App
```bash
npm run build:android
```
Then build the APK to see the new icon on Android devices.

### 3. Verify Manifest (Optional)
Check `public/manifest.json` to ensure icon paths are correct:
```json
{
  "icons": [
    {
      "src": "android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## 🔙 Reverting Changes

If you need to revert to the original icons:
1. Find the backup folder created by the script (e.g., `icon-backup-2024-01-15-10-30-00`)
2. Copy the files back to their original locations
3. Or run the script again with the original icon

## 💡 Design Tips

### Icon Design Best Practices
- **Keep it simple** - Complex designs don't work at small sizes
- **Use high contrast** - Icons should be visible on light and dark backgrounds
- **Test at small sizes** - Your icon should be recognizable at 16x16 pixels
- **Use transparent backgrounds** - The script will handle background processing
- **Avoid text** - Text becomes unreadable at small sizes

### Color Guidelines
- **Primary brand color** - Use your main brand color prominently
- **Contrast** - Ensure good contrast against app backgrounds
- **Accessibility** - Consider colorblind users

### Technical Requirements
- **Square aspect ratio** - Icons must be square (1:1 ratio)
- **High resolution** - Start with at least 1024x1024 pixels
- **PNG format** - Best for transparency and quality
- **File size** - Keep under 1MB for web performance

## 🐛 Troubleshooting

### Common Issues

**"Sharp is not installed"**
```bash
npm install sharp
```

**"ImageMagick not found"**
```bash
# macOS
brew install imagemagick

# Ubuntu
sudo apt-get install imagemagick
```

**"File not found"**
- Make sure the path to your image is correct
- Use absolute paths if needed: `/Users/username/Desktop/my-icon.png`

**Icons look blurry**
- Start with a higher resolution image (2048x2048 or larger)
- Ensure your source image is sharp and clear

**Android icon not updating**
- Clean and rebuild the Android project
- Clear Android Studio cache
- Uninstall and reinstall the app on test devices

### Manual Icon Creation

If the scripts don't work, you can manually create icons:

1. **Web Icons** - Use online tools like:
   - [Favicon.io](https://favicon.io/)
   - [RealFaviconGenerator](https://realfavicongenerator.net/)

2. **Android Icons** - Use Android Studio's Asset Studio:
   - Open Android Studio
   - Right-click on `res` folder
   - New → Image Asset
   - Choose "Launcher Icons"

## 📞 Support

If you encounter issues:
1. Check the console output for error messages
2. Verify your image meets the requirements
3. Try the manual process as a fallback
4. Check the backup folder for original icons

## 🎯 Example Usage

```bash
# Example with a PNG file
node scripts/update-app-icon.js ~/Downloads/quantum-risk-coach-icon.png

# Example with absolute path
node scripts/update-app-icon.js /Users/dylanmillson/Pictures/app-icon.jpg

# Example with SVG file
node scripts/update-app-icon.js ./assets/logo.svg
```

The script will handle all the resizing and placement automatically! 