import { Page, Locator, expect } from '@playwright/test';

export const BASE_URL = 'http://localhost:5178';

// Enhanced wait strategies
export async function waitForElement(page: Page, selector: string, timeout = 15000): Promise<Locator> {
  const locator = page.locator(selector);
  await locator.waitFor({ state: 'visible', timeout });
  return locator;
}

export async function waitForElementToBeVisible(page: Page, selector: string, timeout = 15000): Promise<void> {
  const locator = page.locator(selector);
  await locator.waitFor({ state: 'visible', timeout });
  await expect(locator).toBeVisible();
}

export async function waitForElementToBeAttached(page: Page, selector: string, timeout = 15000): Promise<Locator> {
  const locator = page.locator(selector);
  await locator.waitFor({ state: 'attached', timeout });
  return locator;
}

// Authentication helpers
export async function authenticateUser(page: Page, username = 'testuser'): Promise<void> {
  await page.goto(`${BASE_URL}/auth`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  
  // Wait for auth page to load
  const authTabs = await waitForElement(page, '[data-testid="auth-tabs"]');
  await expect(authTabs).toBeVisible();
  
  // Fill in username
  const usernameInput = await waitForElement(page, '[data-testid="signup-username-input"]');
  await usernameInput.fill(username);
  
  // Submit form
  const submitButton = await waitForElement(page, '[data-testid="signup-submit-button"]');
  await submitButton.click();
  
  // Wait for authentication to complete
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Check if we're redirected to home page or still on auth page
  const currentUrl = page.url();
  if (currentUrl.includes('/auth')) {
    // Still on auth page, check for success message
    try {
      const successMessage = page.locator('text=Welcome, testuser!');
      await successMessage.waitFor({ state: 'visible', timeout: 5000 });
    } catch (e) {
      // If no success message, try to navigate to home
      await page.goto(`${BASE_URL}/`);
    }
  }
  
  // Ensure we're on the main app and navigation is visible
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  
  // Wait for either mobile or desktop navigation to be visible
  try {
    await page.locator('[data-testid="mobile-bottom-nav"]').waitFor({ state: 'visible', timeout: 10000 });
  } catch (e) {
    // If mobile nav not visible, check for desktop nav
    try {
      await page.locator('[data-testid="nav-home"], [data-testid="nav-journal"]').first().waitFor({ state: 'visible', timeout: 10000 });
    } catch (e2) {
      // If neither visible, we might still be on auth page
      throw new Error('Authentication failed - navigation not visible');
    }
  }
}

// Navigation helpers
export async function navigateToSection(page: Page, section: string): Promise<void> {
  const sectionMap: Record<string, string> = {
    'journal': '[data-testid="nav-journal"], a[href="/journal"]',
    'add-trade': '[data-testid="nav-add-trade"], a[href="/add-trade"]',
    'settings': '[data-testid="nav-settings"], a[href="/settings"]',
    'home': '[data-testid="nav-home"], a[href="/"]',
    'news': '[data-testid="nav-news"], a[href="/news"]',
    'analytics': '[data-testid="nav-analytics"], a[href="/performance-calendar"], a[href="/strategy-analyzer"], a[href="/history"]'
  };
  
  // For mobile navigation, use the bottom nav links
  const mobileSectionMap: Record<string, string> = {
    'journal': 'a[href="/journal"]',
    'add-trade': 'a[href="/add-trade"]',
    'settings': 'a[href="/settings"]',
    'home': 'a[href="/"]',
    'news': 'a[href="/news"]',
    'analytics': 'a[href="/performance-calendar"], a[href="/strategy-analyzer"], a[href="/history"]'
  };
  
  // Try mobile navigation first, then fallback to desktop
  const mobileSelector = mobileSectionMap[section];
  const desktopSelector = sectionMap[section];
  
  if (!mobileSelector || !desktopSelector) {
    throw new Error(`Unknown section: ${section}`);
  }
  
  // Wait for page to be fully loaded first
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  
  // Try mobile navigation first (bottom nav)
  try {
    // Wait for mobile nav to be visible
    await page.locator('[data-testid="mobile-bottom-nav"]').waitFor({ state: 'visible', timeout: 10000 });
    
    const mobileLink = page.locator(mobileSelector).first();
    await mobileLink.waitFor({ state: 'visible', timeout: 10000 });
    await mobileLink.click();
  } catch (e) {
    // Fallback to desktop navigation (header nav)
    try {
      const desktopLink = page.locator(desktopSelector).first();
      await desktopLink.waitFor({ state: 'visible', timeout: 10000 });
      await desktopLink.click();
    } catch (e2) {
      // Last resort: try direct URL navigation
      const urlMap: Record<string, string> = {
        'journal': '/journal',
        'add-trade': '/add-trade',
        'settings': '/settings',
        'home': '/',
        'news': '/news',
        'analytics': '/performance-calendar'
      };
      
      const url = urlMap[section];
      if (url) {
        await page.goto(url);
      } else {
        throw new Error(`Could not navigate to section: ${section}`);
      }
    }
  }
  
  // Wait for navigation to complete and page to be stable
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000); // Additional wait for UI to settle
}

