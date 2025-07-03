#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

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

function createIconCanvas(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Fill background with dark blue/gray
  ctx.fillStyle = '#2D3748';
  ctx.fillRect(0, 0, size, size);
  
  // Draw "Qlarity" text
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Scale font size based on canvas size
  const fontSize = size * 0.18; // 18% of canvas size
  ctx.font = `${fontSize}px Arial, sans-serif`;
  
  // Draw text in center
  ctx.fillText('Qlarity', size / 2, size / 2);
  
  return canvas;
}

async function generateIcon(outputPath, size) {
  try {
    const canvas = createIconCanvas(size);
    const buffer = canvas.toBuffer('image/png');
    
    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, buffer);
    log(`✅ Created ${size}x${size} icon: ${path.basename(outputPath)}`, 'green');
  } catch (error) {
    log(`❌ Error creating ${size}x${size} icon: ${error.message}`, 'red');
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
  log('🚀 Quantum Risk Coach - Qlarity Icon Generator', 'blue');
  log('===============================================', 'blue');
  
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
  await generateIcon('public/favicon-32x32.png', 32);
  await generateIcon('public/favicon-16x16.png', 16);
  await generateIcon('public/android-chrome-192x192.png', 192);
  await generateIcon('public/android-chrome-512x512.png', 512);
  await generateIcon('public/qlarity-icon.png', 512);
  
  // Create favicon.ico (copy from 32x32)
  if (fs.existsSync('public/favicon-32x32.png')) {
    fs.copyFileSync('public/favicon-32x32.png', 'public/favicon.ico');
    log('✅ Created favicon.ico from 32x32 icon', 'green');
  }
  
  // Create Android icons
  log('📱 Creating Android icons...', 'blue');
  
  // MDPI (48x48)
  await generateIcon('android/app/src/main/res/mipmap-mdpi/ic_launcher.png', 48);
  await generateIcon('android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png', 48);
  
  // HDPI (72x72)
  await generateIcon('android/app/src/main/res/mipmap-hdpi/ic_launcher.png', 72);
  await generateIcon('android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png', 72);
  
  // XHDPI (96x96)
  await generateIcon('android/app/src/main/res/mipmap-xhdpi/ic_launcher.png', 96);
  await generateIcon('android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png', 96);
  
  // XXHDPI (144x144)
  await generateIcon('android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png', 144);
  await generateIcon('android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png', 144);
  
  // XXXHDPI (192x192)
  await generateIcon('android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png', 192);
  await generateIcon('android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png', 192);
  await generateIcon('android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png', 108);
  
  log('✅ All Qlarity icons created successfully!', 'green');
  
  // Update manifest.json if it exists
  if (fs.existsSync('public/manifest.json')) {
    log('📄 Manifest.json file will use the new icon paths automatically', 'blue');
  }
  
  log('', 'green');
  log('🎉 Qlarity app icon update completed!', 'green');
  log('', 'green');
  log('📋 Next steps:', 'yellow');
  log('1. Test the web app: npm run dev', 'yellow');
  log('2. Build the Android app: npm run build:android', 'yellow');
  log(`3. If you need to revert: restore from ${backupDir}`, 'yellow');
  log('', 'green');
  log('💡 What was created:', 'blue');
  log('- All web icons (favicon, PWA icons)', 'blue');
  log('- All Android icons (all densities)', 'blue');
  log('- Qlarity branding with dark blue background', 'blue');
}

// Run the script
main().catch(error => {
  log(`❌ Error: ${error.message}`, 'red');
  process.exit(1);
}); 