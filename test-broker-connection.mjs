import { chromium } from 'playwright';

async function testBrokerConnection() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('=== Testing Broker Connection ===');
    
    // Navigate to the app
    await page.goto('http://localhost:5175');
    await page.waitForLoadState('networkidle');
    
    console.log('Page loaded:', await page.title());
    
    // Check if we need to authenticate first
    if (page.url().includes('/auth')) {
      console.log('Authenticating...');
      await page.fill('input[type="text"]', 'testuser');
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
    }
    
    // Look for broker connection elements
    const brokerButtons = await page.locator('button:has-text("Connect Broker")').all();
    console.log('Found broker connection buttons:', brokerButtons.length);
    
    // Also look for the new broker section
    const brokerSection = page.locator('text=Broker Connections');
    if (await brokerSection.count() > 0) {
      console.log('✅ Broker Connections section found');
    }
    
    if (brokerButtons.length > 0) {
      // Click the first broker connection button
      await brokerButtons[0].click();
      await page.waitForTimeout(1000);
      
      // Check if modal opened
      const modal = page.locator('[role="dialog"]');
      if (await modal.isVisible()) {
        console.log('✅ Broker connection modal opened successfully');
        
        // Check for broker selection
        const brokerSelect = page.locator('select[name="broker"], [role="combobox"]');
        if (await brokerSelect.count() > 0) {
          console.log('✅ Broker selection dropdown found');
        }
        
        // Check for credential fields
        const apiKeyField = page.locator('input[placeholder*="API Key"], input[placeholder*="api"]');
        const secretField = page.locator('input[placeholder*="Secret"], input[type="password"]');
        
        if (await apiKeyField.count() > 0) {
          console.log('✅ API Key field found');
        }
        
        if (await secretField.count() > 0) {
          console.log('✅ Secret field found');
        }
        
        // Test filling credentials
        if (await apiKeyField.count() > 0 && await secretField.count() > 0) {
          await apiKeyField.first().fill('test-api-key');
          await secretField.first().fill('test-secret');
          console.log('✅ Credentials filled successfully');
        }
        
        // Look for connect button
        const connectButton = page.locator('button:has-text("Connect")');
        if (await connectButton.count() > 0) {
          console.log('✅ Connect button found');
        }
        
      } else {
        console.log('❌ Broker connection modal did not open');
      }
    } else {
      console.log('❌ No broker connection buttons found');
      
      // Look for alternative broker connection elements
      const addBrokerButtons = await page.locator('button:has-text("Add"), button:has-text("Connect"), button:has-text("Broker")').all();
      console.log('Found alternative broker buttons:', addBrokerButtons.length);
      
      // Check for onboarding modal
      const onboardingModal = page.locator('[role="dialog"]:has-text("Welcome")');
      if (await onboardingModal.isVisible()) {
        console.log('✅ Onboarding modal found - this might contain broker options');
      }
    }
    
    // Check for any broker-related content
    const brokerContent = await page.locator('text=/broker/i, text=/connect/i, text=/trading/i').all();
    console.log('Found broker-related content:', brokerContent.length);
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

testBrokerConnection(); 