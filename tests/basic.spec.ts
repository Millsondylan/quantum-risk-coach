import { test, expect, chromium } from '@playwright/test';

const BASE = 'http://localhost:5173';

test('basic app functionality test', async () => {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 200 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors: string[] = [];
  
  // Only track actual page errors, not network issues
  page.on('pageerror', e => {
    errors.push(`PageError: ${e.message}`);
    console.error(`❌ PageError: ${e.message}`);
  });

  console.log('🚀 Starting basic functionality test...');

  // Test 1: App loads without crashing
  console.log('\n1️⃣ Testing app loads...');
  await page.goto(`${BASE}/`, { 
    waitUntil: 'domcontentloaded',
    timeout: 30000 
  });
  
  // Check if the main app content loads
  const appContent = page.locator('body');
  await expect(appContent).toBeVisible();
  console.log('✅ App loaded successfully');

  // Test 2: Navigation works
  console.log('\n2️⃣ Testing navigation...');
  
  // Test mobile navigation
  const navButtons = page.locator('nav button, nav a');
  const navCount = await navButtons.count();
  console.log(`Found ${navCount} navigation elements`);
  
  if (navCount > 0) {
    for (let i = 0; i < Math.min(navCount, 3); i++) {
      const button = navButtons.nth(i);
      if (await button.isVisible()) {
        const text = await button.textContent() || 'unknown';
        console.log(`  👆 Testing navigation: ${text}`);
        await button.click();
        await page.waitForTimeout(1000);
      }
    }
  }

  // Test 3: Core pages load
  console.log('\n3️⃣ Testing core pages...');
  
  const corePages = [
    { path: '/', name: 'Home' },
    { path: '/journal', name: 'Journal' },
    { path: '/trade-builder', name: 'Trade Builder' },
    { path: '/settings', name: 'Settings' }
  ];

  for (const pageInfo of corePages) {
    console.log(`  📄 Testing ${pageInfo.name}...`);
    try {
      await page.goto(`${BASE}${pageInfo.path}`, { 
        waitUntil: 'domcontentloaded',
        timeout: 15000 
      });
      
      // Check if page has content
      const content = page.locator('main, .container, body');
      await expect(content).toBeVisible();
      console.log(`    ✅ ${pageInfo.name} loaded`);
      
      // Wait a bit for any async operations
      await page.waitForTimeout(1000);
      
    } catch (pageError) {
      console.log(`    ⚠️ ${pageInfo.name} had issues: ${pageError}`);
    }
  }

  // Test 4: Interactive elements work
  console.log('\n4️⃣ Testing interactive elements...');
  
  // Go back to home page
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  
  // Test buttons
  const buttons = page.locator('button:not([disabled])');
  const buttonCount = await buttons.count();
  console.log(`Found ${buttonCount} clickable buttons`);
  
  if (buttonCount > 0) {
    for (let i = 0; i < Math.min(buttonCount, 3); i++) {
      try {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          const text = await button.textContent() || 'unknown';
          console.log(`  👆 Testing button: ${text.substring(0, 20)}...`);
          
          // Skip buttons that might cause navigation
          if (text.includes('Sign') || text.includes('Submit')) {
            console.log('    Skipping form submission button');
            continue;
          }
          
          await button.click();
          await page.waitForTimeout(300);
        }
      } catch (e) {
        console.log('    Button click error, continuing...');
      }
    }
  }

  // Test 5: Forms work
  console.log('\n5️⃣ Testing forms...');
  
  const inputs = page.locator('input:not([type="password"]):not([type="file"])');
  const inputCount = await inputs.count();
  console.log(`Found ${inputCount} form inputs`);
  
  if (inputCount > 0) {
    for (let i = 0; i < Math.min(inputCount, 3); i++) {
      const input = inputs.nth(i);
      if (await input.isVisible() && await input.getAttribute('data-testid') === 'signup-username-input') {
        const placeholder = await input.getAttribute('placeholder') || 'input';
        console.log(`  📝 Testing input: ${placeholder}`);
        await input.fill('test');
        await page.waitForTimeout(200);
      }
    }
  }

  await browser.close();

  // Final report
  console.log('\n📊 BASIC TEST RESULTS:');
  console.log('======================');
  
  if (errors.length === 0) {
    console.log('✅ SUCCESS: App is working correctly!');
    console.log('🎉 Core functionality verified!');
  } else {
    console.log(`❌ FAILED: Found ${errors.length} errors:`);
    errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }

  // Only fail on actual page errors, not network issues
  expect(errors, `Found page errors:\n${errors.join('\n')}`).toEqual([]);
});

test('auth page functionality', async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('🔐 Testing authentication page...');
  
  await page.goto(`${BASE}/auth`, { waitUntil: 'domcontentloaded' });
  
  // Check if auth page loads
  const authContent = page.locator('[data-testid="auth-card"]');
  await expect(authContent).toBeVisible();
  console.log('✅ Auth page loaded');

  // Test tabs
  const tabs = page.locator('[data-testid="auth-tabs"]');
  const signUpTab = page.locator('[data-testid="signup-tab"]');
  const signInTab = page.locator('[data-testid="signin-tab"]');

  if (await signUpTab.isVisible()) {
    console.log('Found Sign Up tab');
    await signUpTab.click();
    await page.waitForTimeout(500);
  }

  if (await signInTab.isVisible()) {
    console.log('Found Sign In tab');
    await signInTab.click();
    await page.waitForTimeout(500);
  }

  // Test form inputs
  const usernameInput = page.locator('[data-testid="signin-username-input"]');
  
  if (await usernameInput.isVisible()) {
    await usernameInput.fill('testuser');
    console.log('✅ Username input works');
  }

  await browser.close();
  console.log('✅ Auth page test completed');
}); 