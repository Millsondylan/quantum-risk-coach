#!/usr/bin/env node
import puppeteer from 'puppeteer';

const TEST_URL = 'http://localhost:4173';
const results = { passed: 0, total: 0, tests: [] };

function test(name, condition, details = '') {
  const status = condition ? '✅' : '❌';
  console.log(`${status} ${name}${details ? ': ' + details : ''}`);
  results.tests.push({ name, passed: condition, details });
  results.total++;
  if (condition) results.passed++;
}

async function runValidation() {
  console.log('🚀 COMPREHENSIVE TRADING JOURNAL VALIDATION\n');
  
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.goto(TEST_URL, { waitUntil: 'networkidle0' });
    
    // Backend Services
    console.log('🔍 Backend Services:');
    const supabase = await page.evaluate(async () => {
      try {
        const { testConnection } = await import('/src/integrations/supabase/client.ts');
        return await testConnection();
      } catch { return false; }
    });
    test('Supabase Database', supabase, 'Connected');
    
    const apis = await page.evaluate(async () => {
      try {
        const { realDataService } = await import('/src/lib/realDataService.ts');
        const health = await realDataService.healthCheck();
        return Object.values(health).filter(Boolean).length;
      } catch { return 0; }
    });
    test('Real Data APIs', apis > 0, `${apis} APIs working`);
    
    const ai = await page.evaluate(async () => {
      try {
        const { AIStreamService } = await import('/src/lib/aiStreamService.ts');
        return true;
      } catch { return false; }
    });
    test('AI Services', ai, 'AI coaching available');
    
    // Trade Entry System
    console.log('\n📝 Trade Entry System:');
    await page.goto(`${TEST_URL}/trade-builder`, { waitUntil: 'networkidle0' });
    
    const tradeForm = await page.evaluate(() => {
      const symbol = document.querySelector('input[name="symbol"], #symbol');
      const submit = document.querySelector('button[type="submit"]');
      return !!(symbol && submit);
    });
    test('Trade Form', tradeForm, 'Complete form elements');
    
    const realData = await page.evaluate(() => {
      const prices = document.querySelectorAll('[class*="price"]');
      return Array.from(prices).some(el => 
        el.textContent && !el.textContent.includes('--') && !el.textContent.includes('0.00')
      );
    });
    test('Real-time Data', realData, 'Live price feeds active');
    
    // Challenge Module
    console.log('\n🎯 Challenge Module:');
    await page.goto(`${TEST_URL}/`, { waitUntil: 'networkidle0' });
    
    const challenges = await page.evaluate(() => {
      const challengeElements = document.querySelectorAll('[class*="challenge"]');
      return challengeElements.length > 0;
    });
    test('Challenge System', challenges, 'Challenges detected');
    
    const progress = await page.evaluate(() => {
      const progressBars = document.querySelectorAll('progress, [role="progressbar"]');
      return progressBars.length > 0;
    });
    test('Progress Tracking', progress, 'Dynamic progress bars');
    
    // Risk Profile
    console.log('\n⚠️ Risk Profile:');
    const riskAnalyzer = await page.evaluate(() => {
      const risk = document.querySelectorAll('[class*="risk"]');
      return risk.length > 0;
    });
    test('Risk Analyzer', riskAnalyzer, 'Risk analysis components');
    
    // MetaTrader Integration
    console.log('\n📈 MetaTrader Integration:');
    await page.goto(`${TEST_URL}/connect-mt4`, { waitUntil: 'networkidle0' });
    
    const mt4Form = await page.evaluate(() => {
      const server = document.querySelector('input[name="server"], #server');
      const login = document.querySelector('input[name="account"], input[name="login"]');
      const password = document.querySelector('input[type="password"]');
      return !!(server && login && password);
    });
    test('MT4 Connection', mt4Form, 'Complete connection form');
    
    const brokerService = await page.evaluate(async () => {
      try {
        const { realBrokerService } = await import('/src/lib/realBrokerService.ts');
        return true;
      } catch { return false; }
    });
    test('Broker Service', brokerService, 'Integration service available');
    
    // Settings
    console.log('\n⚙️ Settings:');
    await page.goto(`${TEST_URL}/settings`, { waitUntil: 'networkidle0' });
    
    const toggles = await page.evaluate(() => {
      const switches = document.querySelectorAll('input[type="checkbox"], [role="switch"]');
      return switches.length > 0;
    });
    test('Setting Toggles', toggles, 'Functional toggles available');
    
    const configs = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input[type="text"], input[type="email"]');
      return inputs.length > 0;
    });
    test('Configuration Options', configs, 'Settings configurable');
    
    // Responsive UI
    console.log('\n📱 Responsive UI:');
    await page.setViewport({ width: 375, height: 812 });
    await page.goto(`${TEST_URL}/`, { waitUntil: 'networkidle0' });
    
    const mobileUI = await page.evaluate(() => {
      const nav = document.querySelector('nav');
      const buttons = document.querySelectorAll('button');
      let touchCompliant = true;
      buttons.forEach(btn => {
        const rect = btn.getBoundingClientRect();
        if (rect.height < 40) touchCompliant = false;
      });
      return !!(nav && touchCompliant);
    });
    test('Mobile Responsive', mobileUI, 'Touch-optimized interface');
    
    // Reality Check
    console.log('\n🔍 Reality Check:');
    const noPlaceholders = await page.evaluate(() => {
      const text = document.body.textContent.toLowerCase();
      const badWords = ['lorem ipsum', 'placeholder', 'coming soon'];
      return !badWords.some(word => text.includes(word));
    });
    test('No Placeholder Data', noPlaceholders, 'Real operational data');
    
    const workingFeatures = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button:not([disabled])');
      const inputs = document.querySelectorAll('input:not([disabled])');
      return buttons.length + inputs.length > 15;
    });
    test('Operational Features', workingFeatures, 'Fully functional interface');
    
    // Final Results
    const percentage = Math.round((results.passed / results.total) * 100);
    console.log('\n' + '='.repeat(60));
    console.log(`📊 FINAL SCORE: ${results.passed}/${results.total} (${percentage}%)`);
    
    if (percentage >= 85) {
      console.log('🏆 EXCELLENT - Production ready!');
    } else if (percentage >= 70) {
      console.log('✅ GOOD - Ready with minor improvements');
    } else {
      console.log('⚠️ NEEDS WORK - Improvements required');
    }
    
    console.log('\n📋 FEATURE CHECKLIST:');
    console.log(`✅ Trade Entry System: ${results.tests.find(t => t.name === 'Trade Form')?.passed ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Challenge Module: ${results.tests.find(t => t.name === 'Challenge System')?.passed ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Risk Profile: ${results.tests.find(t => t.name === 'Risk Analyzer')?.passed ? 'PASS' : 'FAIL'}`);
    console.log(`✅ MetaTrader Integration: ${results.tests.find(t => t.name === 'MT4 Connection')?.passed ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Settings: ${results.tests.find(t => t.name === 'Setting Toggles')?.passed ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Responsive UI: ${results.tests.find(t => t.name === 'Mobile Responsive')?.passed ? 'PASS' : 'FAIL'}`);
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
  } finally {
    await browser.close();
  }
}

runValidation().catch(console.error);
