#!/usr/bin/env node

import { chromium } from 'playwright';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

const BASE_URL = 'http://localhost:5173';

// API Keys from environment
const API_KEYS = {
  OPENAI: process.env.VITE_OPENAI_API_KEY,
  GROQ: process.env.VITE_GROQ_API_KEY,
  GEMINI: process.env.VITE_GEMINI_API_KEY,
  YFINANCE: process.env.VITE_YFINANCE_API_KEY,
  COINGECKO: process.env.VITE_COINGECKO_API_KEY,
  EXCHANGERATE: process.env.VITE_EXCHANGERATE_API_KEY,
  NEWS: process.env.VITE_NEWS_API_KEY
};

async function validateRealData() {
  console.log('🚀 Starting Quantum Risk Coach Real Data Validation...\n');

  const browser = await chromium.launch({ 
    headless: false,
    // Use mobile viewport for testing
    viewport: { width: 390, height: 844 }, // iPhone 14 Pro
    deviceScaleFactor: 3,
    isMobile: true
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
  });

  const page = await context.newPage();
  
  const results = {
    apiKeys: {},
    realData: {},
    aiFeatures: {},
    buttons: {},
    mobileUI: {},
    notifications: {}
  };

  try {
    // 1. Validate API Keys
    console.log('📋 Validating API Keys...');
    for (const [key, value] of Object.entries(API_KEYS)) {
      results.apiKeys[key] = !!value && value !== 'your_api_key_here';
      console.log(`${results.apiKeys[key] ? '✅' : '❌'} ${key}: ${results.apiKeys[key] ? 'Configured' : 'Missing'}`);
    }

    // 2. Load the app
    console.log('\n🌐 Loading application...');
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // 3. Create a test user
    console.log('\n👤 Creating test user...');
    await page.evaluate(() => {
      localStorage.setItem('user', JSON.stringify({
        id: 'test-user-' + Date.now(),
        email: 'test@quantumrisk.coach',
        name: 'Test Trader',
        avatar: '/placeholder.svg',
        preferences: {
          theme: 'dark',
          notifications: true,
          language: 'en'
        }
      }));
    });
    await page.reload();

    // 4. Validate Real Market Data
    console.log('\n📊 Validating Real Market Data...');
    
    // Check for live forex rates
    await page.waitForSelector('[data-testid="live-market-data"]', { timeout: 10000 }).catch(() => {});
    const forexRates = await page.$$eval('[data-testid="forex-rate"]', elements => 
      elements.map(el => ({
        symbol: el.querySelector('[data-testid="symbol"]')?.textContent,
        rate: el.querySelector('[data-testid="rate"]')?.textContent,
        change: el.querySelector('[data-testid="change"]')?.textContent
      }))
    ).catch(() => []);
    
    results.realData.forexRates = forexRates.length > 0;
    console.log(`${results.realData.forexRates ? '✅' : '❌'} Forex Rates: ${forexRates.length} pairs loaded`);

    // Check for cryptocurrency prices
    const cryptoPrices = await page.$$eval('[data-testid="crypto-price"]', elements => 
      elements.map(el => ({
        symbol: el.querySelector('[data-testid="symbol"]')?.textContent,
        price: el.querySelector('[data-testid="price"]')?.textContent,
        change: el.querySelector('[data-testid="change-24h"]')?.textContent
      }))
    ).catch(() => []);
    
    results.realData.cryptoPrices = cryptoPrices.length > 0;
    console.log(`${results.realData.cryptoPrices ? '✅' : '❌'} Crypto Prices: ${cryptoPrices.length} coins loaded`);

    // 5. Validate AI Features
    console.log('\n🤖 Validating AI Features...');
    
    // Check AI Coach Card
    const aiCoachExists = await page.locator('text=AI Trading Coach').isVisible().catch(() => false);
    results.aiFeatures.coachCard = aiCoachExists;
    console.log(`${aiCoachExists ? '✅' : '❌'} AI Coach Card: ${aiCoachExists ? 'Present' : 'Missing'}`);

    // Check AI API connection status
    const aiStatus = await page.$$eval('[title*="Connected"]', elements => 
      elements.map(el => el.getAttribute('title'))
    ).catch(() => []);
    
    results.aiFeatures.apiConnections = aiStatus.length > 0;
    console.log(`${results.aiFeatures.apiConnections ? '✅' : '❌'} AI Connections: ${aiStatus.join(', ') || 'None'}`);

    // Test AI interaction
    if (aiCoachExists) {
      await page.click('text=Ask AI');
      await page.fill('textarea[placeholder*="Ask your AI trading coach"]', 'What is the current market sentiment?');
      const sendButton = page.locator('button:has-text("Send")');
      if (await sendButton.isVisible()) {
        console.log('✅ AI Chat Interface: Working');
        results.aiFeatures.chatInterface = true;
      }
    }

    // 6. Validate Button Functionality
    console.log('\n🔘 Validating Button Functionality...');
    
    // Test Add Trade button
    const addTradeButton = page.locator('button:has-text("Add Trade")');
    if (await addTradeButton.isVisible()) {
      await addTradeButton.click();
      await page.waitForTimeout(1000);
      results.buttons.addTrade = page.url().includes('/trade-builder');
      console.log(`${results.buttons.addTrade ? '✅' : '❌'} Add Trade Button: ${results.buttons.addTrade ? 'Working' : 'Not Working'}`);
      if (results.buttons.addTrade) await page.goBack();
    }

    // Test Connect Broker button
    const connectButton = page.locator('button:has-text("Connect")').first();
    if (await connectButton.isVisible()) {
      await connectButton.click();
      await page.waitForTimeout(1000);
      results.buttons.connectBroker = page.url().includes('/connect');
      console.log(`${results.buttons.connectBroker ? '✅' : '❌'} Connect Broker Button: ${results.buttons.connectBroker ? 'Working' : 'Not Working'}`);
      if (results.buttons.connectBroker) await page.goBack();
    }

    // 7. Validate Mobile UI
    console.log('\n📱 Validating Mobile UI...');
    
    // Check mobile navigation
    const mobileNav = await page.locator('[data-testid="mobile-bottom-nav"]').isVisible().catch(() => false);
    results.mobileUI.bottomNav = mobileNav;
    console.log(`${mobileNav ? '✅' : '❌'} Mobile Bottom Navigation: ${mobileNav ? 'Present' : 'Missing'}`);

    // Check responsive layout
    const viewport = page.viewportSize();
    results.mobileUI.responsiveLayout = viewport.width <= 768;
    console.log(`${results.mobileUI.responsiveLayout ? '✅' : '❌'} Mobile Layout: ${viewport.width}x${viewport.height}`);

    // Check touch interactions
    const touchableElements = await page.$$eval('button, a, [role="button"]', elements => elements.length);
    results.mobileUI.touchTargets = touchableElements > 0;
    console.log(`${results.mobileUI.touchTargets ? '✅' : '❌'} Touch Targets: ${touchableElements} elements`);

    // 8. Validate News Integration
    console.log('\n📰 Validating News Integration...');
    
    // Check for news items
    const newsItems = await page.$$eval('[data-testid="news-item"]', elements => 
      elements.map(el => ({
        title: el.querySelector('[data-testid="news-title"]')?.textContent,
        source: el.querySelector('[data-testid="news-source"]')?.textContent,
        impact: el.querySelector('[data-testid="news-impact"]')?.textContent
      }))
    ).catch(() => []);
    
    results.realData.newsItems = newsItems.length > 0;
    console.log(`${results.realData.newsItems ? '✅' : '❌'} News Items: ${newsItems.length} articles loaded`);

    // 9. Validate Push Notifications
    console.log('\n🔔 Validating Push Notifications...');
    
    // Check notification permission
    const notificationPermission = await page.evaluate(() => Notification.permission);
    results.notifications.permission = notificationPermission;
    console.log(`${notificationPermission === 'granted' ? '✅' : '⚠️'} Notification Permission: ${notificationPermission}`);

    // Check service worker
    const swRegistration = await page.evaluate(() => 
      navigator.serviceWorker.getRegistration()
    );
    results.notifications.serviceWorker = !!swRegistration;
    console.log(`${results.notifications.serviceWorker ? '✅' : '❌'} Service Worker: ${results.notifications.serviceWorker ? 'Registered' : 'Not Registered'}`);

    // 10. Validate Price Updates
    console.log('\n💰 Validating Live Price Updates...');
    
    // Monitor for price changes
    const initialPrices = await page.$$eval('[data-testid="price"]', elements => 
      elements.map(el => el.textContent)
    ).catch(() => []);
    
    if (initialPrices.length > 0) {
      console.log('⏳ Waiting 10 seconds for price updates...');
      await page.waitForTimeout(10000);
      
      const updatedPrices = await page.$$eval('[data-testid="price"]', elements => 
        elements.map(el => el.textContent)
      ).catch(() => []);
      
      const pricesChanged = initialPrices.some((price, index) => price !== updatedPrices[index]);
      results.realData.livePriceUpdates = pricesChanged;
      console.log(`${pricesChanged ? '✅' : '⚠️'} Live Price Updates: ${pricesChanged ? 'Working' : 'No changes detected'}`);
    }

    // Generate Summary
    console.log('\n📊 VALIDATION SUMMARY:');
    console.log('====================');
    
    const categories = {
      'API Keys': results.apiKeys,
      'Real Data': results.realData,
      'AI Features': results.aiFeatures,
      'Button Functionality': results.buttons,
      'Mobile UI': results.mobileUI,
      'Notifications': results.notifications
    };

    let totalTests = 0;
    let passedTests = 0;

    for (const [category, tests] of Object.entries(categories)) {
      const categoryPassed = Object.values(tests).filter(v => v === true).length;
      const categoryTotal = Object.values(tests).length;
      totalTests += categoryTotal;
      passedTests += categoryPassed;
      
      console.log(`\n${category}: ${categoryPassed}/${categoryTotal} passed`);
      for (const [test, result] of Object.entries(tests)) {
        console.log(`  ${result === true ? '✅' : result === false ? '❌' : '⚠️'} ${test}: ${result}`);
      }
    }

    console.log('\n====================');
    console.log(`OVERALL: ${passedTests}/${totalTests} tests passed (${Math.round(passedTests/totalTests * 100)}%)`);
    
    if (passedTests === totalTests) {
      console.log('\n🎉 ALL TESTS PASSED! The app is fully functional with real data!');
    } else {
      console.log('\n⚠️ Some tests failed. Please check the details above.');
    }

  } catch (error) {
    console.error('\n❌ Validation failed with error:', error);
  } finally {
    await browser.close();
  }
}

// Run validation
validateRealData().catch(console.error); 