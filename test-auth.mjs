import { chromium } from 'playwright';

async function testAuth() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🔍 Testing authentication...');
    
    await page.goto('http://localhost:8082/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    // Wait for page to load
    await page.waitForTimeout(3000);
    
    // Check current URL
    const url = page.url();
    console.log('Current URL:', url);
    
    // Check page title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Check if we're on auth page or dashboard
    const authElements = await page.$$('[data-testid="page-container"]');
    const dashboardElements = await page.$$('.ultra-trader-dashboard');
    
    console.log('Auth elements found:', authElements.length);
    console.log('Dashboard elements found:', dashboardElements.length);
    
    // Check page content
    const bodyText = await page.evaluate(() => document.body.textContent);
    console.log('Body text preview:', bodyText?.substring(0, 200));
    
    // Inject test user
    console.log('🔧 Injecting test user...');
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
    
    // Reload page
    console.log('🔄 Reloading page...');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // Check again
    const newUrl = page.url();
    console.log('New URL:', newUrl);
    
    const newAuthElements = await page.$$('[data-testid="page-container"]');
    const newDashboardElements = await page.$$('.ultra-trader-dashboard');
    
    console.log('New auth elements found:', newAuthElements.length);
    console.log('New dashboard elements found:', newDashboardElements.length);
    
    // Take screenshot
    await page.screenshot({ path: 'test-auth.png' });
    console.log('Screenshot saved as test-auth.png');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

testAuth().catch(console.error); 