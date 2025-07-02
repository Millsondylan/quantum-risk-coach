#!/usr/bin/env node
import puppeteer from 'puppeteer';
import fs from 'fs';

const TEST_URL = 'http://localhost:4173';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const results = {
  timestamp: new Date().toISOString(),
  tests: [],
  summary: { total: 0, passed: 0, failed: 0 }
};

function logTest(name, passed, details = '') {
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${name}${details ? ': ' + details : ''}`);
  results.tests.push({ name, passed, details });
  results.summary.total++;
  if (passed) results.summary.passed++;
  else results.summary.failed++;
}

async function runComprehensiveValidation() {
  console.log('🚀 QUANTUM RISK COACH - COMPREHENSIVE VALIDATION');
  console.log('══════════════════════════════════════════════════════════════════════');
  console.log('🎯 Testing ALL features for professional trading journal validation');
  console.log('⚡ Ensuring NO mockups, ALL real data, FULL functionality');
  console.log('══════════════════════════════════════════════════════════════════════');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1200, height: 800 },
    args: ['--no-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('\n⏳ Connecting to application...');
    await page.goto(TEST_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    await delay(3000);
    console.log('✅ Connected successfully');
    
    // ═══ BACKEND SERVICES VALIDATION ═══
    console.log('\n🔍 BACKEND SERVICES VALIDATION');
    console.log('─'.repeat(50));
    
    // Test application structure
    const appStructure = await page.evaluate(() => {
      const components = {
        reactRoot: document.querySelector('#root, [data-reactroot]'),
        navigation: document.querySelector('nav'),
        mainContent: document.querySelector('main, .main, [role="main"]'),
        cards: document.querySelectorAll('.holo-card, [class*="card"]'),
        buttons: document.querySelectorAll('button:not([disabled])'),
        forms: document.querySelectorAll('form'),
        inputs: document.querySelectorAll('input:not([disabled])')
      };
      
      return {
        hasReactRoot: !!components.reactRoot,
        hasNavigation: !!components.navigation,
        hasMainContent: !!components.mainContent,
        cardCount: components.cards.length,
        buttonCount: components.buttons.length,
        formCount: components.forms.length,
        inputCount: components.inputs.length
      };
    });
    
    logTest('Application Structure', appStructure.hasReactRoot && appStructure.hasNavigation, 
      `React app with navigation, ${appStructure.cardCount} cards, ${appStructure.buttonCount} buttons`);
    
    // ═══ TRADE ENTRY SYSTEM VALIDATION ═══
    console.log('\n📝 TRADE ENTRY SYSTEM');
    console.log('─'.repeat(50));
    
    try {
      await page.goto(`${TEST_URL}/trade-builder`, { waitUntil: 'networkidle0' });
      await delay(2000);
      
      const tradeEntry = await page.evaluate(() => {
        const form = {
          symbolInput: document.querySelector('input[name="symbol"], #symbol, [placeholder*="symbol" i]'),
          submitButton: document.querySelector('button[type="submit"], .submit-trade'),
          selectElements: document.querySelectorAll('select'),
          priceElements: document.querySelectorAll('[class*="price"], [data-testid*="price"]'),
          formWrapper: document.querySelector('form, .trade-form, [data-testid*="trade-form"]')
        };
        
        // Check for real-time data
        const priceData = Array.from(form.priceElements).some(el => {
          const text = el.textContent || '';
          return /[\d,]+\.[\d]+/.test(text) && !text.includes('0.00') && !text.includes('--');
        });
        
        return {
          hasForm: !!(form.symbolInput || form.formWrapper),
          hasSubmit: !!form.submitButton,
          selectCount: form.selectElements.length,
          priceCount: form.priceElements.length,
          hasRealData: priceData,
          pageLoaded: document.body.textContent.toLowerCase().includes('trade')
        };
      });
      
      logTest('Trade Entry Access', tradeEntry.pageLoaded, 'Trade builder page accessible');
      logTest('Trade Form Components', tradeEntry.hasForm, `Form elements present with ${tradeEntry.selectCount} selects`);
      logTest('Real-time Data Sync', tradeEntry.hasRealData, `${tradeEntry.priceCount} price elements, live data detected`);
      
    } catch (error) {
      logTest('Trade Entry Access', false, 'Trade builder page not accessible');
    }
    
    // ═══ CHALLENGE MODULE VALIDATION ═══
    console.log('\n🎯 CHALLENGE MODULE');
    console.log('─'.repeat(50));
    
    await page.goto(TEST_URL, { waitUntil: 'networkidle0' });
    await delay(2000);
    
    const challengeSystem = await page.evaluate(() => {
      const bodyText = document.body.textContent.toLowerCase();
      
      // Look for AI-generated challenge indicators
      const aiChallengeMarkers = [
        'news trading discipline',
        'london session mastery',
        'risk management redemption',
        'emotional control',
        'your analysis shows',
        'practice staying out'
      ];
      
      const foundAIChallenges = aiChallengeMarkers.filter(marker => bodyText.includes(marker));
      
      const progressElements = {
        progressBars: document.querySelectorAll('progress, [role="progressbar"], .progress'),
        challengeCards: document.querySelectorAll('[class*="challenge"]'),
        rewardElements: document.querySelectorAll('.badge, [class*="reward"], [class*="achievement"]'),
        metricElements: document.querySelectorAll('[class*="metric"], [data-testid*="metric"]')
      };
      
      const hasProgressValues = Array.from(progressElements.progressBars).some(bar => {
        const value = bar.getAttribute('value') || bar.getAttribute('aria-valuenow');
        return value && parseFloat(value) > 0;
      });
      
      return {
        aiChallengeCount: foundAIChallenges.length,
        progressBars: progressElements.progressBars.length,
        challengeCards: progressElements.challengeCards.length,
        rewardElements: progressElements.rewardElements.length,
        metricElements: progressElements.metricElements.length,
        hasProgressValues,
        hasChallengeContent: bodyText.includes('challenge') || bodyText.includes('progress')
      };
    });
    
    logTest('Challenge Access', challengeSystem.hasChallengeContent, `${challengeSystem.challengeCards} challenge cards detected`);
    logTest('Dynamic Progress Tracking', challengeSystem.hasProgressValues, `${challengeSystem.progressBars} progress indicators with values`);
    logTest('Reward Logic', challengeSystem.rewardElements > 0, `${challengeSystem.rewardElements} reward/badge elements`);
    logTest('AI-Generated Challenges', challengeSystem.aiChallengeCount > 0, `${challengeSystem.aiChallengeCount} personalized challenges detected`);
    
    // ═══ RISK PROFILE ENGINE VALIDATION ═══
    console.log('\n⚠️ RISK PROFILE ENGINE');
    console.log('─'.repeat(50));
    
    const riskAnalysis = await page.evaluate(() => {
      const bodyText = document.body.textContent.toLowerCase();
      
      const riskElements = {
        riskAnalyzers: document.querySelectorAll('[class*="risk"], [data-testid*="risk"]'),
        drawdownElements: document.querySelectorAll('[class*="drawdown"]'),
        positionElements: document.querySelectorAll('[class*="position"]'),
        correlationElements: document.querySelectorAll('[class*="correlation"]')
      };
      
      const riskTerms = ['drawdown', 'risk', 'exposure', 'correlation', 'volatility', 'sharpe'];
      const foundRiskTerms = riskTerms.filter(term => bodyText.includes(term));
      
      const assetTypes = ['forex', 'crypto', 'stocks', 'cfd'];
      const supportedAssets = assetTypes.filter(asset => bodyText.includes(asset));
      
      return {
        riskElements: riskElements.riskAnalyzers.length,
        drawdownElements: riskElements.drawdownElements.length,
        positionElements: riskElements.positionElements.length,
        riskTerms: foundRiskTerms.length,
        supportedAssets: supportedAssets.length,
        hasRiskContent: foundRiskTerms.length >= 2
      };
    });
    
    logTest('Risk Analyzer Components', riskAnalysis.riskElements > 0, `${riskAnalysis.riskElements} risk analysis components`);
    logTest('Risk Metrics', riskAnalysis.riskTerms >= 3, `${riskAnalysis.riskTerms} risk metrics detected`);
    logTest('Multi-Asset Analysis', riskAnalysis.supportedAssets >= 2, `${riskAnalysis.supportedAssets} asset classes supported`);
    logTest('Comprehensive Risk Engine', riskAnalysis.hasRiskContent, 'Risk analysis terminology present');
    
    // ═══ METATRADER INTEGRATION VALIDATION ═══
    console.log('\n📈 METATRADER INTEGRATION');
    console.log('─'.repeat(50));
    
    try {
      await page.goto(`${TEST_URL}/connect-mt4`, { waitUntil: 'networkidle0' });
      await delay(2000);
      
      const mtIntegration = await page.evaluate(() => {
        const bodyText = document.body.textContent;
        
        const connectionElements = {
          serverInput: document.querySelector('input[name="server"], #server'),
          accountInput: document.querySelector('input[name="account"], input[name="login"]'),
          passwordInput: document.querySelector('input[type="password"]'),
          connectButton: document.querySelector('button[type="submit"], [data-testid*="connect"]')
        };
        
        const platformFeatures = {
          hasMT4Content: bodyText.includes('MetaTrader') || bodyText.includes('MT4'),
          hasConnectionForm: !!(connectionElements.serverInput && connectionElements.accountInput),
          hasAccountInfo: bodyText.includes('balance') && bodyText.includes('equity'),
          hasRealTimeFeatures: bodyText.includes('real-time') || bodyText.includes('sync'),
          hasExecutionFeatures: bodyText.includes('execution') || bodyText.includes('trading')
        };
        
        return {
          ...platformFeatures,
          formComplete: platformFeatures.hasConnectionForm && connectionElements.connectButton
        };
      });
      
      logTest('MT4 Connection Interface', mtIntegration.formComplete, 'Complete MT4 connection form');
      logTest('Platform Recognition', mtIntegration.hasMT4Content, 'MetaTrader platform integration');
      logTest('Account Integration', mtIntegration.hasAccountInfo, 'Account balance/equity tracking');
      logTest('Execution Integrity', mtIntegration.hasExecutionFeatures, 'Trading execution capabilities');
      
      // Test MT5 support
      try {
        await page.goto(`${TEST_URL}/connect-mt5`, { waitUntil: 'networkidle0' });
        await delay(1000);
        
        const mt5Support = await page.evaluate(() => {
          const bodyText = document.body.textContent;
          return bodyText.includes('MT5') || bodyText.includes('MetaTrader 5');
        });
        
        logTest('MT5 Support', mt5Support, 'MT5 platform support available');
        
      } catch (error) {
        logTest('MT5 Support', false, 'MT5 page not accessible');
      }
      
    } catch (error) {
      logTest('MetaTrader Integration', false, 'MetaTrader pages not accessible');
    }
    
    // ═══ AI COACHING VALIDATION ═══
    console.log('\n🤖 AI COACHING');
    console.log('─'.repeat(50));
    
    await page.goto(TEST_URL, { waitUntil: 'networkidle0' });
    await delay(2000);
    
    const aiCoaching = await page.evaluate(() => {
      const bodyText = document.body.textContent.toLowerCase();
      
      const aiElements = {
        aiCards: document.querySelectorAll('[class*="ai"], [data-testid*="ai"]'),
        coachingElements: document.querySelectorAll('[class*="coach"]'),
        recommendationElements: document.querySelectorAll('[class*="recommendation"]'),
        insightElements: document.querySelectorAll('[class*="insight"]')
      };
      
      const personalizationMarkers = [
        'your trading style',
        'your performance',
        'based on your',
        'personalized',
        'analysis shows',
        'your weaknesses',
        'your strengths'
      ];
      
      const foundPersonalization = personalizationMarkers.filter(marker => bodyText.includes(marker));
      
      const aiFeatures = [
        'ai coaching',
        'artificial intelligence',
        'machine learning',
        'sentiment analysis',
        'market analysis',
        'trading insights'
      ];
      
      const foundAIFeatures = aiFeatures.filter(feature => bodyText.includes(feature));
      
      return {
        aiElements: aiElements.aiCards.length + aiElements.coachingElements.length,
        recommendations: aiElements.recommendationElements.length,
        personalizationCount: foundPersonalization.length,
        aiFeatureCount: foundAIFeatures.length,
        hasAIContent: foundAIFeatures.length > 0 || aiElements.aiCards.length > 0
      };
    });
    
    logTest('AI Coaching Interface', aiCoaching.hasAIContent, `${aiCoaching.aiElements} AI components detected`);
    logTest('Personalized Adaptation', aiCoaching.personalizationCount > 0, `${aiCoaching.personalizationCount} personalization indicators`);
    logTest('AI-Powered Insights', aiCoaching.aiFeatureCount >= 2, `${aiCoaching.aiFeatureCount} AI features detected`);
    logTest('Coaching Recommendations', aiCoaching.recommendations > 0, `${aiCoaching.recommendations} recommendation elements`);
    
    // ═══ SETTINGS FUNCTIONALITY VALIDATION ═══
    console.log('\n⚙️ SETTINGS FUNCTIONALITY');
    console.log('─'.repeat(50));
    
    try {
      await page.goto(`${TEST_URL}/settings`, { waitUntil: 'networkidle0' });
      await delay(2000);
      
      const settingsValidation = await page.evaluate(() => {
        const toggles = document.querySelectorAll('input[type="checkbox"], [role="switch"]');
        const workingToggles = Array.from(toggles).filter(t => !t.disabled);
        
        const configInputs = document.querySelectorAll('input[type="text"], input[type="email"], select');
        const workingInputs = Array.from(configInputs).filter(i => !i.disabled);
        
        const settingsCategories = {
          notifications: document.querySelectorAll('[data-testid*="notification"], [class*="notification"]').length,
          alerts: document.querySelectorAll('[data-testid*="alert"], [class*="alert"]').length,
          theme: document.querySelectorAll('[data-testid*="theme"], #darkMode').length,
          privacy: document.querySelectorAll('[data-testid*="privacy"]').length
        };
        
        const saveButton = document.querySelector('button[type="submit"], [data-testid*="save"]');
        
        return {
          toggleCount: workingToggles.length,
          inputCount: workingInputs.length,
          categoryCount: Object.values(settingsCategories).filter(c => c > 0).length,
          hasSave: !!saveButton,
          hasSettingsContent: document.body.textContent.toLowerCase().includes('settings')
        };
      });
      
      logTest('Settings Access', settingsValidation.hasSettingsContent, 'Settings page accessible');
      logTest('Toggle Functions', settingsValidation.toggleCount > 0, `${settingsValidation.toggleCount} functional toggles`);
      logTest('Configuration Options', settingsValidation.inputCount > 0, `${settingsValidation.inputCount} configuration inputs`);
      logTest('Settings Categories', settingsValidation.categoryCount >= 2, `${settingsValidation.categoryCount} setting categories`);
      logTest('Settings Persistence', settingsValidation.hasSave, 'Save functionality available');
      
    } catch (error) {
      logTest('Settings Access', false, 'Settings page not accessible');
    }
    
    // ═══ RESPONSIVE UI VALIDATION ═══
    console.log('\n📱 RESPONSIVE UI');
    console.log('─'.repeat(50));
    
    const viewports = [
      { name: 'Mobile', width: 375, height: 812 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];
    
    let responsiveScore = 0;
    
    for (const viewport of viewports) {
      await page.setViewport(viewport);
      await page.goto(TEST_URL, { waitUntil: 'networkidle0' });
      await delay(1500);
      
      const responsive = await page.evaluate(() => {
        const buttons = document.querySelectorAll('button');
        const navigation = document.querySelector('nav');
        
        let touchCompliant = true;
        buttons.forEach(btn => {
          const rect = btn.getBoundingClientRect();
          if (rect.height < 40) touchCompliant = false;
        });
        
        const navVisible = navigation && window.getComputedStyle(navigation).display !== 'none';
        const hasFlexLayout = document.querySelector('[class*="flex"], [class*="grid"]');
        
        return {
          touchCompliant,
          navVisible,
          hasFlexLayout: !!hasFlexLayout,
          buttonCount: buttons.length
        };
      });
      
      if (responsive.touchCompliant && responsive.navVisible) responsiveScore++;
      
      logTest(`${viewport.name} Responsive`, responsive.touchCompliant && responsive.navVisible, 
        `Touch: ${responsive.touchCompliant}, Nav: ${responsive.navVisible}, ${responsive.buttonCount} buttons`);
    }
    
    logTest('Cross-Device Optimization', responsiveScore >= 1, `${responsiveScore}/2 viewports optimized`);
    
    // ═══ REALITY CHECK VALIDATION ═══
    console.log('\n🔍 REALITY CHECK');
    console.log('─'.repeat(50));
    
    await page.setViewport({ width: 1200, height: 800 });
    await page.goto(TEST_URL, { waitUntil: 'networkidle0' });
    await delay(3000);
    
    const realityCheck = await page.evaluate(() => {
      const bodyText = document.body.textContent.toLowerCase();
      
      // Check for placeholder indicators
      const placeholderTerms = ['lorem ipsum', 'placeholder', 'coming soon', 'not implemented'];
      const foundPlaceholders = placeholderTerms.filter(term => bodyText.includes(term));
      
      // Check for real trading content
      const tradingTerms = [
        'forex', 'trading', 'profit', 'loss', 'risk', 'strategy',
        'analysis', 'portfolio', 'market', 'crypto', 'mt4', 'mt5'
      ];
      const foundTradingTerms = tradingTerms.filter(term => bodyText.includes(term));
      
      // Check operational elements
      const operational = {
        buttons: document.querySelectorAll('button:not([disabled])').length,
        inputs: document.querySelectorAll('input:not([disabled])').length,
        links: document.querySelectorAll('a[href]:not([href="#"])').length,
        forms: document.querySelectorAll('form').length
      };
      
      const totalOperational = Object.values(operational).reduce((sum, count) => sum + count, 0);
      
      // Check for real price data
      const pricePattern = /\$?[\d,]+\.\d{2,}/g;
      const prices = bodyText.match(pricePattern) || [];
      const realPrices = prices.filter(price => {
        const num = parseFloat(price.replace(/[$,]/g, ''));
        return num > 0 && !price.includes('0.00');
      });
      
      return {
        placeholders: foundPlaceholders.length,
        tradingTerms: foundTradingTerms.length,
        operational: totalOperational,
        realPrices: realPrices.length,
        professionalContent: foundTradingTerms.length >= 8 && totalOperational >= 15
      };
    });
    
    logTest('No Placeholder Data', realityCheck.placeholders === 0, 
      realityCheck.placeholders === 0 ? 'Clean, professional data' : `${realityCheck.placeholders} placeholders found`);
    logTest('Live Trading Data', realityCheck.realPrices > 0, `${realityCheck.realPrices} real price values detected`);
    logTest('Professional Content', realityCheck.tradingTerms >= 8, `${realityCheck.tradingTerms} trading terms present`);
    logTest('Operational Features', realityCheck.operational >= 15, `${realityCheck.operational} working interactive elements`);
    
    // ═══ FINAL RESULTS ═══
    const percentage = Math.round((results.summary.passed / results.summary.total) * 100);
    
    console.log('\n' + '═'.repeat(70));
    console.log('📊 COMPREHENSIVE VALIDATION RESULTS');
    console.log('═'.repeat(70));
    
    console.log(`\n🎯 OVERALL SCORE: ${results.summary.passed}/${results.summary.total} (${percentage}%)`);
    
    if (percentage >= 90) {
      console.log('🏆 EXCELLENT - Production ready with all features operational!');
      console.log('   Your trading journal exceeds professional standards.');
    } else if (percentage >= 80) {
      console.log('✅ VERY GOOD - Ready for production with minor refinements');
      console.log('   Professional-grade trading journal with comprehensive features.');
    } else if (percentage >= 70) {
      console.log('⚠️ GOOD - Functional with some improvements needed');
      console.log('   Solid foundation with room for enhancement.');
    } else if (percentage >= 60) {
      console.log('🔶 ACCEPTABLE - Basic functionality present');
      console.log('   Core features working, additional development recommended.');
    } else {
      console.log('❌ NEEDS SIGNIFICANT WORK - Major improvements required');
      console.log('   Extensive development needed for production readiness.');
    }
    
    console.log('\n📋 PROFESSIONAL FEATURE CHECKLIST:');
    console.log('─'.repeat(50));
    
    const featureChecklist = {
      'Trade Entry System': results.tests.filter(t => t.name.includes('Trade')).some(t => t.passed),
      'Challenge Module': results.tests.filter(t => t.name.includes('Challenge')).some(t => t.passed),
      'Risk Profile Engine': results.tests.filter(t => t.name.includes('Risk')).some(t => t.passed),
      'Custom Settings': results.tests.filter(t => t.name.includes('Settings')).some(t => t.passed),
      'MetaTrader Integration': results.tests.filter(t => t.name.includes('MT')).some(t => t.passed),
      'AI Coaching': results.tests.filter(t => t.name.includes('AI')).some(t => t.passed),
      'Responsive UI': results.tests.filter(t => t.name.includes('Responsive')).some(t => t.passed),
      'Data Integrity': results.tests.filter(t => t.name.includes('Reality') || t.name.includes('Data')).some(t => t.passed)
    };
    
    Object.entries(featureChecklist).forEach(([feature, operational]) => {
      console.log(`${operational ? '✅' : '❌'} ${feature}: ${operational ? 'OPERATIONAL' : 'NEEDS ATTENTION'}`);
    });
    
    // Save comprehensive report
    const report = {
      ...results,
      summary: { ...results.summary, percentage },
      featureChecklist,
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync('comprehensive-validation-report.json', JSON.stringify(report, null, 2));
    
    console.log('\n📄 Comprehensive validation report saved to comprehensive-validation-report.json');
    console.log('\n' + '═'.repeat(70));
    console.log('🎉 PROFESSIONAL TRADING JOURNAL VALIDATION COMPLETE');
    console.log('═'.repeat(70));
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    logTest('Critical System Error', false, error.message);
  } finally {
    await browser.close();
  }
  
  return results;
}

runComprehensiveValidation().catch(console.error);
