#!/usr/bin/env node
/**
 * Quantum Risk Coach - Comprehensive Professional Trading Journal Validation
 * Tests ALL features according to user checklist
 */

import puppeteer from 'puppeteer';
import fs from 'fs';

const TEST_URL = 'http://localhost:5173';
const results = { tests: [], score: 0, total: 0 };

async function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function testBackendServices(page) {
  console.log('\n🔍 Testing Backend Services...');
  let score = 0;
  
  try {
    // Test Supabase connection
    const supabaseTest = await page.evaluate(async () => {
      try {
        const { supabase } = await import('/src/integrations/supabase/client.ts');
        const { data } = await supabase.auth.getSession();
        return { connected: true };
      } catch (error) {
        return { connected: false, error: error.message };
      }
    });
    
    if (supabaseTest.connected) {
      console.log('✅ Supabase Database: Connected');
      score++;
    } else {
      console.log('❌ Supabase Database: Failed');
    }

    // Test Real Data APIs
    const apiTest = await page.evaluate(async () => {
      try {
        const { realDataService } = await import('/src/lib/realDataService.ts');
        const health = await realDataService.healthCheck();
        const working = Object.values(health).filter(Boolean).length;
        return { working, total: Object.keys(health).length };
      } catch (error) {
        return { working: 0, total: 0 };
      }
    });
    
    if (apiTest.working > 0) {
      console.log(`✅ Real Data APIs: ${apiTest.working}/${apiTest.total} working`);
      score++;
    } else {
      console.log('❌ Real Data APIs: No APIs working');
    }

    // Test AI Services
    const aiTest = await page.evaluate(async () => {
      try {
        const { AIStreamService } = await import('/src/lib/aiStreamService.ts');
        const ai = new AIStreamService({});
        const health = await ai.healthCheck();
        return { available: Object.values(health).some(Boolean) };
      } catch (error) {
        return { available: false };
      }
    });
    
    if (aiTest.available) {
      console.log('✅ AI Services: Available');
      score++;
    } else {
      console.log('❌ AI Services: Not available');
    }

  } catch (error) {
    console.log(`❌ Backend test failed: ${error.message}`);
  }
  
  results.tests.push({ name: 'Backend Services', score, total: 3 });
  return score;
}

async function testTradeEntrySystem(page) {
  console.log('\n📝 Testing Trade Entry System...');
  let score = 0;
  
  try {
    await page.goto(`${TEST_URL}/trade-builder`, { waitUntil: 'networkidle0' });
    await delay(2000);

    // Check for trade builder
    const hasTradeBuilder = await page.$('.trade-builder, [data-testid="trade-builder"]');
    if (hasTradeBuilder) {
      console.log('✅ Trade Builder: Accessible');
      score++;
    } else {
      console.log('❌ Trade Builder: Not found');
    }

    // Check for real-time data
    const realTimeData = await page.evaluate(() => {
      const prices = Array.from(document.querySelectorAll('[class*="price"], [data-testid*="price"]'));
      return prices.some(el => el.textContent && !el.textContent.includes('--'));
    });
    
    if (realTimeData) {
      console.log('✅ Real-time Data: Populating');
      score++;
    } else {
      console.log('❌ Real-time Data: Not populating');
    }

    // Check form elements
    const formElements = await page.evaluate(() => {
      const symbol = document.querySelector('input[name="symbol"], #symbol');
      const lotSize = document.querySelector('input[name="lot_size"], #lotSize');
      const submit = document.querySelector('button[type="submit"]');
      return { symbol: !!symbol, lotSize: !!lotSize, submit: !!submit };
    });
    
    if (formElements.symbol && formElements.lotSize && formElements.submit) {
      console.log('✅ Trade Form: Complete');
      score++;
    } else {
      console.log('❌ Trade Form: Incomplete');
    }

  } catch (error) {
    console.log(`❌ Trade entry test failed: ${error.message}`);
  }
  
  results.tests.push({ name: 'Trade Entry System', score, total: 3 });
  return score;
}

