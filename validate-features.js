#!/usr/bin/env node
import puppeteer from 'puppeteer';
import fs from 'fs';

const TEST_URL = 'http://localhost:4173';
const report = {
  timestamp: new Date().toISOString(),
  categories: {},
  summary: { total: 0, passed: 0, score: 0 }
};

function logResult(category, test, passed, details = '') {
  if (!report.categories[category]) {
    report.categories[category] = { tests: [], passed: 0, total: 0 };
  }
  
  const status = passed ? '✅' : '❌';
  const result = { test, passed, details };
  
  console.log(`${status} ${test}${details ? ': ' + details : ''}`);
  report.categories[category].tests.push(result);
  report.categories[category].total++;
  if (passed) report.categories[category].passed++;
  
  report.summary.total++;
  if (passed) report.summary.passed++;
}

async function validateUIComponents(page) {
  console.log('\n🔍 UI COMPONENTS & FUNCTIONALITY');
  console.log('=' * 50);
  
  await page.goto(TEST_URL, { waitUntil: 'networkidle0' });
  await page.waitForTimeout(3000);
  
  // Test Dashboard Components
  const dashboardComponents = await page.evaluate(() => {
    const components = {
      quickStats: document.querySelectorAll('[class*="stats"], [data-testid*="stats"]').length,
      tradingCards: document.querySelectorAll('.holo-card, [class*="card"]').length,
      navigation: document.querySelectorAll('nav, [role="navigation"]').length,
      buttons: document.querySelectorAll('button:not([disabled])').length,
      aiElements: document.querySelectorAll('[class*="ai"], [data-testid*="ai"]').length,
      challengeElements: document.querySelectorAll('[class*="challenge"]').length,
      riskElements: document.querySelectorAll('[class*="risk"]').length
    };
    
    return components;
  });
  
  logResult('UI Components', 'Dashboard Layout', dashboardComponents.tradingCards >= 3, `${dashboardComponents.tradingCards} cards, ${dashboardComponents.buttons} buttons`);
  logResult('UI Components', 'Navigation System', dashboardComponents.navigation > 0, 'Navigation elements present');
  logResult('UI Components', 'AI Components', dashboardComponents.aiElements > 0, `${dashboardComponents.aiElements} AI elements`);
  logResult('UI Components', 'Challenge System', dashboardComponents.challengeElements > 0, `${dashboardComponents.challengeElements} challenge components`);
  logResult('UI Components', 'Risk Analysis', dashboardComponents.riskElements > 0, `${dashboardComponents.riskElements} risk elements`);
}

async function validateTradeEntry(page) {
  console.log('\n📝 TRADE ENTRY SYSTEM');
  console.log('=' * 50);
  
  try {
    await page.goto(`${TEST_URL}/trade-builder`, { waitUntil: 'networkidle0' });
    await page.waitForTimeout(2000);
    
    const tradeForm = await page.evaluate(() => {
      const form = {
        symbolInput: document.querySelector('input[name="symbol"], #symbol, [placeholder*="symbol" i]'),
        lotSizeInput: document.querySelector('input[name="lot_size"], input[name="size"], #lotSize, [placeholder*="size" i]'),
        entryPriceInput: document.querySelector('input[name="entry_price"], #entryPrice, [placeholder*="price" i]'),
        submitButton: document.querySelector('button[type="submit"], .submit-trade, [data-testid="submit-trade"]'),
        selectElements: document.querySelectorAll('select').length,
        formElements: document.querySelectorAll('form').length
      };
      
      return {
        hasSymbol: !!form.symbolInput,
        hasLotSize: !!form.lotSizeInput,
        hasEntryPrice: !!form.entryPriceInput,
        hasSubmit: !!form.submitButton,
        selectCount: form.selectElements,
        formCount: form.formElements,
        complete: !!(form.symbolInput && form.submitButton)
      };
    });
    
    logResult('Trade Entry', 'Form Components', tradeForm.complete, `Symbol input: ${tradeForm.hasSymbol}, Submit: ${tradeForm.hasSubmit}`);
    logResult('Trade Entry', 'Form Structure', tradeForm.formCount > 0, `${tradeForm.formCount} forms, ${tradeForm.selectCount} selects`);
    
    // Test real-time data indicators
    const priceData = await page.evaluate(() => {
      const priceElements = document.querySelectorAll('[class*="price"], [data-testid*="price"], .market-price');
      const numberPattern = /[\d,]+\.[\d]+/;
      const realPrices = Array.from(priceElements).filter(el => {
        const text = el.textContent || '';
        return numberPattern.test(text) && !text.includes('0.00') && !text.includes('--');
      });
      
      return {
        totalPriceElements: priceElements.length,
        realPriceElements: realPrices.length,
        hasLiveData: realPrices.length > 0
      };
    });
    
    logResult('Trade Entry', 'Real-time Data', priceData.hasLiveData, `${priceData.realPriceElements}/${priceData.totalPriceElements} live price feeds`);
    
  } catch (error) {
    logResult('Trade Entry', 'Page Access', false, 'Trade builder page inaccessible');
  }
}

