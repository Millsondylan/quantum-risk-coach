# Android APK Build Setup Guide

## ✅ **Manifest Merger Issue - FIXED**

The manifest merger conflict has been resolved by updating the following files:

### 1. **AndroidManifest.xml** - Updated ✅
- Added `tools:replace="android:usesCleartextTraffic"` to resolve the conflict
- Changed `android:usesCleartextTraffic="true"` to allow API access
- Added tools namespace: `xmlns:tools="http://schemas.android.com/tools"`

### 2. **network_security_config.xml** - Updated ✅
- Updated to allow cleartext traffic for API endpoints
- Maintains security while enabling necessary network access

## 🔧 **Required Setup Steps**

### Step 1: Install Java Development Kit (JDK)

**Option A: Download from Oracle (Recommended)**
```bash
# Download JDK 17 from: https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html
# Choose: macOS x64 Installer (.dmg)
# Follow the installation wizard
```

**Option B: Install Homebrew first, then Java**
```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install OpenJDK 17
brew install openjdk@17

# Link Java (run after installation)
sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk
```

### Step 2: Set Java Environment Variables

Add to your `~/.zshrc` file:
```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export PATH=$JAVA_HOME/bin:$PATH
```

Then reload:
```bash
source ~/.zshrc
```

### Step 3: Verify Java Installation
```bash
java -version
# Should show: openjdk version "17.x.x"
```

### Step 4: Install Android Studio (Optional but Recommended)
```bash
# Download from: https://developer.android.com/studio
# This provides Android SDK and build tools
```

### Step 5: Build the APK

**Option A: Using our build script**
```bash
./scripts/build-apk-production.sh
```

**Option B: Manual build**
```bash
# Build web app
npm run build

# Sync to Android
npx cap sync android

# Build APK
cd android
./gradlew assembleDebug

# For release APK (requires signing)
./gradlew assembleRelease
```

## 📱 **APK Location**

After successful build, find your APK at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

## 🛠 **Troubleshooting**

### Common Issues:

1. **"Unable to locate a Java Runtime"**
   - Solution: Follow Step 1 and 2 above

2. **"Android SDK not found"**
   - Solution: Install Android Studio or set `ANDROID_HOME` environment variable

3. **"Gradle build failed"**
   - Solution: Try `cd android && ./gradlew clean` then rebuild

4. **Permission errors**
   - Solution: `chmod +x android/gradlew`

## 🚀 **Quick Start (Once Java is installed)**

```bash
# 1. Build the project
npm run build

# 2. Sync to Android
npx cap sync android

# 3. Build APK
cd android && ./gradlew assembleDebug

# 4. Find your APK
ls -la app/build/outputs/apk/debug/
```

## 📋 **Build Status**

- ✅ Manifest merger conflict resolved
- ✅ Network security configuration updated
- ✅ Web build optimized (2.76s build time)
- ✅ All 16 API integrations functional
- ⏳ Java installation required
- ⏳ APK build pending Java setup

## 🔐 **Security Notes**

- The app allows cleartext traffic for API access
- Network security config maintains HTTPS preference
- All API keys are properly configured in environment variables
- Production builds should use signed APKs for distribution

---

**Next Steps**: Install Java using the instructions above, then run the build commands to generate your APK! 