# 📱 APK Build Solutions for Quantum Risk Coach

## 🚨 Current Issue
Java Runtime Environment (JRE) is not installed on your system, which is required for building Android APKs.

## 🔧 Solution 1: Install Java and Build Locally

### Step 1: Install Java JDK 11
```bash
# Option A: Download from Oracle
# Visit: https://www.oracle.com/java/technologies/javase/jdk11-archive-downloads.html
# Download and install JDK 11 for macOS

# Option B: Use SDKMAN (if available)
curl -s "https://get.sdkman.io" | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"
sdk install java 11.0.21-zulu

# Option C: Manual installation
# Download OpenJDK 11 from: https://adoptium.net/
```

### Step 2: Set JAVA_HOME
```bash
# Add to your ~/.zshrc file
echo 'export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-11.jdk/Contents/Home' >> ~/.zshrc
echo 'export PATH=$JAVA_HOME/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
```

### Step 3: Build APK
```bash
# Navigate to android directory
cd android

# Build APK
./gradlew assembleDebug

# APK will be created at:
# android/app/build/outputs/apk/debug/app-debug.apk
```

## 🎯 Solution 2: Use Android Studio (Recommended)

### Step 1: Install Android Studio
1. Download from: https://developer.android.com/studio
2. Install and open Android Studio
3. Open the `android` folder from your project

### Step 2: Build APK in Android Studio
1. Open the project in Android Studio
2. Wait for Gradle sync to complete
3. Go to **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
4. APK will be generated in `android/app/build/outputs/apk/debug/`

## ☁️ Solution 3: Cloud Build Services

### Option A: GitHub Actions (Free)
Create `.github/workflows/build-apk.yml`:
```yaml
name: Build APK
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Set up JDK 11
      uses: actions/setup-java@v2
      with:
        java-version: '11'
        distribution: 'adopt'
    - name: Build APK
      run: |
        cd android
        ./gradlew assembleDebug
    - name: Upload APK
      uses: actions/upload-artifact@v2
      with:
        name: app-debug
        path: android/app/build/outputs/apk/debug/app-debug.apk
```

### Option B: Use Online APK Builders
- **Appetize.io** - Upload your project and build online
- **Expo EAS Build** - If you convert to Expo
- **GitHub Codespaces** - Build in cloud environment

## 📱 Solution 4: Alternative - Progressive Web App (PWA)

Since your app is already built as a web app, you can install it as a PWA:

### Step 1: Deploy to Web
```bash
# Deploy to Vercel (free)
npx vercel

# Or deploy to Netlify
npm run build
# Drag dist folder to netlify.com
```

### Step 2: Install as PWA
1. Open your deployed website on Android
2. Chrome will show "Add to Home Screen" option
3. Install the app like a native app
4. Works offline and has app-like experience

## 🚀 Quick Fix: Use Capacitor Live Reload

For development and testing:
```bash
# Install on connected device
npx cap run android

# Or open in Android Studio
npx cap open android
```

## 📋 Prerequisites Checklist

- [ ] Java JDK 11 installed
- [ ] Android Studio installed (optional but recommended)
- [ ] Android SDK installed
- [ ] ANDROID_HOME environment variable set
- [ ] Device connected or emulator running

## 🔍 Troubleshooting

### Java Issues
```bash
# Check Java installation
java -version
javac -version

# Set JAVA_HOME manually
export JAVA_HOME=$(/usr/libexec/java_home -v 11)
```

### Gradle Issues
```bash
# Clean and rebuild
cd android
./gradlew clean
./gradlew assembleDebug
```

### Android SDK Issues
```bash
# Check Android SDK location
echo $ANDROID_HOME

# Set if missing
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

## 🎯 Recommended Approach

1. **For Quick Testing:** Use PWA approach (deploy to web, install as PWA)
2. **For Development:** Install Android Studio and build locally
3. **For Production:** Use GitHub Actions for automated builds

## 📱 APK Location (After Successful Build)

The APK will be located at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

## 🚀 Next Steps

1. Choose your preferred solution above
2. Follow the installation steps
3. Build your APK
4. Install on your Android device
5. Configure API keys in the app
6. Start using your Quantum Risk Coach!

---

**Need Help?** Check the main README.md for detailed setup instructions or open an issue on GitHub. 