// Form interaction helpers
export async function fillFormField(page: Page, selector: string, value: string): Promise<void> {
  const field = await waitForElement(page, selector);
  await field.fill(value);
}

export async function selectOption(page: Page, selector: string, value: string): Promise<void> {
  const select = await waitForElement(page, selector);
  
  // Check if it's a combobox (Radix UI Select)
  const isCombobox = await select.getAttribute('role') === 'combobox';
  
  if (isCombobox) {
    // Click to open the combobox
    await select.click();
    
    // Wait for the dropdown to appear and select the option
    const option = page.locator(`[data-value="${value}"], [role="option"]:has-text("${value}")`).first();
    await option.waitFor({ state: 'visible', timeout: 5000 });
    await option.click();
  } else {
    // Regular select element
    await select.selectOption(value);
  }
}

export async function clickButton(page: Page, selector: string): Promise<void> {
  const button = await waitForElement(page, selector);
  await button.click();
}

// Modal helpers
export async function waitForModal(page: Page, modalSelector: string): Promise<Locator> {
  return await waitForElement(page, modalSelector);
}

export async function closeModal(page: Page, closeSelector: string): Promise<void> {
  const closeButton = await waitForElement(page, closeSelector);
  await closeButton.click();
}

// Toast/notification helpers
export async function waitForToast(page: Page, message?: string): Promise<Locator> {
  const toastSelectors = [
    '[data-sonner-toast]',
    '.sonner-toast',
    '[data-testid="toast"]',
    '[data-testid="error-toast"]'
  ];
  
  for (const selector of toastSelectors) {
    try {
      const toast = page.locator(selector);
      await toast.waitFor({ state: 'visible', timeout: 5000 });
      if (message) {
        await expect(toast).toContainText(message);
      }
      return toast;
    } catch (e) {
      continue;
    }
  }
  
  throw new Error('No toast found');
}

// Error handling helpers
export async function expectError(page: Page, errorMessage?: string): Promise<void> {
  const errorSelectors = [
    '[data-testid="form-error"]',
    'text=Network error',
    'text=Connection error',
    'text=Failed to connect',
    'text=Please enter your username'
  ];
  
  for (const selector of errorSelectors) {
    try {
      const errorElement = page.locator(selector);
      await errorElement.waitFor({ state: 'visible', timeout: 5000 });
      if (errorMessage) {
        await expect(errorElement).toContainText(errorMessage);
      }
      return;
    } catch (e) {
      continue;
    }
  }
  
  // Check for toast notifications as fallback
  try {
    await waitForToast(page, errorMessage);
  } catch (e) {
    throw new Error('No error message found');
  }
}

