import { test, expect } from '@playwright/test';
import { 
  authenticateUser, 
  navigateToSection, 
  addTrade, 
  createPortfolio,
  waitForPerformanceMetrics,
  setupMobileView,
  waitForMobileNav,
  clearStorage,
  waitForToast,
  expectError,
  BASE_URL
} from './test-helpers';

test.describe('Improved Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
  });

  test.describe('Authentication Flow', () => {
    test('should complete authentication with improved reliability', async ({ page }) => {
      await authenticateUser(page, 'testuser');
      
      // Verify we're on the main page
      await expect(page).toHaveURL(`${BASE_URL}/`);
      
      // Wait for main content to be visible
      const mainContent = page.locator('[data-testid="main-content"]');
      await mainContent.waitFor({ state: 'visible', timeout: 15000 });
    });

    test('should handle form validation errors gracefully', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth`);
      await page.waitForLoadState('networkidle');
      
      // Submit empty form
      const submitButton = page.locator('[data-testid="signup-submit-button"]');
      await submitButton.waitFor({ state: 'visible', timeout: 10000 });
      await submitButton.click();
      
      // Expect validation error
      await expectError(page);
    });
  });

  test.describe('Trade Management', () => {
    test('should add trade with custom symbol', async ({ page }) => {
      await authenticateUser(page);
      
      // Navigate to add trade page
      await navigateToSection(page, 'add-trade');
      
      // Wait for the form to load
      const addTradePage = page.locator('[data-testid="add-trade-page"]');
      await addTradePage.waitFor({ state: 'visible', timeout: 15000 });
      
      // Select custom symbol
      const symbolSelect = page.locator('[data-testid="symbol-select"]');
      await symbolSelect.waitFor({ state: 'visible', timeout: 10000 });
      await symbolSelect.click();
      
      const customOption = page.locator('text=Custom Symbol');
      await customOption.waitFor({ state: 'visible', timeout: 5000 });
      await customOption.click();
      
      // Fill custom symbol
      const customSymbolInput = page.locator('[data-testid="custom-symbol-input"]');
      await customSymbolInput.waitFor({ state: 'visible', timeout: 10000 });
      await customSymbolInput.fill('AAPL');
      
      // Fill other trade details
      const tradeTypeSelect = page.locator('[data-testid="trade-type-select"]');
      await tradeTypeSelect.waitFor({ state: 'visible', timeout: 10000 });
      await tradeTypeSelect.selectOption('buy');
      
      const entryPriceInput = page.locator('[data-testid="entry-price-input"]');
      await entryPriceInput.waitFor({ state: 'visible', timeout: 10000 });
      await entryPriceInput.fill('150.00');
      
      const exitPriceInput = page.locator('[data-testid="exit-price-input"]');
      await exitPriceInput.waitFor({ state: 'visible', timeout: 10000 });
      await exitPriceInput.fill('155.00');
      
      const sizeInput = page.locator('[data-testid="size-input"]');
      await sizeInput.waitFor({ state: 'visible', timeout: 10000 });
      await sizeInput.fill('100');
      
      const notesInput = page.locator('[data-testid="notes-input"]');
      await notesInput.waitFor({ state: 'visible', timeout: 10000 });
      await notesInput.fill('Test trade with custom symbol');
      
      // Submit trade
      const saveButton = page.locator('[data-testid="save-trade-button"]');
      await saveButton.waitFor({ state: 'visible', timeout: 10000 });
      await saveButton.click();
      
      // Wait for success message
      await waitForToast(page, 'Trade added successfully');
    });

    test('should add trade with predefined symbol', async ({ page }) => {
      await authenticateUser(page);
      
      await addTrade(page, {
        symbol: 'EURUSD',
        type: 'buy',
        entryPrice: '1.1000',
        exitPrice: '1.1050',
        size: '1.0',
        notes: 'Test EURUSD trade'
      });
    });
  });

  test.describe('Portfolio Management', () => {
    test('should create and manage portfolios', async ({ page }) => {
      await authenticateUser(page);
      
      await createPortfolio(page, 'Test Portfolio');
      
      // Verify portfolio is active
      const activePortfolio = page.locator('[data-testid="active-portfolio"]');
      await activePortfolio.waitFor({ state: 'visible', timeout: 10000 });
      await expect(activePortfolio).toContainText('Test Portfolio');
    });
  });

  test.describe('Navigation', () => {
    test('should navigate between all sections', async ({ page }) => {
      await authenticateUser(page);
      
      // Test navigation to different sections
      const sections = ['journal', 'add-trade', 'settings', 'home'];
      
      for (const section of sections) {
        await navigateToSection(page, section);
        
        // Verify we're on the correct page
        const expectedUrl = section === 'home' ? `${BASE_URL}/` : `${BASE_URL}/${section}`;
        await expect(page).toHaveURL(expectedUrl);
        
        // Wait for page content to load
        await page.waitForLoadState('networkidle');
      }
    });
  });

  test.describe('Mobile Experience', () => {
    test('should work properly on mobile devices', async ({ page }) => {
      await setupMobileView(page);
      await authenticateUser(page);
      
      // Wait for mobile navigation
      const mobileNav = await waitForMobileNav(page);
      await expect(mobileNav).toBeVisible();
      
      // Test mobile navigation
      await navigateToSection(page, 'journal');
      await expect(page).toHaveURL(`${BASE_URL}/journal`);
      
      // Verify mobile nav is still visible
      await expect(mobileNav).toBeVisible();
    });

    test('should handle scrolling properly on mobile', async ({ page }) => {
      await setupMobileView(page);
      await authenticateUser(page);
      
      // Navigate to settings (which has lots of content)
      await navigateToSection(page, 'settings');
      
      // Wait for settings page to load
      const settingsPage = page.locator('[data-testid="settings-page"]');
      await settingsPage.waitFor({ state: 'visible', timeout: 15000 });
      
      // Test scrolling - should be able to scroll to bottom
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      
      // Wait a moment for scroll to complete
      await page.waitForTimeout(1000);
      
      // Verify we can still see the mobile nav
      const mobileNav = await waitForMobileNav(page);
      await expect(mobileNav).toBeVisible();
    });
  });

  test.describe('Performance Dashboard', () => {
    test('should display performance metrics after adding trades', async ({ page }) => {
      await authenticateUser(page);
      
      // Add a trade first
      await addTrade(page, {
        symbol: 'GBPUSD',
        type: 'sell',
        entryPrice: '1.2500',
        exitPrice: '1.2450',
        size: '0.5',
        notes: 'Test performance trade'
      });
      
      // Navigate back to home to see performance metrics
      await navigateToSection(page, 'home');
      
      // Wait for performance metrics to load
      await waitForPerformanceMetrics(page);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Mock network failure
      await page.route('**/api/**', route => route.abort());
      
      await page.goto(`${BASE_URL}/auth`);
      await page.waitForLoadState('networkidle');
      
      const usernameInput = page.locator('[data-testid="signup-username-input"]');
      await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
      await usernameInput.fill('testuser');
      
      const submitButton = page.locator('[data-testid="signup-submit-button"]');
      await submitButton.waitFor({ state: 'visible', timeout: 10000 });
      await submitButton.click();
      
      // Should show error message
      await expectError(page);
    });
  });

  test.describe('Data Persistence', () => {
    test('should persist data across sessions', async ({ page }) => {
      await authenticateUser(page);
      
      // Add a trade
      await addTrade(page, {
        symbol: 'USDJPY',
        type: 'buy',
        entryPrice: '110.00',
        exitPrice: '110.50',
        size: '1.0',
        notes: 'Persistent trade test'
      });
      
      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Should still see the trade
      const tradeText = page.locator('text=USDJPY');
      await tradeText.waitFor({ state: 'visible', timeout: 15000 });
      await expect(tradeText).toBeVisible();
    });
  });

  test.describe('Form Validation', () => {
    test('should validate trade form properly', async ({ page }) => {
      await authenticateUser(page);
      await navigateToSection(page, 'add-trade');
      
      // Try to submit empty form
      const saveButton = page.locator('[data-testid="save-trade-button"]');
      await saveButton.waitFor({ state: 'visible', timeout: 10000 });
      await saveButton.click();
      
      // Should show validation errors
      await waitForToast(page, 'Please enter a symbol');
    });
  });

  test.describe('CSV Import', () => {
    test('should handle CSV import interface', async ({ page }) => {
      await authenticateUser(page);
      await navigateToSection(page, 'add-trade');
      
      // Switch to CSV tab
      const csvTab = page.locator('button:has-text("CSV Import")');
      await csvTab.waitFor({ state: 'visible', timeout: 10000 });
      await csvTab.click();
      
      // Wait for CSV interface to load
      const csvFileInput = page.locator('[data-testid="csv-file-input"]');
      await csvFileInput.waitFor({ state: 'visible', timeout: 10000 });
      await expect(csvFileInput).toBeVisible();
      
      // Verify CSV format example is shown
      const csvExample = page.locator('text=CSV Format Example');
      await csvExample.waitFor({ state: 'visible', timeout: 10000 });
      await expect(csvExample).toBeVisible();
    });
  });
}); 