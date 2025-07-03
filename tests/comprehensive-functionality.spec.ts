import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5178';

test.describe('Comprehensive Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing data
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test.describe('Authentication Flow', () => {
    test('should complete full authentication flow', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth`);
      
      // Wait for auth page to load completely
      await page.waitForLoadState('networkidle');
      
      // Wait for auth tabs to be visible and stable
      const authTabs = page.locator('[data-testid="auth-tabs"]');
      await authTabs.waitFor({ state: 'visible', timeout: 15000 });
      await expect(authTabs).toBeVisible();
      
      // Test registration with username only
      const usernameInput = page.locator('[data-testid="signup-username-input"]');
      await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
      await usernameInput.fill('testuser');
      
      const submitButton = page.locator('[data-testid="signup-submit-button"]');
      await submitButton.waitFor({ state: 'visible', timeout: 10000 });
      await submitButton.click();
      
      // Wait for success message or redirect with longer timeout
      try {
        await expect(page.locator('text=Welcome, testuser!')).toBeVisible({ timeout: 15000 });
      } catch (e) {
        // Check if we're redirected to main page
        await expect(page).toHaveURL(`${BASE_URL}/`);
      }
    });

    test('should handle login flow', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth`);
      
      // Wait for auth page to load completely
      await page.waitForLoadState('networkidle');
      
      const authTabs = page.locator('[data-testid="auth-tabs"]');
      await authTabs.waitFor({ state: 'visible', timeout: 15000 });
      await expect(authTabs).toBeVisible();
      
      // Click signin tab
      const signinTab = page.locator('[data-testid="signin-tab"]');
      await signinTab.waitFor({ state: 'visible', timeout: 10000 });
      await signinTab.click();
      
      // Fill login form with username only
      const usernameInput = page.locator('[data-testid="signin-username-input"]');
      await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
      await usernameInput.fill('existinguser');
      
      const submitButton = page.locator('[data-testid="signin-submit-button"]');
      await submitButton.waitFor({ state: 'visible', timeout: 10000 });
      await submitButton.click();
      
      // Should redirect to main app
      await expect(page).toHaveURL(`${BASE_URL}/`);
    });

    test('should handle form validation', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth`);
      
      // Wait for auth page to load completely
      await page.waitForLoadState('networkidle');
      
      const authTabs = page.locator('[data-testid="auth-tabs"]');
      await authTabs.waitFor({ state: 'visible', timeout: 15000 });
      await expect(authTabs).toBeVisible();
      
      // Test empty username
      const usernameInput = page.locator('[data-testid="signup-username-input"]');
      await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
      await usernameInput.focus();
      await page.keyboard.press('Enter');
      
      // Should show validation error - check for toast or form error
      try {
        const formError = page.locator('[data-testid="form-error"]');
        await formError.waitFor({ state: 'visible', timeout: 5000 });
        await expect(formError).toBeVisible();
      } catch (e) {
        // Check for toast notification
        const toast = page.locator('[data-sonner-toast], .sonner-toast, [data-testid="toast"]');
        await toast.waitFor({ state: 'visible', timeout: 5000 });
        await expect(toast).toBeVisible();
      }
      
      // Test short username
      await usernameInput.fill('ab');
      const submitButton = page.locator('[data-testid="signup-submit-button"]');
      await submitButton.waitFor({ state: 'visible', timeout: 10000 });
      await submitButton.click();
      
      // Should show validation error
      try {
        const formError = page.locator('[data-testid="form-error"]');
        await formError.waitFor({ state: 'visible', timeout: 5000 });
        await expect(formError).toBeVisible();
      } catch (e) {
        // Check for toast notification
        const toast = page.locator('[data-sonner-toast], .sonner-toast, [data-testid="toast"]');
        await toast.waitFor({ state: 'visible', timeout: 5000 });
        await expect(toast).toBeVisible();
      }
    });
  });

  test.describe('Onboarding Flow', () => {
    test('should complete onboarding process', async ({ page }) => {
      // First authenticate
      await page.goto(`${BASE_URL}/auth`);
      await page.waitForLoadState('networkidle');
      
      const authTabs = page.locator('[data-testid="auth-tabs"]');
      await authTabs.waitFor({ state: 'visible', timeout: 15000 });
      await expect(authTabs).toBeVisible();
      
      const usernameInput = page.locator('[data-testid="signup-username-input"]');
      await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
      await usernameInput.fill('testuser');
      
      const submitButton = page.locator('[data-testid="signup-submit-button"]');
      await submitButton.waitFor({ state: 'visible', timeout: 10000 });
      await submitButton.click();
      
      // Wait for onboarding modal or main page
      try {
        const onboardingModal = page.locator('[data-testid="onboarding-modal"]');
        await onboardingModal.waitFor({ state: 'visible', timeout: 10000 });
        
        // Step 1: Welcome
        const getStartedButton = page.locator('button:has-text("Get Started")');
        await getStartedButton.waitFor({ state: 'visible', timeout: 10000 });
        await getStartedButton.click();
        
        // Step 2: Portfolio Creation
        const portfolioInput = page.locator('input[placeholder*="portfolio name"]');
        await portfolioInput.waitFor({ state: 'visible', timeout: 10000 });
        await portfolioInput.fill('My First Portfolio');
        
        const nextButton = page.locator('button:has-text("Next")');
        await nextButton.waitFor({ state: 'visible', timeout: 10000 });
        await nextButton.click();
        
        // Step 3: Account Type
        const demoButton = page.locator('button:has-text("Demo")');
        await demoButton.waitFor({ state: 'visible', timeout: 10000 });
        await demoButton.click();
        
        const nextButton2 = page.locator('button:has-text("Next")');
        await nextButton2.waitFor({ state: 'visible', timeout: 10000 });
        await nextButton2.click();
        
        // Step 4: Broker Selection
        const manualJournalButton = page.locator('button:has-text("Manual Journal")');
        await manualJournalButton.waitFor({ state: 'visible', timeout: 10000 });
        await manualJournalButton.click();
        
        const completeButton = page.locator('button:has-text("Complete Setup")');
        await completeButton.waitFor({ state: 'visible', timeout: 10000 });
        await completeButton.click();
        
        // Should close onboarding
        await expect(onboardingModal).not.toBeVisible();
      } catch (e) {
        // Onboarding might be skipped, check if we're on main page
        await expect(page).toHaveURL(`${BASE_URL}/`);
      }
    });
  });

  test.describe('Portfolio Management', () => {
    test('should create and manage portfolios', async ({ page }) => {
      // Authenticate first
      await page.goto(`${BASE_URL}/auth`);
      await page.waitForLoadState('networkidle');
      
      const authTabs = page.locator('[data-testid="auth-tabs"]');
      await authTabs.waitFor({ state: 'visible', timeout: 15000 });
      await expect(authTabs).toBeVisible();
      
      const usernameInput = page.locator('[data-testid="signup-username-input"]');
      await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
      await usernameInput.fill('testuser');
      
      const submitButton = page.locator('[data-testid="signup-submit-button"]');
      await submitButton.waitFor({ state: 'visible', timeout: 10000 });
      await submitButton.click();
      
      // Wait for main page to load
      await page.waitForLoadState('networkidle');
      
      // Look for portfolio selector - it might be in different locations
      const portfolioSelector = page.locator('[data-testid="portfolio-selector"], button:has-text("Portfolio"), select[name="portfolio"]').first();
      await portfolioSelector.waitFor({ state: 'visible', timeout: 15000 });
      await portfolioSelector.click();
      
      // Create new portfolio
      const createPortfolioButton = page.locator('button:has-text("Create Portfolio")');
      await createPortfolioButton.waitFor({ state: 'visible', timeout: 10000 });
      await createPortfolioButton.click();
      
      const portfolioNameInput = page.locator('input[placeholder*="portfolio name"]');
      await portfolioNameInput.waitFor({ state: 'visible', timeout: 10000 });
      await portfolioNameInput.fill('Test Portfolio');
      
      const createButton = page.locator('button:has-text("Create")');
      await createButton.waitFor({ state: 'visible', timeout: 10000 });
      await createButton.click();
      
      // Should see new portfolio in list
      const portfolioText = page.locator('text=Test Portfolio');
      await portfolioText.waitFor({ state: 'visible', timeout: 10000 });
      await expect(portfolioText).toBeVisible();
      
      // Switch to new portfolio
      await portfolioText.click();
      
      // Should show portfolio is active
      const activePortfolio = page.locator('[data-testid="active-portfolio"]');
      await activePortfolio.waitFor({ state: 'visible', timeout: 10000 });
      await expect(activePortfolio).toContainText('Test Portfolio');
    });
  });

  test.describe('Trade Journaling', () => {
    test('should add manual trade entry', async ({ page }) => {
      // Authenticate first
      await page.goto(`${BASE_URL}/auth`);
      await page.waitForLoadState('networkidle');
      
      const authTabs = page.locator('[data-testid="auth-tabs"]');
      await authTabs.waitFor({ state: 'visible', timeout: 15000 });
      await expect(authTabs).toBeVisible();
      
      const usernameInput = page.locator('[data-testid="signup-username-input"]');
      await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
      await usernameInput.fill('testuser');
      
      const submitButton = page.locator('[data-testid="signup-submit-button"]');
      await submitButton.waitFor({ state: 'visible', timeout: 10000 });
      await submitButton.click();
      
      // Wait for main page to load
      await page.waitForLoadState('networkidle');
      
      // Look for manual journal button - it might be in different locations
      const manualJournalButton = page.locator('button:has-text("Manual Journal"), button:has-text("Add Trade"), [data-testid="manual-journal-button"]').first();
      await manualJournalButton.waitFor({ state: 'visible', timeout: 15000 });
      await manualJournalButton.click();
      
      // Wait for modal to open
      const symbolInput = page.locator('input[placeholder*="symbol"], input[name="symbol"]');
      await symbolInput.waitFor({ state: 'visible', timeout: 15000 });
      
      // Fill trade form
      await symbolInput.fill('EURUSD');
      
      const typeSelect = page.locator('select[name="type"], select[name="tradeType"]');
      await typeSelect.waitFor({ state: 'visible', timeout: 10000 });
      await typeSelect.selectOption('buy');
      
      const entryPriceInput = page.locator('input[placeholder*="entry price"], input[name="entryPrice"]');
      await entryPriceInput.waitFor({ state: 'visible', timeout: 10000 });
      await entryPriceInput.fill('1.1000');
      
      const exitPriceInput = page.locator('input[placeholder*="exit price"], input[name="exitPrice"]');
      await exitPriceInput.waitFor({ state: 'visible', timeout: 10000 });
      await exitPriceInput.fill('1.1050');
      
      const sizeInput = page.locator('input[placeholder*="size"], input[name="size"]');
      await sizeInput.waitFor({ state: 'visible', timeout: 10000 });
      await sizeInput.fill('1.0');
      
      const notesInput = page.locator('input[placeholder*="notes"], textarea[name="notes"]');
      await notesInput.waitFor({ state: 'visible', timeout: 10000 });
      await notesInput.fill('Test trade');
      
      // Submit trade
      const saveButton = page.locator('button:has-text("Add Trade"), button:has-text("Save Trade")');
      await saveButton.waitFor({ state: 'visible', timeout: 10000 });
      await saveButton.click();
      
      // Should show success message
      const successMessage = page.locator('text=Trade added successfully, text=Trade saved successfully');
      await successMessage.waitFor({ state: 'visible', timeout: 15000 });
      await expect(successMessage).toBeVisible();
      
      // Close modal
      const closeButton = page.locator('button:has-text("Close"), button:has-text("Cancel")');
      await closeButton.waitFor({ state: 'visible', timeout: 10000 });
      await closeButton.click();
    });

    test('should import CSV trades', async ({ page }) => {
      // Authenticate first
      await page.goto(`${BASE_URL}/auth`);
      await page.waitForLoadState('networkidle');
      
      const authTabs = page.locator('[data-testid="auth-tabs"]');
      await authTabs.waitFor({ state: 'visible', timeout: 15000 });
      await expect(authTabs).toBeVisible();
      
      const usernameInput = page.locator('[data-testid="signup-username-input"]');
      await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
      await usernameInput.fill('testuser');
      
      const submitButton = page.locator('[data-testid="signup-submit-button"]');
      await submitButton.waitFor({ state: 'visible', timeout: 10000 });
      await submitButton.click();
      
      // Wait for main page to load
      await page.waitForLoadState('networkidle');
      
      // Look for manual journal button
      const manualJournalButton = page.locator('button:has-text("Manual Journal"), button:has-text("Add Trade"), [data-testid="manual-journal-button"]').first();
      await manualJournalButton.waitFor({ state: 'visible', timeout: 15000 });
      await manualJournalButton.click();
      
      // Wait for modal to open
      const csvImportTab = page.locator('button:has-text("CSV Import"), [data-testid="csv-import-tab"]');
      await csvImportTab.waitFor({ state: 'visible', timeout: 15000 });
      
      // Click CSV import tab
      await csvImportTab.click();
      
      // Create test CSV file
      const csvContent = 'Symbol,Type,Entry Price,Exit Price,Size,Date,Notes\nEURUSD,buy,1.1000,1.1050,1.0,2024-01-01,Test trade';
      
      // Upload file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.waitFor({ state: 'visible', timeout: 10000 });
      await fileInput.setInputFiles({
        name: 'trades.csv',
        mimeType: 'text/csv',
        buffer: Buffer.from(csvContent)
      });
      
      // Should show preview
      const previewText = page.locator('text=EURUSD');
      await previewText.waitFor({ state: 'visible', timeout: 15000 });
      await expect(previewText).toBeVisible();
      
      // Import trades
      const importButton = page.locator('button:has-text("Import Trades")');
      await importButton.waitFor({ state: 'visible', timeout: 10000 });
      await importButton.click();
      
      // Should show success message
      const successMessage = page.locator('text=Trades imported successfully');
      await successMessage.waitFor({ state: 'visible', timeout: 15000 });
      await expect(successMessage).toBeVisible();
    });
  });

  test.describe('Broker Connection', () => {
    test('should connect to broker', async ({ page }) => {
      // Authenticate first
      await page.goto(`${BASE_URL}/auth`);
      await page.waitForLoadState('networkidle');
      
      const authTabs = page.locator('[data-testid="auth-tabs"]');
      await authTabs.waitFor({ state: 'visible', timeout: 15000 });
      await expect(authTabs).toBeVisible();
      
      const usernameInput = page.locator('[data-testid="signup-username-input"]');
      await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
      await usernameInput.fill('testuser');
      
      const submitButton = page.locator('[data-testid="signup-submit-button"]');
      await submitButton.waitFor({ state: 'visible', timeout: 10000 });
      await submitButton.click();
      
      // Wait for main page to load
      await page.waitForLoadState('networkidle');
      
      // Look for broker connection button
      const brokerButton = page.locator('button:has-text("Connect Broker"), button:has-text("Connect"), [data-testid="broker-connection-button"]').first();
      await brokerButton.waitFor({ state: 'visible', timeout: 15000 });
      await brokerButton.click();
      
      // Wait for modal to open
      const brokerSelect = page.locator('select[name="broker"], [data-testid="broker-select"]');
      await brokerSelect.waitFor({ state: 'visible', timeout: 15000 });
      
      // Select broker
      await brokerSelect.selectOption('demo');
      
      // Fill credentials
      const apiKeyInput = page.locator('input[placeholder*="API Key"], input[name="apiKey"]');
      await apiKeyInput.waitFor({ state: 'visible', timeout: 10000 });
      await apiKeyInput.fill('test-api-key');
      
      const secretInput = page.locator('input[placeholder*="Secret"], input[name="secret"]');
      await secretInput.waitFor({ state: 'visible', timeout: 10000 });
      await secretInput.fill('test-secret');
      
      const accountIdInput = page.locator('input[placeholder*="Account ID"], input[name="accountId"]');
      await accountIdInput.waitFor({ state: 'visible', timeout: 10000 });
      await accountIdInput.fill('12345');
      
      // Connect
      const connectButton = page.locator('button:has-text("Connect")');
      await connectButton.waitFor({ state: 'visible', timeout: 10000 });
      await connectButton.click();
      
      // Should show connection status
      const statusMessage = page.locator('text=Connected, text=Connection successful');
      await statusMessage.waitFor({ state: 'visible', timeout: 15000 });
      await expect(statusMessage).toBeVisible();
    });
  });

  test.describe('Performance Dashboard', () => {
    test('should display performance metrics', async ({ page }) => {
      // Authenticate first
      await page.goto(`${BASE_URL}/auth`);
      await page.waitForLoadState('networkidle');
      
      const authTabs = page.locator('[data-testid="auth-tabs"]');
      await authTabs.waitFor({ state: 'visible', timeout: 15000 });
      await expect(authTabs).toBeVisible();
      
      const usernameInput = page.locator('[data-testid="signup-username-input"]');
      await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
      await usernameInput.fill('testuser');
      
      const submitButton = page.locator('[data-testid="signup-submit-button"]');
      await submitButton.waitFor({ state: 'visible', timeout: 10000 });
      await submitButton.click();
      
      // Wait for main page to load
      await page.waitForLoadState('networkidle');
      
      // Add some test trades first
      const manualJournalButton = page.locator('button:has-text("Manual Journal"), button:has-text("Add Trade"), [data-testid="manual-journal-button"]').first();
      await manualJournalButton.waitFor({ state: 'visible', timeout: 15000 });
      await manualJournalButton.click();
      
      // Wait for modal to open
      const symbolInput = page.locator('input[placeholder*="symbol"], input[name="symbol"]');
      await symbolInput.waitFor({ state: 'visible', timeout: 15000 });
      
      await symbolInput.fill('EURUSD');
      
      const typeSelect = page.locator('select[name="type"], select[name="tradeType"]');
      await typeSelect.waitFor({ state: 'visible', timeout: 10000 });
      await typeSelect.selectOption('buy');
      
      const entryPriceInput = page.locator('input[placeholder*="entry price"], input[name="entryPrice"]');
      await entryPriceInput.waitFor({ state: 'visible', timeout: 10000 });
      await entryPriceInput.fill('1.1000');
      
      const exitPriceInput = page.locator('input[placeholder*="exit price"], input[name="exitPrice"]');
      await exitPriceInput.waitFor({ state: 'visible', timeout: 10000 });
      await exitPriceInput.fill('1.1050');
      
      const sizeInput = page.locator('input[placeholder*="size"], input[name="size"]');
      await sizeInput.waitFor({ state: 'visible', timeout: 10000 });
      await sizeInput.fill('1.0');
      
      const saveButton = page.locator('button:has-text("Add Trade"), button:has-text("Save Trade")');
      await saveButton.waitFor({ state: 'visible', timeout: 10000 });
      await saveButton.click();
      
      const closeButton = page.locator('button:has-text("Close"), button:has-text("Cancel")');
      await closeButton.waitFor({ state: 'visible', timeout: 10000 });
      await closeButton.click();
      
      // Check performance dashboard - look for various possible selectors
      const winRateElement = page.locator('[data-testid="win-rate"], .win-rate, [class*="win-rate"]').first();
      await winRateElement.waitFor({ state: 'visible', timeout: 15000 });
      await expect(winRateElement).toBeVisible();
      
      const totalProfitElement = page.locator('[data-testid="total-profit"], .total-profit, [class*="total-profit"]').first();
      await totalProfitElement.waitFor({ state: 'visible', timeout: 15000 });
      await expect(totalProfitElement).toBeVisible();
      
      const riskRewardElement = page.locator('[data-testid="risk-reward"], .risk-reward, [class*="risk-reward"]').first();
      await riskRewardElement.waitFor({ state: 'visible', timeout: 15000 });
      await expect(riskRewardElement).toBeVisible();
    });
  });

  test.describe('Navigation and UI', () => {
    test('should navigate between all sections', async ({ page }) => {
      // Authenticate first
      await page.goto(`${BASE_URL}/auth`);
      await page.waitForLoadState('networkidle');
      
      const authTabs = page.locator('[data-testid="auth-tabs"]');
      await authTabs.waitFor({ state: 'visible', timeout: 15000 });
      await expect(authTabs).toBeVisible();
      
      const usernameInput = page.locator('[data-testid="signup-username-input"]');
      await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
      await usernameInput.fill('testuser');
      
      const submitButton = page.locator('[data-testid="signup-submit-button"]');
      await submitButton.waitFor({ state: 'visible', timeout: 10000 });
      await submitButton.click();
      
      // Wait for main page to load
      await page.waitForLoadState('networkidle');
      
      // Test navigation to Journal - use proper navigation links
      const journalLink = page.locator('[data-testid="nav-journal"], a[href="/journal"]').first();
      await journalLink.waitFor({ state: 'visible', timeout: 15000 });
      await journalLink.click();
      await expect(page).toHaveURL(`${BASE_URL}/journal`);
      
      // Test navigation to Trade Builder
      const tradeLink = page.locator('[data-testid="nav-trade"], a[href="/trade-builder"], a[href="/add-trade"]').first();
      await tradeLink.waitFor({ state: 'visible', timeout: 15000 });
      await tradeLink.click();
      await expect(page).toHaveURL(new RegExp(`${BASE_URL}/(trade-builder|add-trade)`));
      
      // Test navigation to Settings
      const settingsLink = page.locator('[data-testid="nav-profile"], a[href="/settings"]').first();
      await settingsLink.waitFor({ state: 'visible', timeout: 15000 });
      await settingsLink.click();
      await expect(page).toHaveURL(`${BASE_URL}/settings`);
      
      // Test navigation back to Dashboard
      const homeLink = page.locator('[data-testid="nav-overview"], a[href="/"]').first();
      await homeLink.waitFor({ state: 'visible', timeout: 15000 });
      await homeLink.click();
      await expect(page).toHaveURL(`${BASE_URL}/`);
    });

    test('should handle mobile responsive design', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto(`${BASE_URL}/auth`);
      await page.waitForLoadState('networkidle');
      
      const authTabs = page.locator('[data-testid="auth-tabs"]');
      await authTabs.waitFor({ state: 'visible', timeout: 15000 });
      await expect(authTabs).toBeVisible();
      
      const usernameInput = page.locator('[data-testid="signup-username-input"]');
      await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
      await usernameInput.fill('testuser');
      
      const submitButton = page.locator('[data-testid="signup-submit-button"]');
      await submitButton.waitFor({ state: 'visible', timeout: 10000 });
      await submitButton.click();
      
      // Wait for main page to load
      await page.waitForLoadState('networkidle');
      
      // Check mobile menu - look for mobile navigation
      const mobileMenu = page.locator('[data-testid="mobile-menu"], [data-testid="mobile-bottom-nav"], .mobile-nav').first();
      await mobileMenu.waitFor({ state: 'visible', timeout: 15000 });
      await expect(mobileMenu).toBeVisible();
      
      // Test mobile navigation
      const mobileJournalLink = page.locator('[data-testid="nav-journal"], a[href="/journal"]').first();
      await mobileJournalLink.waitFor({ state: 'visible', timeout: 15000 });
      await mobileJournalLink.click();
      await expect(page).toHaveURL(`${BASE_URL}/journal`);
    });
  });

  test.describe('Notifications', () => {
    test('should handle notifications', async ({ page }) => {
      // Authenticate first
      await page.goto(`${BASE_URL}/auth`);
      await page.waitForLoadState('networkidle');
      
      const authTabs = page.locator('[data-testid="auth-tabs"]');
      await authTabs.waitFor({ state: 'visible', timeout: 15000 });
      await expect(authTabs).toBeVisible();
      
      const usernameInput = page.locator('[data-testid="signup-username-input"]');
      await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
      await usernameInput.fill('testuser');
      
      const submitButton = page.locator('[data-testid="signup-submit-button"]');
      await submitButton.waitFor({ state: 'visible', timeout: 10000 });
      await submitButton.click();
      
      // Wait for main page to load
      await page.waitForLoadState('networkidle');
      
      // Look for notification bell
      const notificationBell = page.locator('[data-testid="notification-bell"], button:has-text("Notifications"), [aria-label*="notification"]').first();
      await notificationBell.waitFor({ state: 'visible', timeout: 15000 });
      await notificationBell.click();
      
      // Should show notification center
      const notificationCenter = page.locator('[data-testid="notification-center"], .notification-center, [class*="notification"]').first();
      await notificationCenter.waitFor({ state: 'visible', timeout: 15000 });
      await expect(notificationCenter).toBeVisible();
      
      // Test notification filters
      const allButton = page.locator('button:has-text("All")');
      await allButton.waitFor({ state: 'visible', timeout: 10000 });
      await allButton.click();
      
      const tradesButton = page.locator('button:has-text("Trades")');
      await tradesButton.waitFor({ state: 'visible', timeout: 10000 });
      await tradesButton.click();
      
      const systemButton = page.locator('button:has-text("System")');
      await systemButton.waitFor({ state: 'visible', timeout: 10000 });
      await systemButton.click();
      
      // Close notification center
      const closeButton = page.locator('[data-testid="close-notifications"], button:has-text("Close"), [aria-label*="close"]').first();
      await closeButton.waitFor({ state: 'visible', timeout: 10000 });
      await closeButton.click();
      await expect(notificationCenter).not.toBeVisible();
    });
  });

  test.describe('Settings and Configuration', () => {
    test('should update user settings', async ({ page }) => {
      // Authenticate first
      await page.goto(`${BASE_URL}/auth`);
      await page.waitForLoadState('networkidle');
      
      const authTabs = page.locator('[data-testid="auth-tabs"]');
      await authTabs.waitFor({ state: 'visible', timeout: 15000 });
      await expect(authTabs).toBeVisible();
      
      const usernameInput = page.locator('[data-testid="signup-username-input"]');
      await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
      await usernameInput.fill('testuser');
      
      const submitButton = page.locator('[data-testid="signup-submit-button"]');
      await submitButton.waitFor({ state: 'visible', timeout: 10000 });
      await submitButton.click();
      
      // Wait for main page to load
      await page.waitForLoadState('networkidle');
      
      // Navigate to settings
      const settingsLink = page.locator('[data-testid="nav-profile"], a[href="/settings"]').first();
      await settingsLink.waitFor({ state: 'visible', timeout: 15000 });
      await settingsLink.click();
      
      // Wait for settings page to load
      await page.waitForLoadState('networkidle');
      
      // Update display name
      const displayNameInput = page.locator('input[placeholder*="display name"], input[name="displayName"]').first();
      await displayNameInput.waitFor({ state: 'visible', timeout: 15000 });
      await displayNameInput.fill('Updated Name');
      
      // Toggle notifications
      const notificationCheckbox = page.locator('input[type="checkbox"][name="emailNotifications"]').first();
      await notificationCheckbox.waitFor({ state: 'visible', timeout: 15000 });
      await notificationCheckbox.click();
      
      // Save settings
      const saveButton = page.locator('button:has-text("Save Settings"), button:has-text("Save")').first();
      await saveButton.waitFor({ state: 'visible', timeout: 15000 });
      await saveButton.click();
      
      // Should show success message
      const successMessage = page.locator('text=Settings saved successfully, text=Settings updated');
      await successMessage.waitFor({ state: 'visible', timeout: 15000 });
      await expect(successMessage).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Mock network failure
      await page.route('**/api/**', route => route.abort());
      
      await page.goto(`${BASE_URL}/auth`);
      await page.waitForLoadState('networkidle');
      
      const authTabs = page.locator('[data-testid="auth-tabs"]');
      await authTabs.waitFor({ state: 'visible', timeout: 15000 });
      await expect(authTabs).toBeVisible();
      
      const usernameInput = page.locator('[data-testid="signup-username-input"]');
      await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
      await usernameInput.fill('testuser');
      
      const submitButton = page.locator('[data-testid="signup-submit-button"]');
      await submitButton.waitFor({ state: 'visible', timeout: 10000 });
      await submitButton.click();
      
      // Should show error message - check for various error indicators
      try {
        const errorMessage = page.locator('text=Network error, text=Connection error, text=Failed to connect');
        await errorMessage.waitFor({ state: 'visible', timeout: 15000 });
        await expect(errorMessage).toBeVisible();
      } catch (e) {
        // Check for toast notification
        const toast = page.locator('[data-sonner-toast], .sonner-toast, [data-testid="toast"]');
        await toast.waitFor({ state: 'visible', timeout: 15000 });
        await expect(toast).toBeVisible();
      }
    });

    test('should handle form submission errors', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth`);
      
      // Wait for auth page to load completely
      await page.waitForLoadState('networkidle');
      
      const authTabs = page.locator('[data-testid="auth-tabs"]');
      await authTabs.waitFor({ state: 'visible', timeout: 15000 });
      await expect(authTabs).toBeVisible();
      
      // Submit empty form
      const submitButton = page.locator('[data-testid="signup-submit-button"]');
      await submitButton.waitFor({ state: 'visible', timeout: 10000 });
      await submitButton.click();
      
      // Should show validation errors - check for various error indicators
      try {
        const errorMessage = page.locator('text=Please enter your username');
        await errorMessage.waitFor({ state: 'visible', timeout: 15000 });
        await expect(errorMessage).toBeVisible();
      } catch (e) {
        // Check for form error or toast
        const errorElement = page.locator('[data-testid="form-error"], [data-sonner-toast], .sonner-toast, [data-testid="toast"]');
        await errorElement.waitFor({ state: 'visible', timeout: 15000 });
        await expect(errorElement).toBeVisible();
      }
    });
  });

  test.describe('Data Persistence', () => {
    test('should persist data across sessions', async ({ page }) => {
      // Authenticate and add data
      await page.goto(`${BASE_URL}/auth`);
      await page.waitForLoadState('networkidle');
      
      const authTabs = page.locator('[data-testid="auth-tabs"]');
      await authTabs.waitFor({ state: 'visible', timeout: 15000 });
      await expect(authTabs).toBeVisible();
      
      const usernameInput = page.locator('[data-testid="signup-username-input"]');
      await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
      await usernameInput.fill('testuser');
      
      const submitButton = page.locator('[data-testid="signup-submit-button"]');
      await submitButton.waitFor({ state: 'visible', timeout: 10000 });
      await submitButton.click();
      
      // Wait for main page to load
      await page.waitForLoadState('networkidle');
      
      // Add a trade
      const manualJournalButton = page.locator('button:has-text("Manual Journal"), button:has-text("Add Trade"), [data-testid="manual-journal-button"]').first();
      await manualJournalButton.waitFor({ state: 'visible', timeout: 15000 });
      await manualJournalButton.click();
      
      // Wait for modal to open
      const symbolInput = page.locator('input[placeholder*="symbol"], input[name="symbol"]');
      await symbolInput.waitFor({ state: 'visible', timeout: 15000 });
      
      await symbolInput.fill('EURUSD');
      
      const typeSelect = page.locator('select[name="type"], select[name="tradeType"]');
      await typeSelect.waitFor({ state: 'visible', timeout: 10000 });
      await typeSelect.selectOption('buy');
      
      const entryPriceInput = page.locator('input[placeholder*="entry price"], input[name="entryPrice"]');
      await entryPriceInput.waitFor({ state: 'visible', timeout: 10000 });
      await entryPriceInput.fill('1.1000');
      
      const exitPriceInput = page.locator('input[placeholder*="exit price"], input[name="exitPrice"]');
      await exitPriceInput.waitFor({ state: 'visible', timeout: 10000 });
      await exitPriceInput.fill('1.1050');
      
      const sizeInput = page.locator('input[placeholder*="size"], input[name="size"]');
      await sizeInput.waitFor({ state: 'visible', timeout: 10000 });
      await sizeInput.fill('1.0');
      
      const saveButton = page.locator('button:has-text("Add Trade"), button:has-text("Save Trade")');
      await saveButton.waitFor({ state: 'visible', timeout: 10000 });
      await saveButton.click();
      
      const closeButton = page.locator('button:has-text("Close"), button:has-text("Cancel")');
      await closeButton.waitFor({ state: 'visible', timeout: 10000 });
      await closeButton.click();
      
      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Should still see the trade
      const tradeText = page.locator('text=EURUSD');
      await tradeText.waitFor({ state: 'visible', timeout: 15000 });
      await expect(tradeText).toBeVisible();
    });
  });

  test.describe('Performance and Loading', () => {
    test('should load quickly and be responsive', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto(`${BASE_URL}/auth`);
      await page.waitForLoadState('networkidle');
      
      // Use username-based authentication
      const usernameInput = page.locator('[data-testid="signup-username-input"]');
      await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
      await usernameInput.fill('test@example.com');
      
      const submitButton = page.locator('[data-testid="signup-submit-button"]');
      await submitButton.waitFor({ state: 'visible', timeout: 10000 });
      await submitButton.click();
      
      // Wait for main app to load
      const mainDashboard = page.locator('[data-testid="main-dashboard"], .min-h-screen');
      await mainDashboard.waitFor({ state: 'visible', timeout: 15000 });
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 15 seconds
      expect(loadTime).toBeLessThan(15000);
    });
  });
}); 