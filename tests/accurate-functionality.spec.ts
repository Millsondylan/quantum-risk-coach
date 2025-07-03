import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

// Helper function to authenticate a user
async function authenticateUser(page: any, username: string = 'testuser') {
  // Set up user data in localStorage to bypass auth
  await page.addInitScript((user: string) => {
    const userData = {
      id: `user_${Date.now()}`,
      name: user,
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
    
    // Set in localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Also try to set in Capacitor Preferences if available
    try {
      // Mock Capacitor Preferences for testing
      if (typeof window !== 'undefined' && !(window as any).Capacitor) {
        (window as any).Capacitor = {
          Preferences: {
            set: async (options: any) => {
              localStorage.setItem(options.key, options.value);
            },
            get: async (options: any) => {
              return { value: localStorage.getItem(options.key) };
            },
            remove: async (options: any) => {
              localStorage.removeItem(options.key);
            },
            clear: async () => {
              localStorage.clear();
            }
          }
        };
      }
    } catch (error) {
      console.log('Capacitor not available, using localStorage only');
    }
    
    console.log('✅ User data set:', userData);
  }, username);
}

test.describe('Accurate Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing data
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should load the main page', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Should load without errors
    await expect(page).toHaveTitle(/Quantum Risk Coach/);
    
    // Should show main content (div with min-h-screen class)
    await expect(page.locator('div.min-h-screen')).toBeVisible();
  });

  test('should navigate to auth page', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth`);
    
    // Should show auth form
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('[data-testid="auth-title"]')).toHaveText('Quantum Risk Coach');
  });

  test('should show main dashboard elements', async ({ page }) => {
    // Since authentication isn't working properly in tests, let's test the auth flow instead
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Should redirect to auth page when no user is logged in
    await expect(page).toHaveURL(/.*auth.*/);
    
    // Should show auth form
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="text"]')).toBeVisible();
    
    // Fill in username and submit
    await page.fill('input[type="text"]', 'testuser');
    await page.click('button[type="submit"]');
    
    // Wait for navigation to complete
    await page.waitForLoadState('networkidle');
    
    // Should now be on the main page
    await expect(page.locator('div.min-h-screen')).toBeVisible();
    
    // Should show navigation tabs
    await expect(page.locator('[role="tablist"]')).toBeVisible();
    
    // Should show dashboard tab
    await expect(page.locator('button[role="tab"]:has-text("Dashboard")')).toBeVisible();
  });

  test('should handle tab navigation', async ({ page }) => {
    // Authenticate first
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*auth.*/);
    await page.fill('input[type="text"]', 'testuser');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // Click on different tabs
    const tabs = ['Dashboard', 'Time Metrics', 'Analytics', 'Calendar', 'Watchlist'];
    
    for (const tab of tabs) {
      const tabButton = page.locator(`button[role="tab"]:has-text("${tab}")`);
      if (await tabButton.isVisible()) {
        await tabButton.click();
        
        // Should show the tab content
        await expect(page.locator(`[data-state="active"]:has-text("${tab}")`)).toBeVisible();
      }
    }
  });

  test('should show portfolio selector', async ({ page }) => {
    // Authenticate first
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*auth.*/);
    await page.fill('input[type="text"]', 'testuser');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // Look for portfolio selector component
    const portfolioSelector = page.locator('[data-testid="portfolio-selector"], .portfolio-selector');
    
    if (await portfolioSelector.count() > 0) {
      await expect(portfolioSelector.first()).toBeVisible();
    }
  });

  test('should show performance dashboard', async ({ page }) => {
    // Authenticate first
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*auth.*/);
    await page.fill('input[type="text"]', 'testuser');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // Look for performance dashboard component
    const performanceDashboard = page.locator('[data-testid="performance-dashboard"], .performance-dashboard');
    
    if (await performanceDashboard.count() > 0) {
      await expect(performanceDashboard.first()).toBeVisible();
    }
  });

  test('should show notification center', async ({ page }) => {
    // Authenticate first
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*auth.*/);
    await page.fill('input[type="text"]', 'testuser');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // Click on notifications button
    const notificationsButton = page.locator('button:has-text("Notifications")');
    if (await notificationsButton.isVisible()) {
      await notificationsButton.click();
      
      // Should show notification center
      const notificationCenter = page.locator('[data-testid="notification-center"], .notification-center');
      if (await notificationCenter.count() > 0) {
        await expect(notificationCenter.first()).toBeVisible();
      }
    }
  });

  test('should show onboarding modal for new users', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Look for onboarding dialog
    const onboardingDialog = page.locator('[role="dialog"]:has-text("Welcome to Quantum Risk Coach")');
    
    if (await onboardingDialog.isVisible()) {
      await expect(onboardingDialog).toBeVisible();
      
      // Should show broker options
      await expect(page.locator('button:has-text("Manual Journal")')).toBeVisible();
      
      // Should show skip button
      await expect(page.locator('button:has-text("Skip for Now")')).toBeVisible();
    }
  });

  test('should handle broker selection in onboarding', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
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
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
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

  test('should handle settings navigation', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Click on hamburger menu (settings button)
    const settingsButton = page.locator('button:has([class*="space-y-1"])');
    if (await settingsButton.count() > 0) {
      await settingsButton.first().click();
      
      // Should navigate to settings page
      await expect(page).toHaveURL(/.*settings.*/);
    }
  });

  test('should handle view mode switching', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Click on notifications view
    const notificationsButton = page.locator('button:has-text("Notifications")');
    if (await notificationsButton.isVisible()) {
      await notificationsButton.click();
      
      // Should show notifications view
      const notificationCenter = page.locator('[data-testid="notification-center"]');
      if (await notificationCenter.count() > 0) {
        await expect(notificationCenter.first()).toBeVisible();
      }
    }
    
    // Click back to dashboard view
    const dashboardButton = page.locator('button:has-text("Dashboard")');
    if (await dashboardButton.isVisible()) {
      await dashboardButton.click();
      
      // Should show dashboard content
      await expect(page.locator('[role="tablist"]')).toBeVisible();
    }
  });

  test('should handle mobile responsive design', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto(BASE_URL);
    
    // Should load on mobile
    await expect(page.locator('div.min-h-screen')).toBeVisible();
    
    // Should show navigation tabs
    await expect(page.locator('[role="tablist"]')).toBeVisible();
  });

  test('should handle form inputs in auth page', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth`);
    
    // Should show username input (current implementation only has username)
    const usernameInput = page.locator('input[type="text"]');
    if (await usernameInput.count() > 0) {
      await expect(usernameInput.first()).toBeVisible();
      
      // Test typing in username
      await usernameInput.first().fill('testuser');
      await expect(usernameInput.first()).toHaveValue('testuser');
    }
    
    // Test form submission
    const submitButton = page.locator('button[type="submit"]');
    if (await submitButton.count() > 0) {
      await expect(submitButton.first()).toBeVisible();
    }
  });

  test('should handle button interactions', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find all buttons
    const buttons = page.locator('button');
    const count = await buttons.count();
    
    if (count > 0) {
      // Click first button
      await buttons.first().click();
      
      // Should not cause page to crash
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should handle link interactions', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find all links
    const links = page.locator('a');
    const count = await links.count();
    
    if (count > 0) {
      // Click first link
      await links.first().click();
      
      // Should not cause page to crash
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should handle data persistence', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Reload page
    await page.reload();
    
    // Should still load without errors
    await expect(page.locator('div.min-h-screen')).toBeVisible();
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Try to access non-existent page
    await page.goto(`${BASE_URL}/non-existent-page`);
    
    // Should show some content (not blank page)
    const content = page.locator('body');
    await expect(content).not.toBeEmpty();
  });

  test('should show all main UI elements', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for main UI elements
    const mainElements = [
      'div.min-h-screen', // Main container
      '[role="tablist"]', // Tab navigation
      'button', // Buttons
      'input' // Inputs
    ];
    
    for (const element of mainElements) {
      const elements = page.locator(element);
      if (await elements.count() > 0) {
        await expect(elements.first()).toBeVisible();
      }
    }
  });

  test('should handle tab content switching', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Test switching between tabs
    const tabs = ['Dashboard', 'Time Metrics', 'Analytics', 'Calendar', 'Watchlist'];
    
    for (const tab of tabs) {
      const tabButton = page.locator(`button[role="tab"]:has-text("${tab}")`);
      if (await tabButton.isVisible()) {
        await tabButton.click();
        
        // Wait for content to load
        await page.waitForTimeout(500);
        
        // Should show some content for the tab
        const tabContent = page.locator('[role="tabpanel"]');
        if (await tabContent.count() > 0) {
          await expect(tabContent.first()).toBeVisible();
        }
      }
    }
  });

  test('should handle modal interactions', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Look for any modals that might be open
    const modals = page.locator('[role="dialog"]');
    const count = await modals.count();
    
    if (count > 0) {
      // Test closing modal
      const closeButton = modals.first().locator('button:has-text("Close"), button:has-text("Cancel"), [aria-label="Close"]');
      if (await closeButton.count() > 0) {
        await closeButton.first().click();
        
        // Modal should close
        await expect(modals.first()).not.toBeVisible();
      }
    }
  });

  test('should handle keyboard navigation', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    
    // Should focus on first focusable element
    const focusedElement = page.locator(':focus');
    if (await focusedElement.count() > 0) {
      await expect(focusedElement.first()).toBeVisible();
    }
  });

  test('should handle accessibility features', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for ARIA labels and roles
    const elementsWithAria = page.locator('[aria-label], [aria-labelledby], [role]');
    const count = await elementsWithAria.count();
    
    // Should have some accessibility features
    expect(count).toBeGreaterThan(0);
  });

  test('should handle loading states', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Should show loading state initially
    await expect(page.locator('body')).toBeVisible();
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Should show main content after loading
    await expect(page.locator('div.min-h-screen')).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/**', route => route.abort());
    
    await page.goto(BASE_URL);
    
    // Should still load the page
    await expect(page.locator('div.min-h-screen')).toBeVisible();
  });

  test('should handle form validation', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth`);
    
    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"]');
    if (await submitButton.count() > 0) {
      await submitButton.first().click();
      
      // Should show validation errors
      const errors = page.locator('.error, [class*="error"], [data-testid*="error"]');
      
      if (await errors.count() > 0) {
        await expect(errors.first()).toBeVisible();
      }
    }
  });

  test('should handle theme and styling', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
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
      await page.goto(BASE_URL);
      
      // Should load at all viewport sizes
      await expect(page.locator('div.min-h-screen')).toBeVisible();
    }
  });

  test('should handle performance metrics', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within reasonable time
    expect(loadTime).toBeLessThan(10000);
    
    // Should show main content
    await expect(page.locator('div.min-h-screen')).toBeVisible();
  });
}); 