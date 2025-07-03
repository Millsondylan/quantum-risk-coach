import { test, expect } from '@playwright/test';

test.describe('Basic Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set up authenticated user state directly
    await page.goto('http://localhost:5178/');
    
    // Create user data that bypasses auth and onboarding
    await page.evaluate(() => {
      const userData = {
        id: `user_${Date.now()}`,
        name: 'testuser',
        preferences: {
          tradingStyle: 'day-trading',
          riskTolerance: 'moderate',
          preferredMarkets: ['Forex (FX)', 'Stocks'],
          experienceLevel: 'intermediate',
          notifications: {
            priceAlerts: true,
            newsAlerts: true,
            aiInsights: true,
            tradeSignals: true,
            economicEvents: true,
            portfolioAlerts: true,
            riskWarnings: true,
            pushNotifications: true,
            telegram: false,
            soundEnabled: true,
            marketUpdates: true,
            tradeAlerts: true,
            marketSentiment: true,
            quietHours: {
              enabled: false,
              start: '22:00',
              end: '08:00'
            },
            weekends: true,
            minimumImpact: 'medium',
            frequency: 'instant',
            personalizedSymbols: [],
            tradingStyle: 'day',
            riskTolerance: 'moderate',
            experience: 'intermediate'
          },
          theme: 'dark',
          language: 'en',
        },
        onboardingCompleted: true,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      };
      localStorage.setItem('user', JSON.stringify(userData));
    });
    
    // Reload to trigger the authenticated state
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('should navigate to all main sections', async ({ page }) => {
    // Wait for navigation to be visible
    await page.locator('[data-testid="mobile-bottom-nav"]').waitFor({ state: 'visible', timeout: 10000 });
    
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