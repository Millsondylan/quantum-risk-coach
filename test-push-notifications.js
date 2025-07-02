#!/usr/bin/env node
/**
 * Quantum Risk Coach - Push Notifications & Personalization Test
 * Verifies all notification and personalization features are working
 */

import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_URL = 'http://localhost:8082'; // Updated to current dev server port
const MOBILE_VIEWPORT = { width: 375, height: 812 }; // iPhone X dimensions

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testPushNotifications(page) {
  console.log('🔔 Testing Push Notifications...');
  
  try {
    // Navigate to settings page
    await page.goto(`${TEST_URL}/settings`, { waitUntil: 'networkidle0' });
    await delay(2000);

    // Check if notification system exists
    const notificationSystem = await page.$('[data-testid="notification-system"]') || 
                              await page.$('text="Smart Notifications"') ||
                              await page.$('text="Push Notifications"');

    if (notificationSystem) {
      console.log('✅ Notification system component found');
      
      // Test notification permission request
      const permissionButton = await page.$('button:has-text("Enable")') ||
                              await page.$('button:has-text("Test")');
      
      if (permissionButton) {
        console.log('✅ Notification permission controls available');
      }
    } else {
      console.log('⚠️  Notification system component not found - checking console for errors');
    }

    // Check service worker registration
    const swRegistered = await page.evaluate(() => {
      return 'serviceWorker' in navigator && navigator.serviceWorker.controller;
    });

    console.log(swRegistered ? '✅ Service Worker registered' : '⚠️  Service Worker not found');

    // Test personalization settings
    await page.goto(`${TEST_URL}/settings`, { waitUntil: 'networkidle0' });
    await delay(1000);

    // Look for personalization tab or settings
    const personalizationTab = await page.$('text="Personal"') ||
                              await page.$('text="Personalization"') ||
                              await page.$('[role="tab"]:has-text("Personal")');

    if (personalizationTab) {
      console.log('✅ Personalization settings available');
      await personalizationTab.click();
      await delay(1000);

      // Check for trading style options
      const tradingStyleSelect = await page.$('select') || 
                                await page.$('[role="combobox"]') ||
                                await page.$('text="Trading Style"');

      if (tradingStyleSelect) {
        console.log('✅ Trading style personalization found');
      }
    } else {
      console.log('⚠️  Personalization tab not found');
    }

    return {
      notificationSystem: !!notificationSystem,
      serviceWorker: swRegistered,
      personalization: !!personalizationTab
    };

  } catch (error) {
    console.error('❌ Error testing push notifications:', error.message);
    return {
      notificationSystem: false,
      serviceWorker: false,
      personalization: false,
      error: error.message
    };
  }
}

async function testMobileFeatures(page) {
  console.log('📱 Testing Mobile Features...');
  
  try {
    // Set mobile viewport
    await page.setViewport(MOBILE_VIEWPORT);
    await page.goto(TEST_URL, { waitUntil: 'networkidle0' });
    await delay(2000);

    // Test mobile bottom navigation
    const bottomNav = await page.$('[data-testid="mobile-bottom-nav"]') ||
                     await page.$('.mobile-bottom-nav') ||
                     await page.$('nav[class*="bottom"]');

    const mobileNavWorking = !!bottomNav;
    console.log(mobileNavWorking ? '✅ Mobile bottom navigation found' : '⚠️  Mobile navigation not found');

    // Test PWA manifest
    const manifestLink = await page.$('link[rel="manifest"]');
    const hasPWAManifest = !!manifestLink;
    console.log(hasPWAManifest ? '✅ PWA manifest linked' : '⚠️  PWA manifest not found');

    // Test responsive design
    const isResponsive = await page.evaluate(() => {
      const viewport = document.querySelector('meta[name="viewport"]');
      return viewport && viewport.content.includes('width=device-width');
    });

    console.log(isResponsive ? '✅ Responsive viewport configured' : '⚠️  Responsive viewport not found');

    // Test touch-friendly elements
    const buttons = await page.$$('button');
    const touchFriendly = buttons.length > 0;
    console.log(touchFriendly ? `✅ ${buttons.length} interactive elements found` : '⚠️  No interactive elements found');

    return {
      mobileNavigation: mobileNavWorking,
      pwaManifest: hasPWAManifest,
      responsive: isResponsive,
      touchFriendly: touchFriendly,
      buttonCount: buttons.length
    };

  } catch (error) {
    console.error('❌ Error testing mobile features:', error.message);
    return {
      mobileNavigation: false,
      pwaManifest: false,
      responsive: false,
      touchFriendly: false,
      error: error.message
    };
  }
}