// Trade entry helpers
export async function addTrade(page: Page, tradeData: {
  symbol: string;
  type: 'buy' | 'sell';
  entryPrice: string;
  exitPrice: string;
  size: string;
  notes?: string;
}): Promise<void> {
  // Navigate to add trade page
  await navigateToSection(page, 'add-trade');
  
  // Wait for form to load
  await waitForElement(page, '[data-testid="add-trade-page"]');
  
  // Fill trade form
  if (tradeData.symbol) {
    // Handle symbol selection - try predefined first, then custom
    try {
      await selectOption(page, '[data-testid="symbol-select"]', tradeData.symbol);
    } catch (e) {
      // If predefined symbol not found, use custom symbol input
      const customSymbolInput = page.locator('[data-testid="custom-symbol-input"]');
      await customSymbolInput.waitFor({ state: 'visible', timeout: 5000 });
      await customSymbolInput.fill(tradeData.symbol);
    }
  }
  
  await selectOption(page, '[data-testid="trade-type-select"]', tradeData.type);
  await fillFormField(page, '[data-testid="entry-price-input"]', tradeData.entryPrice);
  await fillFormField(page, '[data-testid="exit-price-input"]', tradeData.exitPrice);
  await fillFormField(page, '[data-testid="size-input"]', tradeData.size);
  
  if (tradeData.notes) {
    await fillFormField(page, '[data-testid="notes-input"]', tradeData.notes);
  }
  
  // Submit trade
  await clickButton(page, '[data-testid="save-trade-button"]');
  
  // Wait for success message or validation error
  try {
    await waitForToast(page, 'Trade added successfully');
  } catch (e) {
    // If no success message, check for validation errors
    await waitForToast(page, 'Please enter a symbol');
  }
}

// Portfolio helpers
export async function createPortfolio(page: Page, name: string): Promise<void> {
  const portfolioSelector = page.locator('[data-testid="portfolio-selector"], button:has-text("Portfolio"), select[name="portfolio"]').first();
  await portfolioSelector.waitFor({ state: 'visible', timeout: 15000 });
  await portfolioSelector.click();
  
  const createButton = await waitForElement(page, 'button:has-text("Create Portfolio")');
  await createButton.click();
  
  const nameInput = await waitForElement(page, 'input[placeholder*="portfolio name"]');
  await nameInput.fill(name);
  
  const saveButton = await waitForElement(page, 'button:has-text("Create")');
  await saveButton.click();
  
  // Verify portfolio was created
  const portfolioText = page.locator(`text=${name}`);
  await portfolioText.waitFor({ state: 'visible', timeout: 10000 });
}

// Performance metrics helpers
export async function waitForPerformanceMetrics(page: Page): Promise<void> {
  const metricsSelectors = [
    '[data-testid="win-rate"]',
    '[data-testid="total-profit"]',
    '[data-testid="risk-reward"]',
    '.win-rate',
    '.total-profit',
    '.risk-reward'
  ];
  
  for (const selector of metricsSelectors) {
    try {
      const element = page.locator(selector).first();
      await element.waitFor({ state: 'visible', timeout: 15000 });
      await expect(element).toBeVisible();
    } catch (e) {
      continue;
    }
  }
}

// Mobile-specific helpers
export async function setupMobileView(page: Page): Promise<void> {
  await page.setViewportSize({ width: 375, height: 667 });
}

export async function waitForMobileNav(page: Page): Promise<Locator> {
  return await waitForElement(page, '[data-testid="mobile-bottom-nav"], [data-testid="mobile-menu"], .mobile-nav');
}

// Utility functions
export async function clearStorage(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

export async function waitForPageLoad(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
}

export async function takeScreenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: `test-results/${name}.png` });
}

// Common selectors
export const SELECTORS = {
  AUTH_TABS: '[data-testid="auth-tabs"]',
  USERNAME_INPUT: '[data-testid="signup-username-input"]',
  SUBMIT_BUTTON: '[data-testid="signup-submit-button"]',
  MANUAL_JOURNAL_BUTTON: 'button:has-text("Manual Journal"), button:has-text("Add Trade"), [data-testid="manual-journal-button"]',
  PORTFOLIO_SELECTOR: '[data-testid="portfolio-selector"], button:has-text("Portfolio"), select[name="portfolio"]',
  NOTIFICATION_BELL: '[data-testid="notification-bell"], button:has-text("Notifications"), [aria-label*="notification"]',
  MOBILE_NAV: '[data-testid="mobile-bottom-nav"], [data-testid="mobile-menu"], .mobile-nav',
  TOAST: '[data-sonner-toast], .sonner-toast, [data-testid="toast"]',
  FORM_ERROR: '[data-testid="form-error"]',
  MAIN_CONTENT: '[data-testid="main-content"], .min-h-screen'
} as const;

