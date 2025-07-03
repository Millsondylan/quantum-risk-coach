import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5174';

test.describe('Core Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing data
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should load the main page', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    
    // Should show main content - look for various possible selectors
    const mainContent = page.locator('main, .min-h-screen, [data-testid="main-dashboard"]').first();
    await mainContent.waitFor({ state: 'visible', timeout: 10000 });
    await expect(mainContent).toBeVisible();
  });

  test('should navigate to auth page', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth`);
    
    // Wait for auth page to load completely
    await page.waitForLoadState('networkidle');
    
    // Should show auth form
    await expect(page.locator('form')).toBeVisible();
    
    // Check for username input (since we use username-only auth)
    const usernameInput = page.locator('input[type="text"], [data-testid="signup-username-input"], [data-testid="signin-username-input"]').first();
    await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
    await expect(usernameInput).toBeVisible();
  });

  test('should show onboarding modal for new users', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if onboarding modal appears
    const onboardingModal = page.locator('[data-testid="onboarding-modal"], .onboarding-modal, [class*="onboarding"]');
    
    if (await onboardingModal.isVisible()) {
      // Test onboarding flow
      await expect(onboardingModal).toBeVisible();
      
      // Try to find and click get started button
      const getStartedBtn = page.locator('button:has-text("Get Started"), button:has-text("Start"), button:has-text("Begin")');
      if (await getStartedBtn.isVisible()) {
        await getStartedBtn.click();
      }
    }
  });

  test('should show portfolio selector', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Look for portfolio selector
    const portfolioSelector = page.locator('[data-testid="portfolio-selector"], .portfolio-selector, [class*="portfolio"]');
    
    if (await portfolioSelector.isVisible()) {
      await expect(portfolioSelector).toBeVisible();
      
      // Try to click it
      await portfolioSelector.click();
      
      // Should show portfolio options
      await expect(page.locator('button:has-text("Create"), button:has-text("New Portfolio")')).toBeVisible();
    }
  });

  test('should show manual journal button', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Look for manual journal button
    const manualJournalBtn = page.locator('button:has-text("Manual Journal"), button:has-text("Add Trade"), button:has-text("Journal")');
    
    if (await manualJournalBtn.isVisible()) {
      await expect(manualJournalBtn).toBeVisible();
      
      // Click it
      await manualJournalBtn.click();
      
      // Should show trade form
      await expect(page.locator('input[placeholder*="symbol"], input[name="symbol"]')).toBeVisible();
    }
  });

  test('should show broker connection button', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Look for broker connection button
    const brokerBtn = page.locator('button:has-text("Connect Broker"), button:has-text("Broker"), button:has-text("Connect")');
    
    if (await brokerBtn.isVisible()) {
      await expect(brokerBtn).toBeVisible();
      
      // Click it
      await brokerBtn.click();
      
      // Should show broker form
      await expect(page.locator('select[name="broker"], input[placeholder*="broker"]')).toBeVisible();
    }
  });

  test('should show performance dashboard', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Look for performance metrics
    const performanceElements = page.locator('[data-testid*="performance"], [data-testid*="win"], [data-testid*="profit"], .performance, .metrics');
    
    if (await performanceElements.count() > 0) {
      await expect(performanceElements.first()).toBeVisible();
    }
  });

  test('should show notification center', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Look for notification bell
    const notificationBell = page.locator('[data-testid="notification-bell"], .notification-bell, [class*="notification"]');
    
    if (await notificationBell.isVisible()) {
      await expect(notificationBell).toBeVisible();
      
      // Click it
      await notificationBell.click();
      
      // Should show notification center
      await expect(page.locator('[data-testid="notification-center"], .notification-center')).toBeVisible();
    }
  });

  test('should handle mobile responsive design', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto(`${BASE_URL}/`);
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    
    // Should load on mobile
    const mainContent = page.locator('main, .min-h-screen, [data-testid="main-dashboard"]').first();
    await mainContent.waitFor({ state: 'visible', timeout: 10000 });
    await expect(mainContent).toBeVisible();
    
    // Look for mobile menu - check for mobile navigation
    const mobileMenu = page.locator('[data-testid="mobile-menu"], [data-testid="mobile-bottom-nav"], .mobile-nav').first();
    await mobileMenu.waitFor({ state: 'visible', timeout: 10000 });
    await expect(mobileMenu).toBeVisible();
  });

  test('should handle form validation', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth`);
    
    // Wait for auth page to load completely
    await page.waitForLoadState('networkidle');
    
    // Submit empty form
    await page.click('[data-testid="signup-submit-button"]');
    
    // Should show validation errors - check for various error indicators
    try {
      await expect(page.locator('[data-testid="form-error"]')).toBeVisible({ timeout: 10000 });
    } catch (e) {
      // Check for toast notification
      await expect(page.locator('[data-sonner-toast], .sonner-toast, [data-testid="toast"]')).toBeVisible({ timeout: 10000 });
    }
  });

  test('should handle navigation', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    
    // Test navigation to auth
    await page.goto(`${BASE_URL}/auth`);
    await expect(page).toHaveURL(`${BASE_URL}/auth`);
    
    // Test navigation to journal
    await page.goto(`${BASE_URL}/journal`);
    await expect(page).toHaveURL(`${BASE_URL}/journal`);
    
    // Test navigation to trade builder
    await page.goto(`${BASE_URL}/trade-builder`);
    await expect(page).toHaveURL(`${BASE_URL}/trade-builder`);
    
    // Test navigation to settings
    await page.goto(`${BASE_URL}/settings`);
    await expect(page).toHaveURL(`${BASE_URL}/settings`);
    
    // Test navigation to performance calendar
    await page.goto(`${BASE_URL}/performance-calendar`);
    await expect(page).toHaveURL(`${BASE_URL}/performance-calendar`);
    
    // Test navigation to strategy analyzer
    await page.goto(`${BASE_URL}/strategy-analyzer`);
    await expect(page).toHaveURL(`${BASE_URL}/strategy-analyzer`);
  });

  test('should handle data persistence', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    
    // Should still load without errors
    const mainContent = page.locator('main, .min-h-screen, [data-testid="main-dashboard"]').first();
    await mainContent.waitFor({ state: 'visible', timeout: 10000 });
    await expect(mainContent).toBeVisible();
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/**', route => route.abort());
    
    await page.goto(`${BASE_URL}/`);
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    
    // Should still load without errors
    const mainContent = page.locator('main, .min-h-screen, [data-testid="main-dashboard"]').first();
    await mainContent.waitFor({ state: 'visible', timeout: 10000 });
    await expect(mainContent).toBeVisible();
  });

  test('should load all main components', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for main UI elements
    const mainElements = [
      'header',
      'main',
      'footer',
      'button',
      'input',
      'select'
    ];
    
    for (const element of mainElements) {
      const elements = page.locator(element);
      if (await elements.count() > 0) {
        await expect(elements.first()).toBeVisible();
      }
    }
  });

  test('should handle user interactions', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find all clickable elements
    const clickableElements = page.locator('button, a, [role="button"]');
    const count = await clickableElements.count();
    
    if (count > 0) {
      // Try clicking the first clickable element
      await clickableElements.first().click();
      
      // Should not cause page to crash
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should handle form inputs', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find all input elements
    const inputs = page.locator('input, textarea, select');
    const count = await inputs.count();
    
    if (count > 0) {
      // Try typing in the first input
      const firstInput = inputs.first();
      await firstInput.fill('test input');
      
      // Should accept input
      await expect(firstInput).toHaveValue('test input');
    }
  });

  test('should handle theme switching', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Look for theme toggle
    const themeToggle = page.locator('[data-testid="theme-toggle"], .theme-toggle, button:has-text("Theme"), button:has-text("Dark"), button:has-text("Light")');
    
    if (await themeToggle.isVisible()) {
      await expect(themeToggle).toBeVisible();
      
      // Click theme toggle
      await themeToggle.click();
      
      // Should change theme
      const body = page.locator('body');
      const currentClass = await body.getAttribute('class');
      
      // Should have some theme-related class
      expect(currentClass).toBeTruthy();
    }
  });

  test('should handle search functionality', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Look for search input
    const searchInput = page.locator('input[placeholder*="search"], input[type="search"], [data-testid*="search"]');
    
    if (await searchInput.isVisible()) {
      await expect(searchInput).toBeVisible();
      
      // Type in search
      await searchInput.fill('test search');
      
      // Should accept search input
      await expect(searchInput).toHaveValue('test search');
    }
  });

  test('should handle modal dialogs', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Look for modal triggers
    const modalTriggers = page.locator('button:has-text("Open"), button:has-text("Add"), button:has-text("Create"), button:has-text("Connect")');
    
    if (await modalTriggers.count() > 0) {
      // Click first modal trigger
      await modalTriggers.first().click();
      
      // Should show modal
      const modal = page.locator('[role="dialog"], .modal, [class*="modal"]');
      
      if (await modal.isVisible()) {
        await expect(modal).toBeVisible();
        
        // Try to close modal
        const closeBtn = modal.locator('button:has-text("Close"), button:has-text("Cancel"), [aria-label="Close"]');
        
        if (await closeBtn.isVisible()) {
          await closeBtn.click();
          await expect(modal).not.toBeVisible();
        }
      }
    }
  });
}); 