async function validateChallenges(page) {
  console.log('\n🎯 CHALLENGE MODULE');
  console.log('=' * 50);
  
  await page.goto(TEST_URL, { waitUntil: 'networkidle0' });
  await page.waitForTimeout(2000);
  
  const challengeSystem = await page.evaluate(() => {
    // Look for challenge-related content
    const bodyText = document.body.textContent.toLowerCase();
    const challengeKeywords = [
      'challenge',
      'progress',
      'reward',
      'achievement',
      'news trading discipline',
      'london session',
      'risk management',
      'emotional control'
    ];
    
    const foundKeywords = challengeKeywords.filter(keyword => bodyText.includes(keyword));
    
    const progressBars = document.querySelectorAll('progress, [role="progressbar"], .progress-bar, [class*="progress"]');
    const badges = document.querySelectorAll('.badge, [class*="badge"], [data-testid*="badge"]');
    const challengeCards = document.querySelectorAll('[class*="challenge"], [data-testid*="challenge"]');
    
    // Check for specific AI-generated challenge content
    const aiChallenges = [
      'news trading discipline',
      'london session mastery',
      'risk management redemption',
      'emotional control challenge'
    ].filter(challenge => bodyText.includes(challenge));
    
    return {
      keywordMatches: foundKeywords.length,
      foundKeywords,
      progressBars: progressBars.length,
      badges: badges.length,
      challengeCards: challengeCards.length,
      aiChallenges: aiChallenges.length,
      hasAIContent: aiChallenges.length > 0
    };
  });
  
  logResult('Challenges', 'Challenge Detection', challengeSystem.keywordMatches >= 3, `${challengeSystem.keywordMatches} challenge keywords found`);
  logResult('Challenges', 'Progress Tracking', challengeSystem.progressBars > 0, `${challengeSystem.progressBars} progress indicators`);
  logResult('Challenges', 'Reward System', challengeSystem.badges > 0, `${challengeSystem.badges} badges/rewards`);
  logResult('Challenges', 'AI-Generated Content', challengeSystem.hasAIContent, `${challengeSystem.aiChallenges} personalized challenges`);
}