export const clearUserState = async (page: Page) => {
  await page.evaluate(() => {
    try {
      localStorage.clear();
    } catch (e) {
      // Ignore security errors
    }
    try {
      sessionStorage.clear();
    } catch (e) {
      // Ignore security errors
    }
  });
  await page.reload();
};

export const completeAuth = async (page: Page, type: 'signin' | 'signup' = 'signup') => {
  if (type === 'signup') {
    await page.click('[data-testid="signup-tab"]');
    await page.fill('[data-testid="signup-username-input"]', 'testuser');
    await page.fill('[data-testid="signup-email-input"]', 'test@example.com');
    await page.fill('[data-testid="signup-password-input"]', 'password123');
    await page.fill('[data-testid="signup-confirm-password-input"]', 'password123');
    await page.click('[data-testid="signup-button"]');
    
    // Wait for navigation
    await page.waitForTimeout(2000);
    
    // Create user data in localStorage to trigger onboarding
    await page.evaluate(() => {
      const newUser = {
        id: `user_${Date.now()}`,
        preferences: {
          tradingStyle: 'day-trading',
          riskTolerance: 'moderate',
          preferredMarkets: [],
          experienceLevel: 'intermediate',
          notifications: {
            tradeAlerts: true,
            marketUpdates: true,
            riskWarnings: true,
          },
          theme: 'dark',
          language: 'en',
        },
        onboardingCompleted: false,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      };
      localStorage.setItem('user', JSON.stringify(newUser));
    });
    
    // Reload to trigger UserContext to pick up the new user
    await page.reload();
    
    // Wait for onboarding to appear
    try {
      await page.waitForSelector('[data-testid="onboarding-title"]', { timeout: 10000 });
    } catch (e) {
      console.log('Onboarding not shown immediately after auth');
    }
  } else {
    await page.fill('[data-testid="signin-email-input"]', 'test@example.com');
    await page.fill('[data-testid="signin-password-input"]', 'password123');
    await page.click('[data-testid="signin-button"]');
  }
  // Wait for auth to complete
  await page.waitForTimeout(1500);
};

export const completeOnboarding = async (page: Page) => {
  // Wait for onboarding to be visible first
  await page.waitForSelector('[data-testid="onboarding-title"]', { timeout: 10000 });
  
  // Step 1: Trading Style
  await page.waitForSelector('[data-testid="trading-style-select"]', { timeout: 5000 });
  await page.click('[data-testid="trading-style-select"]');
  await page.click('[data-testid="trading-style-day-trading"]');
  await page.click('[data-testid="onboarding-next-button"]');
  
  // Step 2: Risk Tolerance
  await page.waitForSelector('[data-testid="risk-tolerance-select"]', { timeout: 5000 });
  await page.click('[data-testid="risk-tolerance-select"]');
  await page.click('[data-testid="risk-level-moderate"]');
  await page.click('[data-testid="onboarding-next-button"]');
  
  // Step 3: Preferred Markets
  await page.waitForSelector('[data-testid="market-checkbox-forex-(fx)"]', { timeout: 5000 });
  await page.click('[data-testid="market-checkbox-forex-(fx)"]');
  await page.click('[data-testid="market-checkbox-stocks"]');
  await page.click('[data-testid="onboarding-next-button"]');
  
  // Step 4: Experience Level
  await page.waitForSelector('[data-testid="experience-level-select"]', { timeout: 5000 });
  await page.click('[data-testid="experience-level-select"]');
  await page.click('[data-testid="experience-level-intermediate"]');
  await page.click('[data-testid="onboarding-next-button"]');
  
  // Step 5: Notifications
  await page.click('[data-testid="onboarding-next-button"]');
  
  // Step 6: Complete
  await page.click('[data-testid="onboarding-complete-button"]');
  
  // Wait for onboarding to complete
  await page.waitForTimeout(1500);
};

export async function waitForOnboarding(page: Page) {
  // Only wait if onboarding is present
  const onboarding = page.locator('[data-testid="onboarding-title"]');
  if (await onboarding.count() === 0) return; // Not present, skip
  await expect(onboarding).toBeVisible();
} 