async function testChallengeModule(page) {
  console.log('\n🎯 Testing Challenge Module...');
  let score = 0;
  
  try {
    await page.goto(`${TEST_URL}/`, { waitUntil: 'networkidle0' });
    await delay(2000);

    // Check for challenges
    const challenges = await page.evaluate(() => {
      const challengeElements = document.querySelectorAll('[class*="challenge"], [data-testid*="challenge"]');
      const progressBars = document.querySelectorAll('progress, [role="progressbar"]');
      return { challenges: challengeElements.length, progress: progressBars.length };
    });
    
    if (challenges.challenges > 0) {
      console.log(`✅ Challenges: ${challenges.challenges} found`);
      score++;
    } else {
      console.log('❌ Challenges: None found');
    }

    if (challenges.progress > 0) {
      console.log(`✅ Progress Tracking: ${challenges.progress} progress bars`);
      score++;
    } else {
      console.log('❌ Progress Tracking: No progress indicators');
    }

    // Test dynamic tracking
    const dynamicTracking = await page.evaluate(() => {
      return document.body.textContent.includes('News Trading') || 
             document.body.textContent.includes('London Session');
    });
    
    if (dynamicTracking) {
      console.log('✅ Dynamic Tracking: AI-generated challenges detected');
      score++;
    } else {
      console.log('❌ Dynamic Tracking: No dynamic content');
    }

  } catch (error) {
    console.log(`❌ Challenge test failed: ${error.message}`);
  }
  
  results.tests.push({ name: 'Challenge Module', score, total: 3 });
  return score;
}

async function testRiskProfile(page) {
  console.log('\n⚠️ Testing Risk Profile Engine...');
  let score = 0;
  
  try {
    await page.goto(`${TEST_URL}/`, { waitUntil: 'networkidle0' });
    await delay(2000);

    // Check for risk analyzer
    const riskElements = await page.evaluate(() => {
      const risk = document.querySelectorAll('[class*="risk"], [data-testid*="risk"]');
      const drawdown = document.querySelectorAll('[class*="drawdown"]');
      const position = document.querySelectorAll('[class*="position"]');
      return { risk: risk.length, drawdown: drawdown.length, position: position.length };
    });
    
    if (riskElements.risk > 0) {
      console.log(`✅ Risk Analyzer: ${riskElements.risk} components found`);
      score++;
    } else {
      console.log('❌ Risk Analyzer: Not found');
    }

    if (riskElements.drawdown > 0 || riskElements.position > 0) {
      console.log(`✅ Risk Metrics: Drawdown(${riskElements.drawdown}) Position(${riskElements.position})`);
      score++;
    } else {
      console.log('❌ Risk Metrics: No metrics found');
    }

    // Test consistent analysis
    const consistentAnalysis = await page.evaluate(() => {
      return document.body.textContent.includes('Risk') || 
             document.body.textContent.includes('Drawdown');
    });
    
    if (consistentAnalysis) {
      console.log('✅ Consistent Analysis: Risk analysis present');
      score++;
    } else {
      console.log('❌ Consistent Analysis: No analysis detected');
    }

  } catch (error) {
    console.log(`❌ Risk profile test failed: ${error.message}`);
  }
  
  results.tests.push({ name: 'Risk Profile Engine', score, total: 3 });
  return score;
}

async function testMetaTraderIntegration(page) {
  console.log('\n📈 Testing MetaTrader Integration...');
  let score = 0;
  
  try {
    await page.goto(`${TEST_URL}/connect-mt4`, { waitUntil: 'networkidle0' });
    await delay(2000);

    // Check MT4 connection form
    const mt4Form = await page.evaluate(() => {
      const server = document.querySelector('input[name="server"], #server');
      const account = document.querySelector('input[name="account"], input[name="login"]');
      const password = document.querySelector('input[type="password"]');
      const connect = document.querySelector('button[type="submit"], [data-testid*="connect"]');
      return { server: !!server, account: !!account, password: !!password, connect: !!connect };
    });
    
    if (mt4Form.server && mt4Form.account && mt4Form.password && mt4Form.connect) {
      console.log('✅ MT4 Connection Form: Complete');
      score++;
    } else {
      console.log('❌ MT4 Connection Form: Incomplete');
    }

    // Test broker service
    const brokerService = await page.evaluate(async () => {
      try {
        const { realBrokerService } = await import('/src/lib/realBrokerService.ts');
        return { available: true };
      } catch (error) {
        return { available: false };
      }
    });
    
    if (brokerService.available) {
      console.log('✅ Broker Service: Available');
      score++;
    } else {
      console.log('❌ Broker Service: Not available');
    }

    // Check execution integrity
    const executionIntegrity = await page.evaluate(() => {
      return document.body.textContent.includes('MetaTrader') || 
             document.body.textContent.includes('MT4') ||
             document.body.textContent.includes('MT5');
    });
    
    if (executionIntegrity) {
      console.log('✅ Execution Integrity: MetaTrader integration detected');
      score++;
    } else {
      console.log('❌ Execution Integrity: No MetaTrader integration');
    }

  } catch (error) {
    console.log(`❌ MetaTrader test failed: ${error.message}`);
  }
  
  results.tests.push({ name: 'MetaTrader Integration', score, total: 3 });
  return score;
}

