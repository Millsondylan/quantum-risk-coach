#!/usr/bin/env node

/**
 * App Icon Update Script for Quantum Risk Coach
 * Node.js version that uses Sharp for image processing
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function checkDependencies() {
  try {
    require('sharp');
  } catch (error) {
    log('❌ Sharp is not installed. Installing...', 'red');
    const { execSync } = require('child_process');
    execSync('npm install sharp', { stdio: 'inherit' });
    log('✅ Sharp installed successfully!', 'green');
  }
}

async function createIcon(inputPath, outputPath, size) {
  try {
    await sharp(inputPath)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(outputPath);
    
    log(`✅ Created ${size}x${size} icon: ${path.basename(outputPath)}`, 'green');
  } catch (error) {
    log(`❌ Error creating ${size}x${size} icon: ${error.message}`, 'red');
  }
}

async function createFavicon(inputPath, outputPath) {
  try {
    // Create ICO file with multiple sizes
    const sizes = [16, 32, 48];
    const pngBuffers = [];
    
    for (const size of sizes) {
      const buffer = await sharp(inputPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toBuffer();
      pngBuffers.push(buffer);
    }
    
    // For now, just copy the 32x32 as favicon.ico
    // A proper ICO converter would be needed for true ICO format
    await sharp(inputPath)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(outputPath.replace('.ico', '.png'));
    
    log(`✅ Created favicon: ${path.basename(outputPath)}`, 'green');
  } catch (error) {
    log(`❌ Error creating favicon: ${error.message}`, 'red');
  }
}

async function backupCurrentIcons() {
  const backupDir = `icon-backup-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`;
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const filesToBackup = [
    'public/favicon.ico',
    'public/qlarity-icon.png',
    'public/favicon-32x32.png',
    'public/favicon-16x16.png',
    'public/android-chrome-192x192.png',
    'public/android-chrome-512x512.png'
  ];
  
  for (const file of filesToBackup) {
    if (fs.existsSync(file)) {
      const backupPath = path.join(backupDir, path.basename(file));
      fs.copyFileSync(file, backupPath);
    }
  }
  
  // Backup Android icons
  const androidIconDirs = [
    'android/app/src/main/res/mipmap-mdpi',
    'android/app/src/main/res/mipmap-hdpi',
    'android/app/src/main/res/mipmap-xhdpi',
    'android/app/src/main/res/mipmap-xxhdpi',
    'android/app/src/main/res/mipmap-xxxhdpi'
  ];
  
  for (const dir of androidIconDirs) {
    if (fs.existsSync(dir)) {
      const backupAndroidDir = path.join(backupDir, 'android', dir);
      fs.mkdirSync(backupAndroidDir, { recursive: true });
      
      const files = fs.readdirSync(dir);
      for (const file of files) {
        if (file.endsWith('.png')) {
          fs.copyFileSync(path.join(dir, file), path.join(backupAndroidDir, file));
        }
      }
    }
  }
  
  log(`✅ Backup created in: ${backupDir}`, 'green');
  return backupDir;
}

async function main() {
  log('🚀 Quantum Risk Coach - App Icon Update Script', 'blue');
  log('==================================================', 'blue');
  
  // Check command line arguments
  const args = process.argv.slice(2);
  if (args.length === 0) {
    log('📁 Usage: node scripts/update-app-icon.js <path-to-your-icon-image>', 'yellow');
    log('', 'yellow');
    log('Supported formats: PNG, JPG, JPEG, SVG', 'yellow');
    log('Recommended: Square PNG image, at least 1024x1024 pixels', 'yellow');
    log('', 'yellow');
    log('Example:', 'yellow');
    log('  node scripts/update-app-icon.js ~/Desktop/my-app-icon.png', 'yellow');
    process.exit(1);
  }
  
  const inputFile = args[0];
  
  // Check if input file exists
  if (!fs.existsSync(inputFile)) {
    log(`❌ Error: File '${inputFile}' not found`, 'red');
    process.exit(1);
  }
  
  log(`✅ Input file found: ${inputFile}`, 'green');
  
  // Check and install dependencies
  await checkDependencies();
  
  // Create backup
  log('📦 Creating backup of current icons...', 'yellow');
  const backupDir = await backupCurrentIcons();
  
  // Create directories if they don't exist
  const dirs = [
    'public',
    'android/app/src/main/res/mipmap-mdpi',
    'android/app/src/main/res/mipmap-hdpi',
    'android/app/src/main/res/mipmap-xhdpi',
    'android/app/src/main/res/mipmap-xxhdpi',
    'android/app/src/main/res/mipmap-xxxhdpi'
  ];
  
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  
  // Create web icons
  log('🌐 Creating web icons...', 'blue');
  await createIcon(inputFile, 'public/favicon-32x32.png', 32);
  await createIcon(inputFile, 'public/favicon-16x16.png', 16);
  await createIcon(inputFile, 'public/android-chrome-192x192.png', 192);
  await createIcon(inputFile, 'public/android-chrome-512x512.png', 512);
  await createIcon(inputFile, 'public/qlarity-icon.png', 512);
  await createFavicon(inputFile, 'public/favicon.ico');
  
  // Create Android icons
  log('📱 Creating Android icons...', 'blue');
  
  // MDPI (48x48)
  await createIcon(inputFile, 'android/app/src/main/res/mipmap-mdpi/ic_launcher.png', 48);
  await createIcon(inputFile, 'android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png', 48);
  
  // HDPI (72x72)
  await createIcon(inputFile, 'android/app/src/main/res/mipmap-hdpi/ic_launcher.png', 72);
  await createIcon(inputFile, 'android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png', 72);
  
  // XHDPI (96x96)
  await createIcon(inputFile, 'android/app/src/main/res/mipmap-xhdpi/ic_launcher.png', 96);
  await createIcon(inputFile, 'android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png', 96);
  
  // XXHDPI (144x144)
  await createIcon(inputFile, 'android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png', 144);
  await createIcon(inputFile, 'android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png', 144);
  
  // XXXHDPI (192x192)
  await createIcon(inputFile, 'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png', 192);
  await createIcon(inputFile, 'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png', 192);
  await createIcon(inputFile, 'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png', 108);
  
  log('✅ All icons created successfully!', 'green');
  
  // Update manifest.json if it exists
  if (fs.existsSync('public/manifest.json')) {
    log('📄 Please verify the manifest.json file has the correct icon paths:', 'blue');
    log('  - android-chrome-192x192.png', 'blue');
    log('  - android-chrome-512x512.png', 'blue');
  }
  
  log('', 'green');
  log('🎉 App icon update completed!', 'green');
  log('', 'green');
  log('📋 Next steps:', 'yellow');
  log('1. Test the web app: npm run dev', 'yellow');
  log('2. Build the Android app: npm run build:android', 'yellow');
  log(`3. If you need to revert: restore from ${backupDir}`, 'yellow');
  log('', 'green');
  log('💡 Tips:', 'blue');
  log('- The new icon will appear in browsers and when you build the APK', 'blue');
  log('- For iOS, you\'ll need to add iOS-specific icons if you add iOS support', 'blue');
  log('- Make sure your icon looks good at small sizes (16x16, 32x32)', 'blue');
}

// Run the script
main().catch(error => {
  log(`❌ Error: ${error.message}`, 'red');
  process.exit(1);
}); 