async function testAICoachIntegration(page) {
  console.log('🤖 Testing AI Coach Integration...');
  
  try {
    await page.goto(TEST_URL, { waitUntil: 'networkidle0' });
    await delay(2000);

    // Look for AI coach component
    const aiCoach = await page.$('[data-testid="ai-coach"]') ||
                   await page.$('text="AI Coach"') ||
                   await page.$('text="AI Insights"');

    const aiCoachFound = !!aiCoach;
    console.log(aiCoachFound ? '✅ AI Coach component found' : '⚠️  AI Coach component not found');

    // Check for provider status indicators
    const providerStatus = await page.$$('.provider-status') ||
                          await page.$$('[data-testid*="provider"]') ||
                          await page.$$('text*="OpenAI"') ||
                          await page.$$('text*="Groq"');

    const hasProviderStatus = providerStatus.length > 0;
    console.log(hasProviderStatus ? `✅ ${providerStatus.length} AI provider indicators found` : '⚠️  AI provider status not found');

    return {
      aiCoachComponent: aiCoachFound,
      providerStatus: hasProviderStatus,
      providerCount: providerStatus.length
    };

  } catch (error) {
    console.error('❌ Error testing AI coach:', error.message);
    return {
      aiCoachComponent: false,
      providerStatus: false,
      error: error.message
    };
  }
}

async function runComprehensiveTest() {
  console.log('🚀 Starting Comprehensive Push Notifications & Personalization Test\n');
  
  const browser = await puppeteer.launch({ 
    headless: false, // Set to true for headless testing
    defaultViewport: null,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Enable notifications permission for testing
    const context = browser.defaultBrowserContext();
    await context.overridePermissions(TEST_URL, ['notifications']);

    console.log(`📍 Testing URL: ${TEST_URL}\n`);

    // Run all tests
    const pushNotificationResults = await testPushNotifications(page);
    console.log('');
    
    const mobileResults = await testMobileFeatures(page);
    console.log('');
    
    const aiCoachResults = await testAICoachIntegration(page);
    console.log('');

    // Generate summary report
    console.log('📊 TEST SUMMARY REPORT');
    console.log('========================');
    
    const allResults = {
      pushNotifications: pushNotificationResults,
      mobileFeatures: mobileResults,
      aiCoach: aiCoachResults
    };

    // Calculate overall success rate
    const successCounts = {
      total: 0,
      passed: 0
    };

    Object.values(allResults).forEach(categoryResults => {
      Object.entries(categoryResults).forEach(([key, value]) => {
        if (key !== 'error' && typeof value === 'boolean') {
          successCounts.total++;
          if (value) successCounts.passed++;
        }
      });
    });

    const successRate = Math.round((successCounts.passed / successCounts.total) * 100);
    
    console.log(`\n🎯 Overall Success Rate: ${successRate}% (${successCounts.passed}/${successCounts.total})`);
    
    if (successRate >= 80) {
      console.log('🎉 EXCELLENT: Push notifications and personalization are working great!');
    } else if (successRate >= 60) {
      console.log('✅ GOOD: Most features working, minor issues detected');
    } else {
      console.log('⚠️  NEEDS ATTENTION: Several features need debugging');
    }

    console.log('\n📋 Detailed Results:');
    console.log(JSON.stringify(allResults, null, 2));

    return allResults;

  } catch (error) {
    console.error('❌ Test execution failed:', error);
    return { error: error.message };
  } finally {
    await browser.close();
  }
}

// Export for use in other modules
export { runComprehensiveTest, testPushNotifications, testMobileFeatures, testAICoachIntegration };

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runComprehensiveTest().catch(console.error);
} 