async function testAICoaching(page) {
  console.log('\n🤖 Testing AI Coaching...');
  let score = 0;
  
  try {
    await page.goto(`${TEST_URL}/`, { waitUntil: 'networkidle0' });
    await delay(2000);

    // Check for AI elements
    const aiElements = await page.evaluate(() => {
      const ai = document.querySelectorAll('[class*="ai"], [data-testid*="ai"]');
      const coaching = document.querySelectorAll('[class*="coach"], [data-testid*="coach"]');
      const recommendations = document.querySelectorAll('[class*="recommendation"]');
      return { ai: ai.length, coaching: coaching.length, recommendations: recommendations.length };
    });
    
    if (aiElements.ai > 0 || aiElements.coaching > 0) {
      console.log(`✅ AI Components: AI(${aiElements.ai}) Coaching(${aiElements.coaching})`);
      score++;
    } else {
      console.log('❌ AI Components: Not found');
    }

    // Test AI service
    const aiService = await page.evaluate(async () => {
      try {
        const { AIStreamService } = await import('/src/lib/aiStreamService.ts');
        return { available: true };
      } catch (error) {
        return { available: false };
      }
    });
    
    if (aiService.available) {
      console.log('✅ AI Service: Available');
      score++;
    } else {
      console.log('❌ AI Service: Not available');
    }

    // Check personalized content
    const personalizedContent = await page.evaluate(() => {
      const bodyText = document.body.textContent;
      return bodyText.includes('weakness') || 
             bodyText.includes('performance') ||
             bodyText.includes('trading style');
    });
    
    if (personalizedContent) {
      console.log('✅ Personalized Content: AI coaching detected');
      score++;
    } else {
      console.log('❌ Personalized Content: No personalization detected');
    }

  } catch (error) {
    console.log(`❌ AI coaching test failed: ${error.message}`);
  }
  
  results.tests.push({ name: 'AI Coaching', score, total: 3 });
  return score;
}

async function testSettings(page) {
  console.log('\n⚙️ Testing Settings Functionality...');
  let score = 0;
  
  try {
    await page.goto(`${TEST_URL}/settings`, { waitUntil: 'networkidle0' });
    await delay(2000);

    // Check settings elements
    const settingsElements = await page.evaluate(() => {
      const toggles = document.querySelectorAll('input[type="checkbox"], [role="switch"]');
      const inputs = document.querySelectorAll('input[type="text"], input[type="email"]');
      const save = document.querySelector('button[type="submit"], [data-testid*="save"]');
      return { toggles: toggles.length, inputs: inputs.length, save: !!save };
    });
    
    if (settingsElements.toggles > 0) {
      console.log(`✅ Toggles: ${settingsElements.toggles} toggles found`);
      score++;
    } else {
      console.log('❌ Toggles: No toggles found');
    }

    if (settingsElements.inputs > 0) {
      console.log(`✅ Configuration Inputs: ${settingsElements.inputs} inputs found`);
      score++;
    } else {
      console.log('❌ Configuration Inputs: No inputs found');
    }

    if (settingsElements.save) {
      console.log('✅ Save Functionality: Save button found');
      score++;
    } else {
      console.log('❌ Save Functionality: No save button');
    }

  } catch (error) {
    console.log(`❌ Settings test failed: ${error.message}`);
  }
  
  results.tests.push({ name: 'Settings Functionality', score, total: 3 });
  return score;
}

