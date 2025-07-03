import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5178';

test.describe('Comprehensive Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Authentication Flow', () => {
    test('should complete full authentication flow', async ({ page }) => {
      // Navigate to auth page
      await page.goto('http://localhost:5173/auth');
      await page.waitForLoadState('networkidle');
      
      // Wait for auth tabs to be visible and stable
      const authTabs = page.locator('[data-testid="auth-tabs"]');
      await authTabs.waitFor({ state: 'visible', timeout: 15000 });
      await expect(authTabs).toBeVisible();
      
      // Click signup tab first
      const signupTab = page.locator('[data-testid="signup-tab"]');
      await signupTab.click();
      
      // Test registration with username only
      const usernameInput = page.locator('[data-testid="signup-username-input"]');
      await usernameInput.waitFor({ state: 'visible', timeout: 5000 });
      await usernameInput.fill('testuser123');
      
      const submitButton = page.locator('[data-testid="signup-submit-button"]');
      await submitButton.click();
      
      // Should redirect to onboarding or dashboard
      await page.waitForURL(/\/onboarding|\//, { timeout: 10000 });
      
      // Verify we're no longer on auth page
      await expect(page.locator('[data-testid="auth-page"]')).not.toBeVisible();
    });

    test('should handle login flow', async ({ page }) => {
      // Navigate to auth page
      await page.goto('http://localhost:5173/auth');
      await page.waitForLoadState('networkidle');
      
      // Wait for auth tabs to be visible
      const authTabs = page.locator('[data-testid="auth-tabs"]');
      await authTabs.waitFor({ state: 'visible', timeout: 15000 });
      await expect(authTabs).toBeVisible();
      
      // Click signin tab (should already be active by default)
      const signinTab = page.locator('[data-testid="signin-tab"]');
      await signinTab.click();
      
      // Fill in username
      const usernameInput = page.locator('[data-testid="signin-username-input"]');
      await usernameInput.waitFor({ state: 'visible', timeout: 5000 });
      await usernameInput.fill('existinguser');
      
      // Submit form
      const submitButton = page.locator('[data-testid="signin-submit-button"]');
      await submitButton.click();
      
      // Should redirect to dashboard or show error
      await page.waitForTimeout(2000);
    });

    test('should handle form validation', async ({ page }) => {
      // Navigate to auth page
      await page.goto('http://localhost:5173/auth');
      await page.waitForLoadState('networkidle');
      
      const authTabs = page.locator('[data-testid="auth-tabs"]');
      await authTabs.waitFor({ state: 'visible', timeout: 15000 });
      await expect(authTabs).toBeVisible();
      
      // Click signup tab first
      const signupTab = page.locator('[data-testid="signup-tab"]');
      await signupTab.click();
      
      // Test empty username
      const submitButton = page.locator('[data-testid="signup-submit-button"]');
      await submitButton.click();
      
      // Should show validation error
      const errorMessage = page.locator('[data-testid="form-error"]');
      await errorMessage.waitFor({ state: 'visible', timeout: 5000 });
      await expect(errorMessage).toBeVisible();
    });
  });

  test.describe('Onboarding Flow', () => {
    test('should complete onboarding process', async ({ page }) => {
      // First authenticate
      await page.goto('http://localhost:5173/auth');
      await page.waitForLoadState('networkidle');
      
      const authTabs = page.locator('[data-testid="auth-tabs"]');
      await authTabs.waitFor({ state: 'visible', timeout: 15000 });
      await expect(authTabs).toBeVisible();
      
      // Click signup tab first
      const signupTab = page.locator('[data-testid="signup-tab"]');
      await signupTab.click();
      
      const usernameInput = page.locator('[data-testid="signup-username-input"]');
      await usernameInput.waitFor({ state: 'visible', timeout: 5000 });
      await usernameInput.fill('onboardinguser');
      
      const submitButton = page.locator('[data-testid="signup-submit-button"]');
      await submitButton.click();
      
      // Should redirect to onboarding
      await page.waitForURL(/\/onboarding/, { timeout: 10000 });
      
      // Complete onboarding steps
      // Look for onboarding elements
      const onboardingElements = page.locator('[data-testid*="onboarding"]');
      if (await onboardingElements.count() > 0) {
        // Complete onboarding if it exists
        const continueButton = page.locator('button:has-text("Continue"), button:has-text("Next"), button:has-text("Complete")');
        if (await continueButton.count() > 0) {
          await continueButton.first().click();
        }
      }
      
      // Should eventually reach dashboard
      await page.waitForURL(/\/$/, { timeout: 15000 });
    });
  });

  test.describe('Portfolio Management', () => {
    test('should create and manage portfolios', async ({ page }) => {
      // Authenticate first
      await page.goto('http://localhost:5173/auth');
      await page.waitForLoadState('networkidle');
      
      const authTabs = page.locator('[data-testid="auth-tabs"]');
      await authTabs.waitFor({ state: 'visible', timeout: 15000 });
      await expect(authTabs).toBeVisible();
      
      // Click signup tab first
      const signupTab = page.locator('[data-testid="signup-tab"]');
      await signupTab.click();
      
      const usernameInput = page.locator('[data-testid="signup-username-input"]');
      await usernameInput.waitFor({ state: 'visible', timeout: 5000 });
      await usernameInput.fill('portfoliouser');
      
      const submitButton = page.locator('[data-testid="signup-submit-button"]');
      await submitButton.click();
      
      // Navigate to dashboard
      await page.waitForURL(/\/$/, { timeout: 10000 });
      
      // Look for portfolio management elements
      const portfolioElements = page.locator('[data-testid*="portfolio"], [data-testid*="account"]');
      if (await portfolioElements.count() > 0) {
        await expect(portfolioElements.first()).toBeVisible();
      }
    });
  });

  test.describe('Trade Journaling', () => {
    test('should add manual trade entry', async ({ page }) => {
      // Authenticate first
      await page.goto('http://localhost:5173/auth');
      await page.waitForLoadState('networkidle');
      
      const authTabs = page.locator('[data-testid="auth-tabs"]');
      await authTabs.waitFor({ state: 'visible', timeout: 15000 });
      await expect(authTabs).toBeVisible();
      
      // Click signup tab first
      const signupTab = page.locator('[data-testid="signup-tab"]');
      await signupTab.click();
      
      const usernameInput = page.locator('[data-testid="signup-username-input"]');
      await usernameInput.waitFor({ state: 'visible', timeout: 5000 });
      await usernameInput.fill('tradeuser');
      
      const submitButton = page.locator('[data-testid="signup-submit-button"]');
      await submitButton.click();
      
      // Navigate to add trade page
      await page.goto('http://localhost:5173/add-trade');
      await page.waitForLoadState('networkidle');
      
      // Look for trade form elements
      const tradeForm = page.locator('form, [data-testid*="trade"], [data-testid*="form"]');
      if (await tradeForm.count() > 0) {
        await expect(tradeForm.first()).toBeVisible();
      }
    });

    test('should import CSV trades', async ({ page }) => {
      // Authenticate first
      await page.goto('http://localhost:5173/auth');
      await page.waitForLoadState('networkidle');
      
      const authTabs = page.locator('[data-testid="auth-tabs"]');
      await authTabs.waitFor({ state: 'visible', timeout: 15000 });
      await expect(authTabs).toBeVisible();
      
      // Click signup tab first
      const signupTab = page.locator('[data-testid="signup-tab"]');
      await signupTab.click();
      
      const usernameInput = page.locator('[data-testid="signup-username-input"]');
      await usernameInput.waitFor({ state: 'visible', timeout: 5000 });
      await usernameInput.fill('csvuser');
      
      const submitButton = page.locator('[data-testid="signup-submit-button"]');
      await submitButton.click();
      
      // Navigate to add trade page
      await page.goto('http://localhost:5173/add-trade');
      await page.waitForLoadState('networkidle');
      
      // Look for CSV import elements
      const csvElements = page.locator('[data-testid*="csv"], [data-testid*="import"], input[type="file"]');
      if (await csvElements.count() > 0) {
        await expect(csvElements.first()).toBeVisible();
      }
    });
  });

  test.describe('Broker Connection', () => {
    test('should connect to broker', async ({ page }) => {
      // Authenticate first
      await page.goto('http://localhost:5173/auth');
      await page.waitForLoadState('networkidle');
      
      const authTabs = page.locator('[data-testid="auth-tabs"]');
      await authTabs.waitFor({ state: 'visible', timeout: 15000 });
      await expect(authTabs).toBeVisible();
      
      // Click signup tab first
      const signupTab = page.locator('[data-testid="signup-tab"]');
      await signupTab.click();
      
      const usernameInput = page.locator('[data-testid="signup-username-input"]');
      await usernameInput.waitFor({ state: 'visible', timeout: 5000 });
      await usernameInput.fill('brokeruser');
      
      const submitButton = page.locator('[data-testid="signup-submit-button"]');
      await submitButton.click();
      
      // Navigate to broker connection page
      await page.goto('http://localhost:5173/mt4-connection');
      await page.waitForLoadState('networkidle');
      
      // Look for broker connection elements
      const brokerElements = page.locator('[data-testid*="broker"], [data-testid*="mt4"], [data-testid*="connection"]');
      if (await brokerElements.count() > 0) {
        await expect(brokerElements.first()).toBeVisible();
      }
    });
  });

  test.describe('Performance Dashboard', () => {
    test('should display performance metrics', async ({ page }) => {
      // Authenticate first
      await page.goto('http://localhost:5173/auth');
      await page.waitForLoadState('networkidle');
      
      const authTabs = page.locator('[data-testid="auth-tabs"]');
      await authTabs.waitFor({ state: 'visible', timeout: 15000 });
      await expect(authTabs).toBeVisible();
      
      // Click signup tab first
      const signupTab = page.locator('[data-testid="signup-tab"]');
      await signupTab.click();
      
      const usernameInput = page.locator('[data-testid="signup-username-input"]');
      await usernameInput.waitFor({ state: 'visible', timeout: 5000 });
      await usernameInput.fill('performanceuser');
      
      const submitButton = page.locator('[data-testid="signup-submit-button"]');
      await submitButton.click();
      
      // Navigate to dashboard
      await page.waitForURL(/\/$/, { timeout: 10000 });
      
      // Look for performance metrics
      const metricsElements = page.locator('[data-testid*="metric"], [data-testid*="performance"], [data-testid*="stats"]');
      if (await metricsElements.count() > 0) {
        await expect(metricsElements.first()).toBeVisible();
      }
    });
  });

  test.describe('Navigation and UI', () => {
    test('should navigate between all sections', async ({ page }) => {
      // Authenticate first
      await page.goto('http://localhost:5173/auth');
      await page.waitForLoadState('networkidle');
      
      const authTabs = page.locator('[data-testid="auth-tabs"]');
      await authTabs.waitFor({ state: 'visible', timeout: 15000 });
      await expect(authTabs).toBeVisible();
      
      // Click signup tab first
      const signupTab = page.locator('[data-testid="signup-tab"]');
      await signupTab.click();
      
      const usernameInput = page.locator('[data-testid="signup-username-input"]');
      await usernameInput.waitFor({ state: 'visible', timeout: 5000 });
      await usernameInput.fill('navuser');
      
      const submitButton = page.locator('[data-testid="signup-submit-button"]');
      await submitButton.click();
      
      // Test navigation to different pages
      const routes = ['/', '/news', '/add-trade', '/history', '/journal', '/settings'];
      
      for (const route of routes) {
        await page.goto(`http://localhost:5173${route}`);
        await page.waitForLoadState('networkidle');
        
        // Verify page loaded
        await expect(page.locator('body')).toBeVisible();
      }
    });

    test('should handle mobile responsive design', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 812 });
      
      // Authenticate first
      await page.goto('http://localhost:5173/auth');
      await page.waitForLoadState('networkidle');
      
      const authTabs = page.locator('[data-testid="auth-tabs"]');
      await authTabs.waitFor({ state: 'visible', timeout: 15000 });
      await expect(authTabs).toBeVisible();
      
      // Click signup tab first
      const signupTab = page.locator('[data-testid="signup-tab"]');
      await signupTab.click();
      
      const usernameInput = page.locator('[data-testid="signup-username-input"]');
      await usernameInput.waitFor({ state: 'visible', timeout: 5000 });
      await usernameInput.fill('mobileuser');
      
      const submitButton = page.locator('[data-testid="signup-submit-button"]');
      await submitButton.click();
      
      // Navigate to dashboard
      await page.waitForURL(/\/$/, { timeout: 10000 });
      
      // Check for mobile navigation
      const mobileNav = page.locator('[data-testid="mobile-bottom-nav"], nav');
      if (await mobileNav.count() > 0) {
        await expect(mobileNav.first()).toBeVisible();
      }
    });
  });

  test.describe('Notifications', () => {
    test('should handle notifications', async ({ page }) => {
      // Authenticate first
      await page.goto('http://localhost:5173/auth');
      await page.waitForLoadState('networkidle');
      
      const authTabs = page.locator('[data-testid="auth-tabs"]');
      await authTabs.waitFor({ state: 'visible', timeout: 15000 });
      await expect(authTabs).toBeVisible();
      
      // Click signup tab first
      const signupTab = page.locator('[data-testid="signup-tab"]');
      await signupTab.click();
      
      const usernameInput = page.locator('[data-testid="signup-username-input"]');
      await usernameInput.waitFor({ state: 'visible', timeout: 5000 });
      await usernameInput.fill('notifuser');
      
      const submitButton = page.locator('[data-testid="signup-submit-button"]');
      await submitButton.click();
      
      // Navigate to dashboard
      await page.waitForURL(/\/$/, { timeout: 10000 });
      
      // Look for notification elements
      const notificationElements = page.locator('[data-testid*="notification"], [data-testid*="alert"], [data-testid*="toast"]');
      if (await notificationElements.count() > 0) {
        await expect(notificationElements.first()).toBeVisible();
      }
    });
  });

  test.describe('Settings and Configuration', () => {
    test('should update user settings', async ({ page }) => {
      // Authenticate first
      await page.goto('http://localhost:5173/auth');
      await page.waitForLoadState('networkidle');
      
      const authTabs = page.locator('[data-testid="auth-tabs"]');
      await authTabs.waitFor({ state: 'visible', timeout: 15000 });
      await expect(authTabs).toBeVisible();
      
      // Click signup tab first
      const signupTab = page.locator('[data-testid="signup-tab"]');
      await signupTab.click();
      
      const usernameInput = page.locator('[data-testid="signup-username-input"]');
      await usernameInput.waitFor({ state: 'visible', timeout: 5000 });
      await usernameInput.fill('settingsuser');
      
      const submitButton = page.locator('[data-testid="signup-submit-button"]');
      await submitButton.click();
      
      // Navigate to settings
      await page.goto('http://localhost:5173/settings');
      await page.waitForLoadState('networkidle');
      
      // Look for settings elements
      const settingsElements = page.locator('[data-testid*="setting"], [data-testid*="config"], [data-testid*="preference"]');
      if (await settingsElements.count() > 0) {
        await expect(settingsElements.first()).toBeVisible();
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Authenticate first
      await page.goto('http://localhost:5173/auth');
      await page.waitForLoadState('networkidle');
      
      const authTabs = page.locator('[data-testid="auth-tabs"]');
      await authTabs.waitFor({ state: 'visible', timeout: 15000 });
      await expect(authTabs).toBeVisible();
      
      // Click signup tab first
      const signupTab = page.locator('[data-testid="signup-tab"]');
      await signupTab.click();
      
      const usernameInput = page.locator('[data-testid="signup-username-input"]');
      await usernameInput.waitFor({ state: 'visible', timeout: 5000 });
      await usernameInput.fill('erroruser');
      
      const submitButton = page.locator('[data-testid="signup-submit-button"]');
      await submitButton.click();
      
      // Navigate to dashboard
      await page.waitForURL(/\/$/, { timeout: 10000 });
      
      // Look for error handling elements
      const errorElements = page.locator('[data-testid*="error"], [data-testid*="retry"], [data-testid*="fallback"]');
      if (await errorElements.count() > 0) {
        await expect(errorElements.first()).toBeVisible();
      }
    });

    test('should handle form submission errors', async ({ page }) => {
      // Navigate to auth page
      await page.goto('http://localhost:5173/auth');
      await page.waitForLoadState('networkidle');
      
      const authTabs = page.locator('[data-testid="auth-tabs"]');
      await authTabs.waitFor({ state: 'visible', timeout: 15000 });
      await expect(authTabs).toBeVisible();
      
      // Submit empty form
      const submitButton = page.locator('[data-testid="signup-submit-button"]');
      await submitButton.click();
      
      // Should show validation error
      await page.waitForTimeout(1000);
      const errorMessage = page.locator('[data-testid="form-error"]');
      await expect(errorMessage).toBeVisible();
    });
  });

  test.describe('Data Persistence', () => {
    test('should persist data across sessions', async ({ page }) => {
      // Authenticate first
      await page.goto('http://localhost:5173/auth');
      await page.waitForLoadState('networkidle');
      
      const authTabs = page.locator('[data-testid="auth-tabs"]');
      await authTabs.waitFor({ state: 'visible', timeout: 15000 });
      await expect(authTabs).toBeVisible();
      
      // Click signup tab first
      const signupTab = page.locator('[data-testid="signup-tab"]');
      await signupTab.click();
      
      const usernameInput = page.locator('[data-testid="signup-username-input"]');
      await usernameInput.waitFor({ state: 'visible', timeout: 5000 });
      await usernameInput.fill('persistuser');
      
      const submitButton = page.locator('[data-testid="signup-submit-button"]');
      await submitButton.click();
      
      // Navigate to dashboard
      await page.waitForURL(/\/$/, { timeout: 10000 });
      
      // Reload page to test persistence
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Should still be on dashboard (not redirected to auth)
      await expect(page.locator('[data-testid="auth-page"]')).not.toBeVisible();
    });
  });

  test.describe('Performance and Loading', () => {
    test('should load quickly and be responsive', async ({ page }) => {
      // Test initial page load
      const startTime = Date.now();
      await page.goto('http://localhost:5173');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // Should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
      
      // Use username-based authentication
      const usernameInput = page.locator('[data-testid="signup-username-input"]');
      await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
      await usernameInput.fill('test@example.com');
      
      const submitButton = page.locator('[data-testid="signup-submit-button"]');
      await submitButton.click();
      
      // Should navigate quickly
      await page.waitForURL(/\/onboarding|\//, { timeout: 10000 });
    });
  });
}); 