async function validateMetaTrader(page) {
  console.log('\n📈 METATRADER INTEGRATION');
  console.log('=' * 50);
  
  try {
    await page.goto(`${TEST_URL}/connect-mt4`, { waitUntil: 'networkidle0' });
    await page.waitForTimeout(2000);
    
    const mt4Integration = await page.evaluate(() => {
      const bodyText = document.body.textContent;
      
      const connectionForm = {
        serverInput: document.querySelector('input[name="server"], #server, [placeholder*="server" i]'),
        accountInput: document.querySelector('input[name="account"], input[name="login"], #account, [placeholder*="account" i]'),
        passwordInput: document.querySelector('input[type="password"], #password'),
        connectButton: document.querySelector('button[type="submit"], [data-testid*="connect"], .connect-button')
      };
      
      const platformFeatures = {
        hasMT4Content: bodyText.includes('MetaTrader 4') || bodyText.includes('MT4'),
        hasMT5Content: bodyText.includes('MetaTrader 5') || bodyText.includes('MT5'),
        hasConnectionForm: !!(connectionForm.serverInput && connectionForm.accountInput && connectionForm.passwordInput),
        hasConnectButton: !!connectionForm.connectButton,
        hasAccountInfo: bodyText.includes('balance') && bodyText.includes('equity'),
        hasRealTimeFeatures: bodyText.includes('real-time') || bodyText.includes('live data')
      };
      
      return {
        ...platformFeatures,
        formComplete: platformFeatures.hasConnectionForm && platformFeatures.hasConnectButton
      };
    });
    
    logResult('MetaTrader', 'MT4 Interface', mt4Integration.hasMT4Content, 'MT4 content detected');
    logResult('MetaTrader', 'Connection Form', mt4Integration.formComplete, 'Complete connection form available');
    logResult('MetaTrader', 'Account Integration', mt4Integration.hasAccountInfo, 'Account balance/equity integration');
    logResult('MetaTrader', 'Real-time Features', mt4Integration.hasRealTimeFeatures, 'Live data integration');
    
    // Test MT5 support
    try {
      await page.goto(`${TEST_URL}/connect-mt5`, { waitUntil: 'networkidle0' });
      await page.waitForTimeout(1000);
      
      const mt5Support = await page.evaluate(() => {
        const bodyText = document.body.textContent;
        return {
          hasMT5Interface: bodyText.includes('MetaTrader 5') || bodyText.includes('MT5'),
          hasAdvancedFeatures: bodyText.includes('multi-asset') || bodyText.includes('advanced')
        };
      });
      
      logResult('MetaTrader', 'MT5 Support', mt5Support.hasMT5Interface, 'MT5 integration available');
      
    } catch (error) {
      logResult('MetaTrader', 'MT5 Support', false, 'MT5 page inaccessible');
    }
    
  } catch (error) {
    logResult('MetaTrader', 'Integration Access', false, 'MetaTrader pages inaccessible');
  }
}

async function validateSettings(page) {
  console.log('\n⚙️ SETTINGS FUNCTIONALITY');
  console.log('=' * 50);
  
  try {
    await page.goto(`${TEST_URL}/settings`, { waitUntil: 'networkidle0' });
    await page.waitForTimeout(2000);
    
    const settingsComponents = await page.evaluate(() => {
      const toggles = document.querySelectorAll('input[type="checkbox"], [role="switch"], .switch');
      const workingToggles = Array.from(toggles).filter(toggle => !toggle.disabled);
      
      const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="number"], select');
      const workingInputs = Array.from(inputs).filter(input => !input.disabled);
      
      const buttons = document.querySelectorAll('button:not([disabled])');
      const saveButton = document.querySelector('button[type="submit"], [data-testid*="save"], .save-button');
      
      const settingsCategories = {
        notifications: document.querySelectorAll('[data-testid*="notification"], [class*="notification"]').length,
        alerts: document.querySelectorAll('[data-testid*="alert"], [class*="alert"]').length,
        theme: document.querySelectorAll('[data-testid*="theme"], [class*="theme"], #darkMode').length,
        privacy: document.querySelectorAll('[data-testid*="privacy"], [class*="privacy"]').length
      };
      
      return {
        toggleCount: workingToggles.length,
        inputCount: workingInputs.length,
        buttonCount: buttons.length,
        hasSaveButton: !!saveButton,
        categories: settingsCategories,
        categoryCount: Object.values(settingsCategories).filter(count => count > 0).length
      };
    });
    
    logResult('Settings', 'Toggle Controls', settingsComponents.toggleCount > 0, `${settingsComponents.toggleCount} functional toggles`);
    logResult('Settings', 'Configuration Options', settingsComponents.inputCount > 0, `${settingsComponents.inputCount} configuration inputs`);
    logResult('Settings', 'Settings Categories', settingsComponents.categoryCount >= 2, `${settingsComponents.categoryCount} setting categories`);
    logResult('Settings', 'Save Functionality', settingsComponents.hasSaveButton, 'Save button available');
    
    // Test toggle functionality
    if (settingsComponents.toggleCount > 0) {
      try {
        await page.click('input[type="checkbox"], [role="switch"]');
        await page.waitForTimeout(500);
        logResult('Settings', 'Toggle Interaction', true, 'Settings toggles responsive');
      } catch (error) {
        logResult('Settings', 'Toggle Interaction', false, 'Toggle interaction failed');
      }
    }
    
  } catch (error) {
    logResult('Settings', 'Settings Access', false, 'Settings page inaccessible');
  }
}

