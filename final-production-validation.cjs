#!/usr/bin/env node

/**
 * Final Production Validation Script
 * Comprehensive check for demo/mock data in Quantum Risk Coach
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 QUANTUM RISK COACH - FINAL PRODUCTION VALIDATION');
console.log('=====================================================\n');

const issues = [];
const srcDir = path.join(__dirname, 'src');

// Files to check for demo/mock data
const filesToCheck = [
  'src/components/LiveTradeMonitor.tsx',
  'src/components/PortfolioManager.tsx', 
  'src/components/EnhancedTradingJournal.tsx',
  'src/components/MT4Connection.tsx',
  'src/components/EnhancedUltraTraderDashboard.tsx',
  'src/components/CalendarView.tsx',
  'src/components/Backtesting.tsx',
  'src/components/PaperTrading.tsx',
  'src/pages/Auth.tsx',
  'src/lib/localUserUtils.ts'
];

// Patterns that indicate demo/mock data
const demoPatterns = [
  /demo|Demo|DEMO/g,
  /mock|Mock|MOCK/g,
  /fake|Fake|FAKE/g,
  /test.*data|Test.*Data/g,
  /placeholder.*data|Placeholder.*Data/g,
  /hardcoded|Hardcoded/g,
  /generateMock/g,
  /mockTransactions/g,
  /Demo Broker/g,
  /accountType.*Demo/g
];

function checkFile(filePath) {
  if (!fs.existsSync(filePath)) {
    issues.push({
      file: filePath,
      type: 'MISSING',
      message: 'File not found'
    });
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    demoPatterns.forEach(pattern => {
      const matches = line.match(pattern);
      if (matches) {
        matches.forEach(match => {
          issues.push({
            file: filePath,
            line: index + 1,
            type: 'DEMO_DATA',
            pattern: match,
            context: line.trim()
          });
        });
      }
    });
  });
}

// Check critical authentication flows
function checkAuthSystem() {
  console.log('🔐 Checking Authentication System...');
  
  const authFiles = [
    'src/pages/Auth.tsx',
    'src/lib/localUserUtils.ts',
    'src/contexts/AuthContext.tsx'
  ];
  
  authFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for demo login buttons
      if (content.includes('Demo Login') || content.includes('Quick Demo')) {
        issues.push({
          file,
          type: 'AUTH_ISSUE',
          message: 'Demo login functionality detected'
        });
      }
      
      // Check for demo user creation
      if (content.includes('createDemoUser') || content.includes('setupDemoData')) {
        issues.push({
          file,
          type: 'AUTH_ISSUE', 
          message: 'Demo user creation functions detected'
        });
      }
    }
  });
}

// Check broker integration
function checkBrokerIntegration() {
  console.log('🏦 Checking Broker Integration...');
  
  const brokerFiles = [
    'src/lib/realBrokerService.ts',
    'src/components/BrokerIntegration.tsx',
    'src/components/MT4Connection.tsx'
  ];
  
  brokerFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for proper real broker validation
      if (!content.includes('validateConnection') && file.includes('realBrokerService')) {
        issues.push({
          file,
          type: 'BROKER_ISSUE',
          message: 'Missing proper broker validation'
        });
      }
    }
  });
}

// Check data sources
function checkDataSources() {
  console.log('📊 Checking Data Sources...');
  
  const dataFiles = [
    'src/components/PortfolioManager.tsx',
    'src/components/EnhancedTradingJournal.tsx',
    'src/hooks/useTrades.ts'
  ];
  
  dataFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for real database connections
      if (!content.includes('supabase') && !content.includes('realBrokerService')) {
        issues.push({
          file,
          type: 'DATA_ISSUE',
          message: 'No real data source connection detected'
        });
      }
    }
  });
}

// Run all checks
console.log('🔍 Scanning files for demo/mock data...\n');

filesToCheck.forEach(file => {
  console.log(`Checking ${file}...`);
  checkFile(file);
});

checkAuthSystem();
checkBrokerIntegration(); 
checkDataSources();

// Generate report
console.log('\n📋 VALIDATION REPORT');
console.log('===================\n');

if (issues.length === 0) {
  console.log('✅ No issues found! Your app appears to be production-ready.');
} else {
  console.log(`❌ Found ${issues.length} issues that need to be addressed:\n`);
  
  // Group issues by type
  const groupedIssues = issues.reduce((acc, issue) => {
    if (!acc[issue.type]) acc[issue.type] = [];
    acc[issue.type].push(issue);
    return acc;
  }, {});
  
  Object.entries(groupedIssues).forEach(([type, typeIssues]) => {
    console.log(`\n🚨 ${type} (${typeIssues.length} issues):`);
    console.log('─'.repeat(50));
    
    typeIssues.forEach(issue => {
      console.log(`📁 ${issue.file}`);
      if (issue.line) console.log(`   Line ${issue.line}: ${issue.context}`);
      if (issue.pattern) console.log(`   Pattern: "${issue.pattern}"`);
      if (issue.message) console.log(`   Issue: ${issue.message}`);
      console.log('');
    });
  });
}

// Provide action plan
console.log('\n🎯 ACTION PLAN FOR PRODUCTION READINESS');
console.log('======================================\n');

console.log('1. 🔐 AUTHENTICATION (CRITICAL)');
console.log('   ✅ Remove all demo login functionality');
console.log('   ✅ Ensure only real user registration/signin');
console.log('   ✅ Remove demo user creation functions');

console.log('\n2. 💰 PORTFOLIO DATA (CRITICAL)');
console.log('   ✅ Replace mock transactions with real database');
console.log('   ✅ Connect to real broker account balances');
console.log('   ✅ Implement proper withdrawal/deposit tracking');

console.log('\n3. 📈 TRADING DATA (CRITICAL)');
console.log('   ✅ Remove demo broker references');
console.log('   ✅ Connect journal to real trades via useTrades hook');
console.log('   ✅ Use real performance metrics calculations');

console.log('\n4. 🏦 BROKER CONNECTIONS (CRITICAL)');
console.log('   ✅ Remove demo account options in MT4/MT5');
console.log('   ✅ Ensure only live trading accounts accepted');
console.log('   ✅ Remove mock connection simulations');

console.log('\n5. 📊 DASHBOARD DATA (HIGH)');
console.log('   ✅ Remove demo data fallbacks');
console.log('   ✅ Show connection prompts instead of fake data');
console.log('   ✅ Use only real market data from APIs');

console.log('\n6. 🗓️ CALENDAR & ANALYTICS (MEDIUM)');
console.log('   ✅ Replace mock calendar data with real trade history');
console.log('   ✅ Connect backtesting to real historical data');
console.log('   ✅ Remove placeholder data in all components');

console.log('\n📝 IMMEDIATE ACTIONS REQUIRED:');
console.log('=============================');

console.log('\n1. Update LiveTradeMonitor.tsx:');
console.log('   - Remove all "Demo Broker" references');
console.log('   - Connect to realBrokerService for live data');

console.log('\n2. Fix PortfolioManager.tsx:');
console.log('   - Replace mockTransactions with Supabase query');
console.log('   - Add portfolio_transactions table schema');

console.log('\n3. Update EnhancedTradingJournal.tsx:');
console.log('   - Connect to useTrades hook for real data');
console.log('   - Remove hardcoded performance metrics');

console.log('\n4. Fix MT4Connection.tsx:');
console.log('   - Remove Demo account type option');
console.log('   - Remove mock connection simulation');

console.log('\n5. Database Schema Required:');
console.log('   - portfolio_transactions table');
console.log('   - Enhanced trades table with journal fields');

console.log('\n✨ Once these fixes are complete, your app will be 100% production-ready!');
console.log('\n🎉 No more demo data - only real trading data from connected brokers!'); 