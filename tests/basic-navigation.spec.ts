import { test, expect } from '@playwright/test';

test.describe('Basic Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Go to auth page and authenticate properly
    await page.goto('http://localhost:5178/auth');
    await page.waitForLoadState('networkidle');
    
    // Wait for auth page to load
    await page.locator('[data-testid="auth-tabs"]').waitFor({ state: 'visible', timeout: 10000 });
    
    // Fill in username and submit
    await page.locator('[data-testid="signup-username-input"]').fill('testuser');
    await page.locator('[data-testid="signup-submit-button"]').click();
    
    // Wait for authentication to complete
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Check if we need to complete onboarding
    const onboardingVisible = await page.locator('[data-testid="onboarding-step-username"]').isVisible();
    if (onboardingVisible) {
      // Complete onboarding quickly
      await page.locator('[data-testid="onboarding-username-input"]').fill('testuser');
      await page.locator('[data-testid="onboarding-next-button"]').click();
      await page.waitForTimeout(1000);
      
      // Skip through other onboarding steps
      for (let i = 0; i < 5; i++) {
        const nextButton = page.locator('[data-testid="onboarding-next-button"]');
        if (await nextButton.isVisible()) {
          await nextButton.click();
          await page.waitForTimeout(500);
        }
      }
      
      // Complete setup
      const completeButton = page.locator('button:has-text("Complete Setup")');
      if (await completeButton.isVisible()) {
        await completeButton.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
      }
    }
    
    // Wait for main app to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Debug: Take a screenshot and log the current URL
    await page.screenshot({ path: 'playwright-debug-after-onboarding.png' });
    console.log('DEBUG URL after onboarding:', page.url());
  });

  test('should navigate to all main sections', async ({ page }) => {
    // Wait for navigation to be visible
    await page.locator('[data-testid="mobile-bottom-nav"]').waitFor({ state: 'visible', timeout: 15000 });
    
    // Test navigation to each main section
    const sections = [
      { testId: 'nav-home', expectedUrl: '/' },
      { testId: 'nav-news', expectedUrl: '/news' },
      { testId: 'nav-journal', expectedUrl: '/journal' },
      { testId: 'nav-add-trade', expectedUrl: '/add-trade' },
      { testId: 'nav-analytics', expectedUrl: '/performance-calendar' },
      { testId: 'nav-settings', expectedUrl: '/settings' }
    ];
    
    for (const section of sections) {
      // Click the navigation link
      const navLink = page.locator(`[data-testid="${section.testId}"]`);
      await navLink.waitFor({ state: 'visible', timeout: 10000 });
      await navLink.click();
      
      // Wait for navigation to complete
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      // Verify we're on the correct page
      if (section.expectedUrl === '/') {
        await expect(page).toHaveURL(/\/$/);
      } else {
        await expect(page).toHaveURL(new RegExp(section.expectedUrl));
      }
      
      // Wait a moment before next navigation
      await page.waitForTimeout(500);
    }
  });

  test('should access add trade form', async ({ page }) => {
    // Navigate to add trade page
    await page.locator('[data-testid="nav-add-trade"]').click();
    await page.waitForLoadState('networkidle');
    
    // Verify form elements are present
    await expect(page.locator('[data-testid="add-trade-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="symbol-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="trade-type-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="entry-price-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="exit-price-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="size-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="save-trade-button"]')).toBeVisible();
  });

  test('should access news page', async ({ page }) => {
    // Navigate to news page
    await page.locator('[data-testid="nav-news"]').click();
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the news page
    await expect(page).toHaveURL(/\/news/);
    
    // Verify news page content is visible
    await expect(page.locator('body')).toBeVisible();
  });

  test('should access settings page', async ({ page }) => {
    // Navigate to settings page
    await page.locator('[data-testid="nav-settings"]').click();
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the settings page
    await expect(page).toHaveURL(/\/settings/);
    
    // Verify settings page content is visible
    await expect(page.locator('body')).toBeVisible();
  });
}); 