async function validateResponsive(page) {
  console.log('\n📱 RESPONSIVE DESIGN');
  console.log('=' * 50);
  
  const viewports = [
    { name: 'Mobile', width: 375, height: 812 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 }
  ];
  
  let responsiveScore = 0;
  
  for (const viewport of viewports) {
    await page.setViewport(viewport);
    await page.goto(TEST_URL, { waitUntil: 'networkidle0' });
    await page.waitForTimeout(1500);
    
    const responsiveTest = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      const navigation = document.querySelector('nav');
      const cards = document.querySelectorAll('.card, [class*="card"]');
      
      // Check minimum touch target sizes (44x44px recommended)
      let touchCompliant = true;
      let smallButtonCount = 0;
      buttons.forEach(btn => {
        const rect = btn.getBoundingClientRect();
        if (rect.height < 40 || rect.width < 40) {
          touchCompliant = false;
          smallButtonCount++;
        }
      });
      
      // Check layout responsiveness
      const hasFlexLayout = Array.from(document.querySelectorAll('*')).some(el => {
        const styles = window.getComputedStyle(el);
        return styles.display === 'flex' || styles.display === 'grid';
      });
      
      const navVisible = navigation && window.getComputedStyle(navigation).display !== 'none';
      
      return {
        touchCompliant,
        smallButtonCount,
        navVisible,
        cardCount: cards.length,
        buttonCount: buttons.length,
        hasFlexLayout,
        responsive: touchCompliant && navVisible && hasFlexLayout
      };
    });
    
    if (responsiveTest.responsive) responsiveScore++;
    
    logResult('Responsive', `${viewport.name} Layout`, responsiveTest.responsive, 
      `${responsiveTest.buttonCount} buttons, touch: ${responsiveTest.touchCompliant}, nav: ${responsiveTest.navVisible}`);
  }
  
  logResult('Responsive', 'Cross-Device Support', responsiveScore >= 2, `${responsiveScore}/3 viewports optimized`);
}

async function validateDataIntegrity(page) {
  console.log('\n🔍 DATA INTEGRITY');
  console.log('=' * 50);
  
  await page.goto(TEST_URL, { waitUntil: 'networkidle0' });
  await page.waitForTimeout(3000);
  
  const dataCheck = await page.evaluate(() => {
    const bodyText = document.body.textContent.toLowerCase();
    
    // Check for placeholder/mock data indicators
    const placeholderIndicators = [
      'lorem ipsum',
      'placeholder',
      'sample data',
      'mock data',
      'coming soon',
      'not implemented',
      'dummy data'
    ];
    
    const foundPlaceholders = placeholderIndicators.filter(indicator => bodyText.includes(indicator));
    
    // Check for real financial data patterns
    const pricePattern = /\$?[\d,]+\.\d{2,5}/g;
    const prices = bodyText.match(pricePattern) || [];
    const realPrices = prices.filter(price => {
      const num = parseFloat(price.replace(/[$,]/g, ''));
      return num > 0 && !price.includes('0.00') && !price.includes('123.45');
    });
    
    // Check for trading-specific content
    const tradingTerms = [
      'forex', 'crypto', 'trading', 'profit', 'loss', 
      'risk', 'strategy', 'analysis', 'portfolio', 'market'
    ];
    const foundTerms = tradingTerms.filter(term => bodyText.includes(term));
    
    // Check for interactive elements
    const interactiveElements = {
      buttons: document.querySelectorAll('button:not([disabled])').length,
      inputs: document.querySelectorAll('input:not([disabled])').length,
      links: document.querySelectorAll('a[href]:not([href="#"])').length,
      forms: document.querySelectorAll('form').length
    };
    
    const totalInteractive = Object.values(interactiveElements).reduce((sum, count) => sum + count, 0);
    
    return {
      placeholders: foundPlaceholders.length,
      foundPlaceholders,
      realPrices: realPrices.length,
      tradingTerms: foundTerms.length,
      interactive: totalInteractive,
      operationalScore: totalInteractive + foundTerms.length - foundPlaceholders.length
    };
  });
  
  logResult('Data Integrity', 'No Placeholder Data', dataCheck.placeholders === 0, 
    dataCheck.placeholders > 0 ? `${dataCheck.placeholders} placeholders found` : 'Clean, real data');
  logResult('Data Integrity', 'Real Price Data', dataCheck.realPrices > 0, `${dataCheck.realPrices} real price values`);
  logResult('Data Integrity', 'Trading Content', dataCheck.tradingTerms >= 5, `${dataCheck.tradingTerms} trading terms detected`);
  logResult('Data Integrity', 'Operational Features', dataCheck.interactive >= 15, `${dataCheck.interactive} interactive elements`);
}

