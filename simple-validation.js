#!/usr/bin/env node

import puppeteer from 'puppeteer';

const TEST_URL = 'http://localhost:8084';

async function runSimpleValidation() {
  console.log('🚀 SIMPLE VALIDATION TEST - Quantum Risk Coach');
  console.log('==================================================');

  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });
  
  try {
    const page = await browser.newPage();
    
    console.log('⏳ Connecting to application...');
    await page.goto(TEST_URL, { waitUntil: 'networkidle2', timeout: 15000 });
    
    console.log('✅ Connected successfully\n');

    // Test 1: Basic Page Load
    const title = await page.title();
    console.log('📄 Page Title:', title);
    
    // Test 2: Count Challenge Elements
    const challengeElements = await page.evaluate(() => {
      const challenges = document.querySelectorAll('[data-testid*="challenge"], .challenge, [class*="challenge"]');
      const badges = document.querySelectorAll('.badge, [data-testid*="badge"]');
      const progress = document.querySelectorAll('.progress-bar, [role="progressbar"]');
      const rewards = document.querySelectorAll('.reward, [class*="reward"]');
      
      return {
        challenges: challenges.length,
        badges: badges.length,
        progress: progress.length,
        rewards: rewards.length
      };
    });
    
    console.log('\n🎯 CHALLENGE MODULE:');
    console.log('   Challenge Elements:', challengeElements.challenges);
    console.log('   Badge Elements:', challengeElements.badges);
    console.log('   Progress Bars:', challengeElements.progress);
    console.log('   Reward Elements:', challengeElements.rewards);
    
    // Test 3: Count AI Elements
    const aiElements = await page.evaluate(() => {
      const aiComponents = document.querySelectorAll('[data-testid*="ai"], .ai-component, [class*="ai"]');
      const recommendations = document.querySelectorAll('.recommendation-element, [class*="recommendation"]');
      const personalization = document.querySelectorAll('.personalization-indicator, [class*="personalization"]');
      
      return {
        aiComponents: aiComponents.length,
        recommendations: recommendations.length,
        personalization: personalization.length
      };
    });
    
    console.log('\n🤖 AI COACHING:');
    console.log('   AI Components:', aiElements.aiComponents);
    console.log('   Recommendations:', aiElements.recommendations);
    console.log('   Personalization:', aiElements.personalization);
    
    // Test 4: Count Risk Elements
    const riskElements = await page.evaluate(() => {
      const riskComponents = document.querySelectorAll('[data-testid*="risk"], .risk-analysis-component, [class*="risk"]');
      const metrics = document.querySelectorAll('.risk-metric, [class*="metric"]');
      const assets = document.querySelectorAll('.asset-class, [data-asset]');
      
      return {
        riskComponents: riskComponents.length,
        metrics: metrics.length,
        assets: assets.length
      };
    });
    
    console.log('\n⚠️ RISK ANALYSIS:');
    console.log('   Risk Components:', riskElements.riskComponents);
    console.log('   Risk Metrics:', riskElements.metrics);
    console.log('   Asset Classes:', riskElements.assets);
    
    // Test 5: Count Interactive Elements
    const interactiveElements = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      const inputs = document.querySelectorAll('input');
      const cards = document.querySelectorAll('[class*="card"], .card');
      const prices = document.querySelectorAll('.price-element, .real-price-value, [data-price]');
      
      return {
        buttons: buttons.length,
        inputs: inputs.length,
        cards: cards.length,
        prices: prices.length
      };
    });
    
    console.log('\n📊 INTERACTIVE ELEMENTS:');
    console.log('   Buttons:', interactiveElements.buttons);
    console.log('   Input Fields:', interactiveElements.inputs);
    console.log('   Cards:', interactiveElements.cards);
    console.log('   Price Elements:', interactiveElements.prices);

    // Calculate Overall Score
    const totalElements = {
      challenges: challengeElements.challenges,
      badges: challengeElements.badges,
      aiComponents: aiElements.aiComponents,
      riskComponents: riskElements.riskComponents,
      buttons: interactiveElements.buttons,
      prices: interactiveElements.prices
    };
    
    const score = Object.values(totalElements).reduce((sum, count) => sum + (count > 0 ? 1 : 0), 0);
    const maxScore = Object.keys(totalElements).length;
    const percentage = Math.round((score / maxScore) * 100);
    
    console.log('\n==================================================');
    console.log(`🎯 OVERALL SCORE: ${score}/${maxScore} (${percentage}%)`);
    
    if (percentage >= 80) {
      console.log('✅ EXCELLENT - Trading journal is feature complete!');
    } else if (percentage >= 60) {
      console.log('⚠️ GOOD - Most features implemented, minor gaps remain');
    } else if (percentage >= 40) {
      console.log('📊 FAIR - Core features present, needs enhancement');
    } else {
      console.log('❌ NEEDS WORK - Significant features missing');
    }
    
    console.log('==================================================');

  } catch (error) {
    console.error('❌ Validation Error:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the validation
runSimpleValidation().catch(console.error); 