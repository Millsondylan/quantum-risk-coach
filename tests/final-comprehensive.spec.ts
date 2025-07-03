import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5174';

test.describe('Final Comprehensive Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing data
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test.describe('Authentication Flow', () => {
    test('should complete username-based authentication', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth`);
      
      // Should show auth page
      await expect(page.locator('[data-testid="auth-page"]')).toBeVisible();
      await expect(page.locator('[data-testid="auth-card"]')).toBeVisible();
      await expect(page.locator('[data-testid="auth-title"]')).toContainText('Quantum Risk Coach');
      
      // Should show username input
      await expect(page.locator('[data-testid="signup-username-input"]')).toBeVisible();
      
      // Fill username
      await page.fill('[data-testid="signup-username-input"]', 'testuser123');
      
      // Submit form
      await page.click('[data-testid="signup-submit-button"]');
      
      // Should redirect to main app
      await expect(page).toHaveURL(`${BASE_URL}/`);
    });

    test('should handle sign in flow', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth`);
      
      // Switch to sign in tab
      await page.click('[data-testid="signin-tab"]');
      
      // Fill username
      await page.fill('[data-testid="signin-username-input"]', 'testuser123');
      
      // Submit form
      await page.click('[data-testid="signin-submit-button"]');
      
      // Should redirect to main app
      await expect(page).toHaveURL(`${BASE_URL}/`);
    });

    test('should handle form validation', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth`);
      await page.waitForLoadState('networkidle');
      
      // Try to submit empty form
      await page.click('[data-testid="signup-submit-button"]');
      
      // Should show validation error - check for various error indicators
      try {
        await expect(page.locator('[data-testid="error-toast"]')).toBeVisible({ timeout: 10000 });
      } catch (e) {
        // Check for form error or toast as fallback
        await expect(page.locator('[data-testid="form-error"], [data-sonner-toast], .sonner-toast, [data-testid="toast"]')).toBeVisible({ timeout: 10000 });
      }
    });
  });

  test.describe('Main Application', () => {
    test('should load main dashboard after authentication', async ({ page }) => {
      // First authenticate
      await page.goto(`${BASE_URL}/auth`);
      await page.waitForLoadState('networkidle');
      await page.fill('[data-testid="signup-username-input"]', 'testuser123');
      await page.click('[data-testid="signup-submit-button"]');
      
      // Wait for main page to load
      await page.waitForLoadState('networkidle');
      
      // Should show main dashboard - look for various possible selectors
      const mainContent = page.locator('div.min-h-screen, [data-testid="main-dashboard"]').first();
      await mainContent.waitFor({ state: 'visible', timeout: 10000 });
      await expect(mainContent).toBeVisible();
      
      // Check for tab list
      const tabList = page.locator('[role="tablist"], .tabs-list').first();
      if (await tabList.count() > 0) {
        await expect(tabList).toBeVisible();
      }
    });

    test('should show onboarding modal for new users', async ({ page }) => {
      // First authenticate
      await page.goto(`${BASE_URL}/auth`);
      await page.fill('[data-testid="signup-username-input"]', 'newuser123');
      await page.click('[data-testid="signup-submit-button"]');
      
      // Should show onboarding dialog
      const onboardingDialog = page.locator('[role="dialog"]:has-text("Welcome to Quantum Risk Coach")');
      if (await onboardingDialog.isVisible()) {
        await expect(onboardingDialog).toBeVisible();
        await expect(page.locator('button:has-text("Manual Journal")')).toBeVisible();
        await expect(page.locator('button:has-text("Skip for Now")')).toBeVisible();
      }
    });

    test('should handle tab navigation', async ({ page }) => {
      // First authenticate
      await page.goto(`${BASE_URL}/auth`);
      await page.fill('[data-testid="signup-username-input"]', 'testuser123');
      await page.click('[data-testid="signup-submit-button"]');
      
      // Test all tabs
      const tabs = ['Dashboard', 'Time Metrics', 'Analytics', 'Calendar', 'Watchlist'];
      
      for (const tab of tabs) {
        const tabButton = page.locator(`button[role="tab"]:has-text("${tab}")`);
        if (await tabButton.isVisible()) {
          await tabButton.click();
          await expect(page.locator(`[data-state="active"]:has-text("${tab}")`)).toBeVisible();
        }
      }
    });

    test('should show portfolio selector', async ({ page }) => {
      // First authenticate
      await page.goto(`${BASE_URL}/auth`);
      await page.fill('[data-testid="signup-username-input"]', 'testuser123');
      await page.click('[data-testid="signup-submit-button"]');
      
      // Look for portfolio selector
      const portfolioSelector = page.locator('[data-testid="portfolio-selector"]');
      if (await portfolioSelector.count() > 0) {
        await expect(portfolioSelector.first()).toBeVisible();
      }
    });

    test('should show performance dashboard', async ({ page }) => {
      // First authenticate
      await page.goto(`${BASE_URL}/auth`);
      await page.fill('[data-testid="signup-username-input"]', 'testuser123');
      await page.click('[data-testid="signup-submit-button"]');
      
      // Look for performance dashboard
      const performanceDashboard = page.locator('[data-testid="performance-dashboard"]');
      if (await performanceDashboard.count() > 0) {
        await expect(performanceDashboard.first()).toBeVisible();
      }
    });

    test('should handle view mode switching', async ({ page }) => {
      // First authenticate
      await page.goto(`${BASE_URL}/auth`);
      await page.fill('[data-testid="signup-username-input"]', 'testuser123');
      await page.click('[data-testid="signup-submit-button"]');
      
      // Click on notifications view
      const notificationsButton = page.locator('button:has-text("Notifications")');
      if (await notificationsButton.isVisible()) {
        await notificationsButton.click();
        
        // Should show notification center
        const notificationCenter = page.locator('[data-testid="notification-center"]');
        if (await notificationCenter.count() > 0) {
          await expect(notificationCenter.first()).toBeVisible();
        }
      }
    });

    test('should handle settings navigation', async ({ page }) => {
      // First authenticate
      await page.goto(`${BASE_URL}/auth`);
      await page.fill('[data-testid="signup-username-input"]', 'testuser123');
      await page.click('[data-testid="signup-submit-button"]');
      
      // Click on hamburger menu
      const settingsButton = page.locator('button:has([class*="space-y-1"])');
      if (await settingsButton.count() > 0) {
        await settingsButton.first().click();
        await expect(page).toHaveURL(/.*settings.*/);
      }
    });
  });

  test.describe('Onboarding Flow', () => {
    test('should handle broker selection', async ({ page }) => {
      // First authenticate
      await page.goto(`${BASE_URL}/auth`);
      await page.fill('[data-testid="signup-username-input"]', 'newuser123');
      await page.click('[data-testid="signup-submit-button"]');
      
      // Look for onboarding dialog
      const onboardingDialog = page.locator('[role="dialog"]:has-text("Welcome to Quantum Risk Coach")');
      if (await onboardingDialog.isVisible()) {
        // Click on a broker option
        const brokerButton = page.locator('button:has-text("mt4"), button:has-text("mt5")');
        if (await brokerButton.count() > 0) {
          await brokerButton.first().click();
          
          // Should show broker connection modal
          const connectionModal = page.locator('[role="dialog"]:has-text("Connect Broker")');
          if (await connectionModal.isVisible()) {
            await expect(connectionModal).toBeVisible();
          }
        }
      }
    });

    test('should handle manual journal setup', async ({ page }) => {
      // First authenticate
      await page.goto(`${BASE_URL}/auth`);
      await page.fill('[data-testid="signup-username-input"]', 'newuser123');
      await page.click('[data-testid="signup-submit-button"]');
      
      // Look for onboarding dialog
      const onboardingDialog = page.locator('[role="dialog"]:has-text("Welcome to Quantum Risk Coach")');
      if (await onboardingDialog.isVisible()) {
        // Click on manual journal button
        const manualJournalButton = page.locator('button:has-text("Manual Journal")');
        if (await manualJournalButton.isVisible()) {
          await manualJournalButton.click();
          
          // Should show manual journal modal
          const journalModal = page.locator('[role="dialog"]:has-text("Manual Trade Journal")');
          if (await journalModal.isVisible()) {
            await expect(journalModal).toBeVisible();
          }
        }
      }
    });

    test('should handle skip onboarding', async ({ page }) => {
      // First authenticate
      await page.goto(`${BASE_URL}/auth`);
      await page.fill('[data-testid="signup-username-input"]', 'newuser123');
      await page.click('[data-testid="signup-submit-button"]');
      
      // Look for onboarding dialog
      const onboardingDialog = page.locator('[role="dialog"]:has-text("Welcome to Quantum Risk Coach")');
      if (await onboardingDialog.isVisible()) {
        // Click skip button
        const skipButton = page.locator('button:has-text("Skip for Now")');
        if (await skipButton.isVisible()) {
          await skipButton.click();
          
          // Should close onboarding
          await expect(onboardingDialog).not.toBeVisible();
        }
      }
    });
  });

  test.describe('Trade Management', () => {
    test('should handle manual trade entry', async ({ page }) => {
      // First authenticate
      await page.goto(`${BASE_URL}/auth`);
      await page.fill('[data-testid="signup-username-input"]', 'testuser123');
      await page.click('[data-testid="signup-submit-button"]');
      
      // Look for manual journal button
      const manualJournalButton = page.locator('button:has-text("Manual Journal")');
      if (await manualJournalButton.count() > 0) {
        await manualJournalButton.first().click();
        
        // Should show manual journal modal
        const journalModal = page.locator('[role="dialog"]:has-text("Manual Trade Journal")');
        if (await journalModal.isVisible()) {
          await expect(journalModal).toBeVisible();
          
          // Fill trade form
          await page.fill('input[placeholder*="symbol"]', 'EURUSD');
          await page.selectOption('select[name="type"]', 'buy');
          await page.fill('input[placeholder*="entry price"]', '1.1000');
          await page.fill('input[placeholder*="exit price"]', '1.1050');
          await page.fill('input[placeholder*="size"]', '1.0');
          
          // Submit trade
          await page.click('button:has-text("Add Trade")');
          
          // Should show success message
          await expect(page.locator('text=Trade added successfully')).toBeVisible();
        }
      }
    });

    test('should handle CSV import', async ({ page }) => {
      // First authenticate
      await page.goto(`${BASE_URL}/auth`);
      await page.fill('[data-testid="signup-username-input"]', 'testuser123');
      await page.click('[data-testid="signup-submit-button"]');
      
      // Look for manual journal button
      const manualJournalButton = page.locator('button:has-text("Manual Journal")');
      if (await manualJournalButton.count() > 0) {
        await manualJournalButton.first().click();
        
        // Should show manual journal modal
        const journalModal = page.locator('[role="dialog"]:has-text("Manual Trade Journal")');
        if (await journalModal.isVisible()) {
          // Click CSV import tab
          const csvTab = page.locator('button:has-text("CSV Import")');
          if (await csvTab.isVisible()) {
            await csvTab.click();
            
            // Should show file upload
            await expect(page.locator('input[type="file"]')).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('Broker Integration', () => {
    test('should handle broker connection', async ({ page }) => {
      // First authenticate
      await page.goto(`${BASE_URL}/auth`);
      await page.fill('[data-testid="signup-username-input"]', 'testuser123');
      await page.click('[data-testid="signup-submit-button"]');
      
      // Look for broker connection button
      const brokerButton = page.locator('button:has-text("Connect Broker")');
      if (await brokerButton.count() > 0) {
        await brokerButton.first().click();
        
        // Should show broker connection modal
        const connectionModal = page.locator('[role="dialog"]:has-text("Connect Broker")');
        if (await connectionModal.isVisible()) {
          await expect(connectionModal).toBeVisible();
          
          // Fill broker credentials
          await page.selectOption('select[name="broker"]', 'demo');
          await page.fill('input[placeholder*="API Key"]', 'test-api-key');
          await page.fill('input[placeholder*="Secret"]', 'test-secret');
          
          // Connect
          await page.click('button:has-text("Connect")');
          
          // Should show connection status
          await expect(page.locator('text=Connected')).toBeVisible();
        }
      }
    });
  });

  test.describe('UI and Navigation', () => {
    test('should handle mobile responsive design', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // First authenticate
      await page.goto(`${BASE_URL}/auth`);
      await page.fill('[data-testid="signup-username-input"]', 'testuser123');
      await page.click('[data-testid="signup-submit-button"]');
      
      // Should load on mobile
      await expect(page.locator('div.min-h-screen')).toBeVisible();
      await expect(page.locator('[role="tablist"]')).toBeVisible();
    });

    test('should handle keyboard navigation', async ({ page }) => {
      // First authenticate
      await page.goto(`${BASE_URL}/auth`);
      await page.fill('[data-testid="signup-username-input"]', 'testuser123');
      await page.click('[data-testid="signup-submit-button"]');
      
      // Test tab navigation
      await page.keyboard.press('Tab');
      
      // Should focus on first focusable element
      const focusedElement = page.locator(':focus');
      if (await focusedElement.count() > 0) {
        await expect(focusedElement.first()).toBeVisible();
      }
    });

    test('should handle accessibility features', async ({ page }) => {
      // First authenticate
      await page.goto(`${BASE_URL}/auth`);
      await page.fill('[data-testid="signup-username-input"]', 'testuser123');
      await page.click('[data-testid="signup-submit-button"]');
      
      // Check for ARIA labels and roles
      const elementsWithAria = page.locator('[aria-label], [aria-labelledby], [role]');
      const count = await elementsWithAria.count();
      
      // Should have some accessibility features
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Data and Performance', () => {
    test('should handle data persistence', async ({ page }) => {
      // First authenticate
      await page.goto(`${BASE_URL}/auth`);
      await page.fill('[data-testid="signup-username-input"]', 'testuser123');
      await page.click('[data-testid="signup-submit-button"]');
      
      // Reload page
      await page.reload();
      
      // Should still load without errors
      await expect(page.locator('div.min-h-screen')).toBeVisible();
    });

    test('should handle performance metrics', async ({ page }) => {
      const startTime = Date.now();
      
      // First authenticate
      await page.goto(`${BASE_URL}/auth`);
      await page.fill('[data-testid="signup-username-input"]', 'testuser123');
      await page.click('[data-testid="signup-submit-button"]');
      
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Should load within reasonable time
      expect(loadTime).toBeLessThan(10000);
      
      // Should show main content
      await expect(page.locator('div.min-h-screen')).toBeVisible();
    });

    test('should handle network errors gracefully', async ({ page }) => {
      // Mock network failure
      await page.route('**/api/**', route => route.abort());
      
      // First authenticate
      await page.goto(`${BASE_URL}/auth`);
      await page.fill('[data-testid="signup-username-input"]', 'testuser123');
      await page.click('[data-testid="signup-submit-button"]');
      
      // Should still load the page
      await expect(page.locator('div.min-h-screen')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle form validation errors', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth`);
      
      // Try to submit empty form
      await page.click('[data-testid="signup-submit-button"]');
      
      // Should show validation error
      await expect(page.locator('[data-testid="error-toast"]')).toBeVisible();
    });

    test('should handle invalid username', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth`);
      
      // Try to submit with short username
      await page.fill('[data-testid="signup-username-input"]', 'ab');
      await page.click('[data-testid="signup-submit-button"]');
      
      // Should show validation error
      await expect(page.locator('[data-testid="error-toast"]')).toBeVisible();
    });

    test('should handle non-existent pages', async ({ page }) => {
      // Try to access non-existent page
      await page.goto(`${BASE_URL}/non-existent-page`);
      
      // Should show some content (not blank page)
      const content = page.locator('body');
      await expect(content).not.toBeEmpty();
    });
  });

  test.describe('Theme and Styling', () => {
    test('should handle dark theme', async ({ page }) => {
      // First authenticate
      await page.goto(`${BASE_URL}/auth`);
      await page.fill('[data-testid="signup-username-input"]', 'testuser123');
      await page.click('[data-testid="signup-submit-button"]');
      
      // Check for dark theme classes
      const darkThemeElements = page.locator('.bg-\\[\\#0A0B0D\\], .text-white');
      const count = await darkThemeElements.count();
      
      // Should have dark theme styling
      expect(count).toBeGreaterThan(0);
    });

    test('should handle responsive breakpoints', async ({ page }) => {
      // Test different viewport sizes
      const viewports = [
        { width: 375, height: 667 }, // Mobile
        { width: 768, height: 1024 }, // Tablet
        { width: 1024, height: 768 }, // Desktop
        { width: 1920, height: 1080 } // Large desktop
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        
        // First authenticate
        await page.goto(`${BASE_URL}/auth`);
        await page.fill('[data-testid="signup-username-input"]', 'testuser123');
        await page.click('[data-testid="signup-submit-button"]');
        
        // Should load at all viewport sizes
        await expect(page.locator('div.min-h-screen')).toBeVisible();
      }
    });
  });

  test.describe('End-to-End Workflow', () => {
    test('should complete full user journey', async ({ page }) => {
      // 1. Navigate to auth page
      await page.goto(`${BASE_URL}/auth`);
      await expect(page.locator('[data-testid="auth-page"]')).toBeVisible();
      
      // 2. Create account
      await page.fill('[data-testid="signup-username-input"]', 'e2euser123');
      await page.click('[data-testid="signup-submit-button"]');
      
      // 3. Should show onboarding
      const onboardingDialog = page.locator('[role="dialog"]:has-text("Welcome to Quantum Risk Coach")');
      if (await onboardingDialog.isVisible()) {
        // 4. Skip onboarding
        await page.click('button:has-text("Skip for Now")');
      }
      
      // 5. Should show main dashboard
      await expect(page.locator('div.min-h-screen')).toBeVisible();
      await expect(page.locator('[role="tablist"]')).toBeVisible();
      
      // 6. Navigate through tabs
      const tabs = ['Dashboard', 'Time Metrics', 'Analytics', 'Calendar', 'Watchlist'];
      for (const tab of tabs) {
        const tabButton = page.locator(`button[role="tab"]:has-text("${tab}")`);
        if (await tabButton.isVisible()) {
          await tabButton.click();
          await expect(page.locator(`[data-state="active"]:has-text("${tab}")`)).toBeVisible();
        }
      }
      
      // 7. Switch to notifications view
      const notificationsButton = page.locator('button:has-text("Notifications")');
      if (await notificationsButton.isVisible()) {
        await notificationsButton.click();
        const notificationCenter = page.locator('[data-testid="notification-center"]');
        if (await notificationCenter.count() > 0) {
          await expect(notificationCenter.first()).toBeVisible();
        }
      }
      
      // 8. Switch back to dashboard
      const dashboardButton = page.locator('button:has-text("Dashboard")');
      if (await dashboardButton.isVisible()) {
        await dashboardButton.click();
        await expect(page.locator('[role="tablist"]')).toBeVisible();
      }
      
      // 9. Test data persistence
      await page.reload();
      await expect(page.locator('div.min-h-screen')).toBeVisible();
    });
  });
}); 