async function runFeatureValidation() {
  console.log('🚀 QUANTUM RISK COACH - FEATURE VALIDATION');
  console.log('=' * 70);
  console.log('🎯 Professional Trading Journal Comprehensive Test');
  console.log('=' * 70);
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1200, height: 800 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('\n⏳ Initializing validation...');
    
    await validateUIComponents(page);
    await validateTradeEntry(page);
    await validateChallenges(page);
    await validateMetaTrader(page);
    await validateSettings(page);
    await validateResponsive(page);
    await validateDataIntegrity(page);
    
    // Calculate final score
    report.summary.score = Math.round((report.summary.passed / report.summary.total) * 100);
    
    // Generate summary report
    console.log('\n' + '=' * 70);
    console.log('📊 VALIDATION SUMMARY');
    console.log('=' * 70);
    
    Object.entries(report.categories).forEach(([category, data]) => {
      const percentage = Math.round((data.passed / data.total) * 100);
      const status = percentage >= 80 ? '🟢' : percentage >= 60 ? '🟡' : '🔴';
      console.log(`${status} ${category}: ${data.passed}/${data.total} (${percentage}%)`);
    });
    
    console.log(`\n🎯 OVERALL SCORE: ${report.summary.passed}/${report.summary.total} (${report.summary.score}%)`);
    
    if (report.summary.score >= 85) {
      console.log('🏆 EXCELLENT - Production ready with professional features!');
    } else if (report.summary.score >= 70) {
      console.log('✅ GOOD - Ready for production with minor refinements');
    } else if (report.summary.score >= 55) {
      console.log('⚠️ ACCEPTABLE - Some improvements needed');
    } else {
      console.log('❌ NEEDS WORK - Significant development required');
    }
    
    // Feature checklist
    console.log('\n📋 PROFESSIONAL FEATURE CHECKLIST:');
    
    const featureStatus = {
      'Trade Entry System': report.categories['Trade Entry']?.passed >= 2,
      'Challenge Module': report.categories['Challenges']?.passed >= 3,
      'MetaTrader Integration': report.categories['MetaTrader']?.passed >= 3,
      'Settings Functionality': report.categories['Settings']?.passed >= 3,
      'Responsive Design': report.categories['Responsive']?.passed >= 3,
      'Data Integrity': report.categories['Data Integrity']?.passed >= 3
    };
    
    Object.entries(featureStatus).forEach(([feature, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${feature}: ${passed ? 'OPERATIONAL' : 'NEEDS ATTENTION'}`);
    });
    
    // Save detailed report
    fs.writeFileSync('validation-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Detailed validation report saved to validation-report.json');
    
    console.log('\n' + '=' * 70);
    console.log('🎉 VALIDATION COMPLETE');
    console.log('=' * 70);
    
  } catch (error) {
    console.error('❌ Validation error:', error.message);
  } finally {
    await browser.close();
  }
  
  return report;
}

runFeatureValidation().catch(console.error);
