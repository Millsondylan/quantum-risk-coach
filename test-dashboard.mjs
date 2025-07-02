import { chromium } from 'playwright';

async function testDashboard() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🔍 Testing dashboard...');
    
    await page.goto('http://localhost:8082/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    // Inject test user
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
    });
    
    // Reload and wait
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);
    
    // Check what's actually on the page
    const pageContent = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        bodyText: document.body.textContent?.substring(0, 500),
        allElements: document.querySelectorAll('*').length,
        divs: document.querySelectorAll('div').length,
        buttons: document.querySelectorAll('button').length,
        cards: document.querySelectorAll('[class*="card"]').length,
        dashboardElements: document.querySelectorAll('[class*="dashboard"]').length,
        challengeElements: document.querySelectorAll('[class*="challenge"]').length,
        aiElements: document.querySelectorAll('[class*="ai"], [class*="AI"]').length,
        riskElements: document.querySelectorAll('[class*="risk"], [class*="Risk"]').length
      };
    });
    
    console.log('📄 PAGE CONTENT:');
    console.log('Title:', pageContent.title);
    console.log('URL:', pageContent.url);
    console.log('Body text preview:', pageContent.bodyText);
    console.log('Total elements:', pageContent.allElements);
    console.log('Divs:', pageContent.divs);
    console.log('Buttons:', pageContent.buttons);
    console.log('Cards:', pageContent.cards);
    console.log('Dashboard elements:', pageContent.dashboardElements);
    console.log('Challenge elements:', pageContent.challengeElements);
    console.log('AI elements:', pageContent.aiElements);
    console.log('Risk elements:', pageContent.riskElements);
    
    // Take screenshot
    await page.screenshot({ path: 'test-dashboard.png' });
    console.log('Screenshot saved as test-dashboard.png');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

testDashboard().catch(console.error); 