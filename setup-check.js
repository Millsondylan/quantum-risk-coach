#!/usr/bin/env node

/**
 * Quantum Risk Coach - Setup Verification Script
 * 
 * This script verifies that your environment is properly configured
 * for the Quantum Risk Coach application.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Quantum Risk Coach - Setup Verification\n');

// Check if .env file exists
console.log('1️⃣ Checking environment file...');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file found');
  
  // Read and check required variables
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];
  
  const missingVars = requiredVars.filter(varName => {
    const regex = new RegExp(`${varName}=(.+)`);
    const match = envContent.match(regex);
    return !match || match[1].trim().startsWith('your_') || match[1].trim() === '';
  });
  
  if (missingVars.length === 0) {
    console.log('✅ Required environment variables are set');
  } else {
    console.log('❌ Missing or incomplete environment variables:');
    missingVars.forEach(varName => console.log(`   - ${varName}`));
  }
} else {
  console.log('❌ .env file not found');
  console.log('📋 Next steps:');
  console.log('   1. Copy env.example to .env');
  console.log('   2. Fill in your Supabase credentials');
  console.log('   3. Run this script again');
}

// Check package.json and dependencies
console.log('\n2️⃣ Checking project structure...');
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  console.log('✅ package.json found');
  
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    console.log('✅ Dependencies installed');
  } else {
    console.log('❌ Dependencies not installed');
    console.log('📋 Run: npm install');
  }
} else {
  console.log('❌ package.json not found - are you in the right directory?');
}

// Check key source files
console.log('\n3️⃣ Checking application files...');
const keyFiles = [
  'src/contexts/AuthContext.tsx',
  'src/integrations/supabase/client.ts',
  'src/lib/databaseSetup.ts'
];

keyFiles.forEach(filePath => {
  if (fs.existsSync(path.join(__dirname, filePath))) {
    console.log(`✅ ${filePath}`);
  } else {
    console.log(`❌ Missing: ${filePath}`);
  }
});

console.log('\n4️⃣ Supabase Configuration Check...');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const supabaseUrl = envContent.match(/VITE_SUPABASE_URL=(.+)/);
  const supabaseKey = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/);
  
  if (supabaseUrl && supabaseUrl[1] && !supabaseUrl[1].includes('your_')) {
    const url = supabaseUrl[1].trim();
    if (url.startsWith('https://') && url.includes('.supabase.co')) {
      console.log('✅ Supabase URL format looks correct');
    } else {
      console.log('⚠️ Supabase URL format may be incorrect');
    }
  } else {
    console.log('❌ Supabase URL not configured');
  }
  
  if (supabaseKey && supabaseKey[1] && !supabaseKey[1].includes('your_')) {
    const key = supabaseKey[1].trim();
    if (key.startsWith('eyJ') && key.length > 100) {
      console.log('✅ Supabase anon key format looks correct');
    } else {
      console.log('⚠️ Supabase anon key format may be incorrect');
    }
  } else {
    console.log('❌ Supabase anon key not configured');
  }
}

console.log('\n📋 Next Steps:');
console.log('1. If environment is ready, start the dev server: npm run dev');
console.log('2. Open the browser console to run setup verification:');
console.log('   - window.verifySetup() // Complete verification');
console.log('   - window.quickHealthCheck() // Quick check');
console.log('3. Follow any instructions shown in the console');
console.log('4. If database tables are missing, run the SQL script in Supabase');

console.log('\n🚀 Ready to start? Run: npm run dev'); 