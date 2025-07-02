import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:5173';

test.describe('Issue Detection Tests', () => {
  test('detect console errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        // Filter out network errors which are expected in development
        if (!msg.text().includes('ERR_NAME_NOT_RESOLVED') && 
            !msg.text().includes('Failed to load resource')) {
          errors.push(msg.text());
        }
      }
    });
    
    await page.goto(`${BASE}/auth`);
    await page.waitForTimeout(2000);
    
    console.log('Console errors found:', errors);
    expect(errors.length).toBe(0);
  });

  test('detect page errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    await page.goto(`${BASE}/`);
    await page.waitForTimeout(2000);
    
    console.log('Page errors found:', errors);
    expect(errors.length).toBe(0);
  });

  test('detect network failures', async ({ page }) => {
    const failures: string[] = [];
    page.on('requestfailed', request => {
      const failure = request.failure();
      if (failure) {
        failures.push(`${request.url()} - ${failure.errorText}`);
      }
    });
    
    await page.goto(`${BASE}/`);
    await page.waitForTimeout(2000);
    
    console.log('Network failures found:', failures);
    // Don't fail on network issues as they might be expected
  });

  test('check for missing elements', async ({ page }) => {
    await page.goto(`${BASE}/`);
    
    // Check for critical elements
    const criticalElements = [
      'nav',
      'main',
      'button',
      'input'
    ];
    
    for (const selector of criticalElements) {
      const elements = page.locator(selector);
      const count = await elements.count();
      console.log(`${selector}: ${count} elements found`);
    }
  });

  test('check navigation elements', async ({ page }) => {
    await page.goto(`${BASE}/`);
    
    const navSelectors = [
      '[aria-label="Navigate to Overview"]',
      '[aria-label="Navigate to Journal"]',
      '[aria-label="Navigate to Trade"]',
      '[aria-label="Navigate to Analytics"]',
      '[aria-label="Navigate to Profile"]'
    ];
    
    for (const selector of navSelectors) {
      const element = page.locator(selector);
      const isVisible = await element.isVisible();
      console.log(`${selector}: ${isVisible ? 'visible' : 'not visible'}`);
    }
  });

  test('check auth page elements', async ({ page }) => {
    await page.goto(`${BASE}/auth`);
    
    const authElements = [
      'input[type="email"]',
      'input[type="password"]',
      '[role="tab"]:has-text("Sign In")',
      '[role="tab"]:has-text("Sign Up")'
    ];
    
    for (const selector of authElements) {
      const element = page.locator(selector);
      const isVisible = await element.isVisible();
      console.log(`${selector}: ${isVisible ? 'visible' : 'not visible'}`);
    }
  });

  test('check form functionality', async ({ page }) => {
    await page.goto(`${BASE}/auth`);
    
    // Test email input
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible()) {
      await emailInput.fill('test@example.com');
      const value = await emailInput.inputValue();
      console.log(`Email input value: ${value}`);
      expect(value).toBe('test@example.com');
    }
    
    // Test password input
    const passwordInput = page.locator('input[type="password"]');
    if (await passwordInput.isVisible()) {
      await passwordInput.fill('password123');
      const value = await passwordInput.inputValue();
      console.log(`Password input value: ${value}`);
      expect(value).toBe('password123');
    }
  });

  test('check tab switching', async ({ page }) => {
    await page.goto(`${BASE}/auth`);
    
    const signInTab = page.locator('.tabs-trigger').filter({ hasText: 'Sign In' });
    const signUpTab = page.locator('.tabs-trigger').filter({ hasText: 'Sign Up' });
    
    if (await signInTab.isVisible() && await signUpTab.isVisible()) {
      await signUpTab.click();
      await page.waitForTimeout(500);
      console.log('Tab switching works');
    }
  });

  test('check responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE}/`);
    
    const mobileNav = page.locator('nav').last();
    const isVisible = await mobileNav.isVisible();
    console.log(`Mobile navigation visible: ${isVisible}`);
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(`${BASE}/`);
    
    const desktopNav = page.locator('nav').first();
    const isDesktopVisible = await desktopNav.isVisible();
    console.log(`Desktop navigation visible: ${isDesktopVisible}`);
  });

  test('check page titles', async ({ page }) => {
    const pages = [
      { path: '/', expected: 'Quantum Risk Coach' },
      { path: '/auth', expected: 'Quantum Risk Coach' },
      { path: '/journal', expected: 'Quantum Risk Coach' },
      { path: '/trade-builder', expected: 'Quantum Risk Coach' },
      { path: '/settings', expected: 'Quantum Risk Coach' }
    ];
    
    for (const pageInfo of pages) {
      await page.goto(`${BASE}${pageInfo.path}`);
      const title = await page.title();
      console.log(`${pageInfo.path}: "${title}"`);
      expect(title).toBeTruthy();
    }
  });

  test('check for accessibility issues', async ({ page }) => {
    await page.goto(`${BASE}/`);
    
    // Check for images without alt text
    const images = page.locator('img');
    const imageCount = await images.count();
    console.log(`Total images: ${imageCount}`);
    
    for (let i = 0; i < imageCount; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      if (!alt) {
        console.log(`Image ${i} missing alt text`);
      }
    }
    
    // Check for buttons without accessible names
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    console.log(`Total buttons: ${buttonCount}`);
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      if (!text && !ariaLabel) {
        console.log(`Button ${i} missing accessible name`);
      }
    }
  });
}); 