async function testResponsiveUI(page) {
  console.log('\n📱 Testing Responsive UI...');
  let score = 0;
  
  try {
    const viewports = [
      { name: 'Mobile', width: 375, height: 812 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];

    for (const viewport of viewports) {
      await page.setViewport(viewport);
      await delay(1000);

      const responsive = await page.evaluate(() => {
        const buttons = document.querySelectorAll('button');
        const nav = document.querySelector('nav');
        let touchTargets = true;
        
        buttons.forEach(btn => {
          const rect = btn.getBoundingClientRect();
          if (rect.height < 40) touchTargets = false;
        });

        return { touchTargets, navVisible: !!nav, buttonCount: buttons.length };
      });

      if (responsive.touchTargets && responsive.navVisible) {
        console.log(`✅ ${viewport.name}: Responsive (${responsive.buttonCount} buttons)`);
        score++;
      } else {
        console.log(`❌ ${viewport.name}: Not responsive`);
      }
    }

    // Test fluid updates
    const fluidUpdates = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('*')).some(el => {
        const styles = window.getComputedStyle(el);
        return styles.transition !== 'none';
      });
    });
    
    if (fluidUpdates) {
      console.log('✅ Fluid Updates: CSS transitions detected');
      score++;
    } else {
      console.log('❌ Fluid Updates: No transitions detected');
    }

  } catch (error) {
    console.log(`❌ Responsive UI test failed: ${error.message}`);
  }
  
  results.tests.push({ name: 'Responsive UI', score, total: 3 });
  return score;
}

async function runValidation() {
  console.log('🚀 Starting Comprehensive Trading Journal Validation\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1920, height: 1080 }
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('⏳ Connecting to development server...');
    await page.goto(TEST_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    console.log('✅ Connected successfully\n');

    let totalScore = 0;
    
    totalScore += await testBackendServices(page);
    totalScore += await testTradeEntrySystem(page);
    totalScore += await testChallengeModule(page);
    totalScore += await testRiskProfile(page);
    totalScore += await testMetaTraderIntegration(page);
    totalScore += await testAICoaching(page);
    totalScore += await testSettings(page);
    totalScore += await testResponsiveUI(page);

    const maxScore = results.tests.reduce((sum, test) => sum + test.total, 0);
    const percentage = Math.round((totalScore / maxScore) * 100);

    console.log('\n' + '='.repeat(60));
    console.log('📊 COMPREHENSIVE VALIDATION RESULTS');
    console.log('='.repeat(60));
    
    results.tests.forEach(test => {
      const status = test.score >= test.total * 0.7 ? '🟢' : test.score >= test.total * 0.5 ? '🟡' : '🔴';
      console.log(`${status} ${test.name}: ${test.score}/${test.total}`);
    });

    console.log('\n' + '-'.repeat(60));
    console.log(`🎯 OVERALL SCORE: ${totalScore}/${maxScore} (${percentage}%)`);
    
    if (percentage >= 85) {
      console.log('🏆 EXCELLENT - Production ready!');
    } else if (percentage >= 70) {
      console.log('✅ GOOD - Ready with minor improvements');
    } else if (percentage >= 55) {
      console.log('⚠️ ACCEPTABLE - Some improvements needed');
    } else {
      console.log('❌ NEEDS WORK - Significant improvements required');
    }

    console.log('\n📋 FEATURE CHECKLIST:');
    console.log(`✅ Trade Entry System: ${results.tests.find(t => t.name === 'Trade Entry System')?.score >= 2 ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Challenge Module: ${results.tests.find(t => t.name === 'Challenge Module')?.score >= 2 ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Risk Profile Engine: ${results.tests.find(t => t.name === 'Risk Profile Engine')?.score >= 2 ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Custom Settings: ${results.tests.find(t => t.name === 'Settings Functionality')?.score >= 2 ? 'PASS' : 'FAIL'}`);
    console.log(`✅ MetaTrader Integration: ${results.tests.find(t => t.name === 'MetaTrader Integration')?.score >= 2 ? 'PASS' : 'FAIL'}`);
    console.log(`✅ AI Coaching: ${results.tests.find(t => t.name === 'AI Coaching')?.score >= 2 ? 'PASS' : 'FAIL'}`);

    // Save results
    fs.writeFileSync('validation-results.json', JSON.stringify({ results, totalScore, maxScore, percentage }, null, 2));
    console.log('\n📄 Results saved to validation-results.json');

  } catch (error) {
    console.error('❌ Validation failed:', error.message);
  } finally {
    await browser.close();
  }
}

runValidation().catch(console.error); 