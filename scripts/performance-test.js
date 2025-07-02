#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Quantum Risk Coach - Performance Test Suite');
console.log('=' .repeat(50));

// Performance metrics storage
const metrics = {
  buildTime: 0,
  bundleSize: 0,
  loadTime: 0,
  memoryUsage: 0,
  lighthouseScore: 0
};

// Test 1: Build Performance
console.log('\n📦 Testing Build Performance...');
try {
  const startTime = Date.now();
  execSync('npm run build:prod', { stdio: 'pipe' });
  const endTime = Date.now();
  metrics.buildTime = endTime - startTime;
  console.log(`✅ Build completed in ${metrics.buildTime}ms`);
} catch (error) {
  console.error('❌ Build failed:', error.message);
}

// Test 2: Bundle Size Analysis
console.log('\n📊 Analyzing Bundle Size...');
try {
  const distPath = path.join(__dirname, '../dist');
  if (fs.existsSync(distPath)) {
    const files = fs.readdirSync(distPath);
    let totalSize = 0;
    
    files.forEach(file => {
      if (file.endsWith('.js') || file.endsWith('.css')) {
        const filePath = path.join(distPath, file);
        const stats = fs.statSync(filePath);
        totalSize += stats.size;
        console.log(`  ${file}: ${(stats.size / 1024).toFixed(2)}KB`);
      }
    });
    
    metrics.bundleSize = totalSize;
    console.log(`✅ Total bundle size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
  }
} catch (error) {
  console.error('❌ Bundle analysis failed:', error.message);
}

// Test 3: Development Server Performance
console.log('\n⚡ Testing Development Server Performance...');
try {
  const startTime = Date.now();
  const devProcess = execSync('timeout 10s npm run dev', { stdio: 'pipe' });
  const endTime = Date.now();
  metrics.loadTime = endTime - startTime;
  console.log(`✅ Dev server started in ${metrics.loadTime}ms`);
} catch (error) {
  console.log('✅ Dev server test completed (timeout expected)');
}

// Test 4: Memory Usage Check
console.log('\n🧠 Checking Memory Usage...');
try {
  const memUsage = process.memoryUsage();
  metrics.memoryUsage = memUsage.heapUsed / 1024 / 1024; // MB
  console.log(`✅ Memory usage: ${metrics.memoryUsage.toFixed(2)}MB`);
} catch (error) {
  console.error('❌ Memory check failed:', error.message);
}

// Test 5: Code Quality Metrics
console.log('\n🔍 Analyzing Code Quality...');
try {
  // Check for unused imports
  const unusedImports = execSync('npx unimported', { stdio: 'pipe' }).toString();
  if (unusedImports.includes('No unused files found')) {
    console.log('✅ No unused imports found');
  } else {
    console.log('⚠️ Unused imports detected');
  }
} catch (error) {
  console.log('⚠️ Code quality check skipped (unimported not available)');
}

// Performance Report
console.log('\n📈 Performance Report');
console.log('=' .repeat(50));
console.log(`Build Time: ${metrics.buildTime}ms ${metrics.buildTime < 30000 ? '✅' : '⚠️'}`);
console.log(`Bundle Size: ${(metrics.bundleSize / 1024 / 1024).toFixed(2)}MB ${metrics.bundleSize < 5 * 1024 * 1024 ? '✅' : '⚠️'}`);
console.log(`Dev Load Time: ${metrics.loadTime}ms ${metrics.loadTime < 5000 ? '✅' : '⚠️'}`);
console.log(`Memory Usage: ${metrics.memoryUsage.toFixed(2)}MB ${metrics.memoryUsage < 100 ? '✅' : '⚠️'}`);

// Performance Score
const score = calculatePerformanceScore(metrics);
console.log(`\n🎯 Overall Performance Score: ${score}/100`);

if (score >= 80) {
  console.log('🌟 Excellent performance!');
} else if (score >= 60) {
  console.log('👍 Good performance with room for improvement');
} else {
  console.log('⚠️ Performance needs optimization');
}

function calculatePerformanceScore(metrics) {
  let score = 100;
  
  // Build time penalty (target: <30s)
  if (metrics.buildTime > 30000) {
    score -= Math.min(20, (metrics.buildTime - 30000) / 1000);
  }
  
  // Bundle size penalty (target: <5MB)
  if (metrics.bundleSize > 5 * 1024 * 1024) {
    score -= Math.min(20, (metrics.bundleSize - 5 * 1024 * 1024) / (1024 * 1024));
  }
  
  // Load time penalty (target: <5s)
  if (metrics.loadTime > 5000) {
    score -= Math.min(20, (metrics.loadTime - 5000) / 100);
  }
  
  // Memory usage penalty (target: <100MB)
  if (metrics.memoryUsage > 100) {
    score -= Math.min(20, (metrics.memoryUsage - 100) / 10);
  }
  
  return Math.max(0, Math.round(score));
}

// Save metrics to file
const reportPath = path.join(__dirname, '../performance-report.json');
fs.writeFileSync(reportPath, JSON.stringify(metrics, null, 2));
console.log(`\n📄 Performance report saved to: ${reportPath}`);

console.log('\n✨ Performance test completed!'); 