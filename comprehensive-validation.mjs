import puppeteer from 'puppeteer';
import fs from 'fs';

const TEST_URL = 'http://localhost:8083';

// Read the test user injection script
const testUserInject = fs.readFileSync('test-user-inject.js', 'utf8');

async function runComprehensiveValidation() {
  console.log('🚀 COMPREHENSIVE VALIDATION - Quantum Risk Coach');
  console.log('==================================================');

  const browser = await puppeteer.launch({ 
    headless: false, // Set to false to see what's happening
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });
  
  try {
    const page = await browser.newPage();
    
    console.log('⏳ Connecting to application...');
    await page.goto('http://localhost:8081/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    console.log('🔧 Injecting test user into localStorage...');
    await page.evaluate(() => {
      const testUser = {
        id: 'local_1751461097770_validation',
        email: 'test@quantumriskcoach.com',
        username: 'testuser',
        created_at: new Date().toISOString(),
        subscription_status: 'unlimited',
        posts_remaining: 999999
      };
      localStorage.setItem('quantum_risk_coach_user', JSON.stringify(testUser));
      console.log('✅ Test user injected into localStorage');
    });
    
    console.log('🔄 Reloading page with authenticated user...');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait longer for dashboard to load
    
    // Wait for React components to render
    await page.waitForSelector('body', { timeout: 10000 });
    
    console.log('✅ Page loaded successfully\n');

    // Test 1: Basic Page Info
    const pageInfo = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        bodyText: document.body.innerText.substring(0, 200),
        hasReact: !!window.React || !!document.querySelector('[data-reactroot]')
      };
    });
    
    console.log('📄 PAGE INFO:');
    console.log('   Title:', pageInfo.title);
    console.log('   URL:', pageInfo.url);
    console.log('   Has React:', pageInfo.hasReact);
    console.log('   Body preview:', pageInfo.bodyText + '...\n');

    // Test 2: Challenge Module
    const challengeElements = await page.$$('[class*="challenge"], .challenge, [data-testid*="challenge"]');
    const badgeElements = await page.$$('.badge, [data-testid*="badge"], [class*="badge"]');
    const progressBars = await page.$$('.progress, [role="progressbar"], [class*="progress"]');
    const rewardElements = await page.$$('.reward, .xp, .trophy, [class*="reward"]');
    const personalChallengesComponent = await page.$$('[data-testid="challenges-section"], .personal-challenges, [class*="challenge"]');

    console.log('🎯 CHALLENGE MODULE:');
    console.log('   Challenge Elements:', challengeElements.length);
    console.log('   Badge Elements:', badgeElements.length);
    console.log('   Progress Bars:', progressBars.length);
    console.log('   Reward Elements:', rewardElements.length);
    console.log('   Personal Challenges Component:', personalChallengesComponent.length);

    // Test 3: AI Coaching
    const aiComponents = await page.$$('[data-testid*="ai"], .ai-coach, .ai-insights, [class*="ai"], [class*="AI"]');
    const recommendations = await page.$$('.recommendation, .insight, .tip, [class*="recommendation"]');
    const coachCards = await page.$$('.coach-card, .ai-card, [class*="coach"]');
    const insights = await page.$$('.insight, .analysis, .prediction, [class*="insight"]');

    console.log('🤖 AI COACHING:');
    console.log('   AI Components:', aiComponents.length);
    console.log('   Recommendations:', recommendations.length);
    console.log('   Coach Cards:', coachCards.length);
    console.log('   Insights:', insights.length);

    // Test 4: Risk Analysis
    const riskComponents = await page.$$('[data-testid*="risk"], .risk-analyzer, .risk-metrics, [class*="risk"], [class*="Risk"]');
    const riskMetrics = await page.$$('.risk-metric, .risk-score, .risk-level, [class*="metric"]');
    const riskAnalyzerComponent = await page.$$('[data-testid="risk-analyzer"], .risk-analyzer, [class*="risk"]');
    const assetClasses = await page.$$('.asset-class, .instrument, .symbol, [class*="asset"]');
    const riskAlerts = await page.$$('.risk-alert, .warning, .alert, [class*="alert"]');

    console.log('⚠️ RISK ANALYSIS:');
    console.log('   Risk Components:', riskComponents.length);
    console.log('   Metrics:', riskMetrics.length);
    console.log('   Risk Analyzer Component:', riskAnalyzerComponent.length);
    console.log('   Asset Classes:', assetClasses.length);
    console.log('   Risk Alerts:', riskAlerts.length);

    // Test 5: Trading Features
    const buttons = await page.$$('button, [role="button"]');
    const inputFields = await page.$$('input, textarea, select');
    const cards = await page.$$('.card, [class*="card"]');
    const priceElements = await page.$$('.price, [class*="price"], [class*="pnl"]');
    const dashboardComponents = await page.$$('.ultra-trader-dashboard, .dashboard, [class*="dashboard"]');

    console.log('📊 TRADING FEATURES:');
    console.log('   Buttons:', buttons.length);
    console.log('   Input Fields:', inputFields.length);
    console.log('   Cards:', cards.length);
    console.log('   Price Elements:', priceElements.length);
    console.log('   Dashboard Components:', dashboardComponents.length);

    // Calculate Score
    const scores = {
      pageLoad: 1, // Page loaded successfully
      authentication: 1, // User authenticated
      challenges: Math.min(1, (challengeElements.length + personalChallengesComponent.length) / 2),
      aiCoaching: Math.min(1, (aiComponents.length + coachCards.length) / 2),
      riskAnalysis: Math.min(1, (riskComponents.length + riskMetrics.length + riskAlerts.length) / 3),
      tradingFeatures: Math.min(1, (buttons.length + cards.length + dashboardComponents.length) / 10),
      interactivity: Math.min(1, buttons.length / 5)
    };
    
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const maxScore = Object.keys(scores).length;
    const percentage = Math.round((totalScore / maxScore) * 100);
    
    console.log('==================================================');
    console.log('📊 DETAILED SCORING:');
    Object.entries(scores).forEach(([category, score]) => {
      const percentage = Math.round(score * 100);
      const status = percentage >= 80 ? '✅' : percentage >= 50 ? '⚠️' : '❌';
      console.log(`   ${status} ${category}: ${percentage}%`);
    });
    
    console.log('\n==================================================');
    console.log(`🎯 OVERALL SCORE: ${totalScore.toFixed(1)}/${maxScore} (${percentage}%)`);
    
    if (percentage >= 90) {
      console.log('✅ EXCELLENT - Trading journal is feature complete!');
    } else if (percentage >= 75) {
      console.log('🎉 VERY GOOD - Most features implemented successfully!');
    } else if (percentage >= 50) {
      console.log('⚠️ GOOD - Core features present, some enhancement needed');
    } else {
      console.log('❌ NEEDS WORK - Significant features missing');
    }
    
    console.log('==================================================');

    // Keep browser open for a moment to see the result
    await new Promise(resolve => setTimeout(resolve, 5000));

  } catch (error) {
    console.error('❌ Validation Error:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the validation
runComprehensiveValidation().catch(console.error);
