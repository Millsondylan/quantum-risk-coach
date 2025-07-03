import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('Simple Functionality Tests', () => {
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
    
    // Since no user is logged in, should redirect to auth page
    // Check if we're on auth page or if main content is visible
    const authForm = page.locator('form');
    const mainContent = page.locator('main');
    
    // Wait a bit for any redirects
    await page.waitForTimeout(1000);
    
    // Check if we're on auth page (expected behavior)
    if (await authForm.count() > 0) {
      await expect(authForm).toBeVisible();
      await expect(page.locator('input[type="text"]')).toBeVisible();
      // Note: No password input since this is username-only auth
    } else {
      // If somehow main content is visible, check for main element
      await expect(mainContent).toBeVisible();
    }
  });

  test('should navigate to auth page', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth`);
    
    // Should show auth form
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="text"]')).toBeVisible();
    // Note: No password input since this is username-only auth
  });

  test('should show main UI elements', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for main UI elements
    const mainElements = [
      'header',
      'main',
      'button',
      'input'
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

  test('should handle navigation', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Look for navigation links
    const navLinks = page.locator('a[href="/journal"], a[href="/live-trades"], a[href="/settings"], nav a');
    
    if (await navLinks.count() > 0) {
      // Click first navigation link
      await navLinks.first().click();
      
      // Should navigate to new page
      await expect(page).not.toHaveURL(BASE_URL);
    }
  });

  test('should handle data persistence', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Reload page
    await page.reload();
    
    // Should still load without errors - check for either auth or main content
    const authForm = page.locator('form');
    const mainContent = page.locator('main');
    
    if (await authForm.count() > 0) {
      await expect(authForm).toBeVisible();
    } else {
      await expect(mainContent).toBeVisible();
    }
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Try to access non-existent page
    await page.goto(`${BASE_URL}/non-existent-page`);
    
    // Should show some content (not blank page)
    const content = page.locator('body');
    await expect(content).not.toBeEmpty();
  });

  test('should handle mobile responsive design', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto(BASE_URL);
    
    // Should load on mobile - check for either auth or main content
    const authForm = page.locator('form');
    const mainContent = page.locator('main');
    
    if (await authForm.count() > 0) {
      await expect(authForm).toBeVisible();
    } else {
      await expect(mainContent).toBeVisible();
    }
  });

  test('should show authentication form elements', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth`);
    
    // Should show username input (username-only auth)
    const usernameInput = page.locator('input[type="text"]');
    if (await usernameInput.count() > 0) {
      await expect(usernameInput.first()).toBeVisible();
      
      // Test typing in username
      await usernameInput.first().fill('testuser');
      await expect(usernameInput.first()).toHaveValue('testuser');
    }
    
    // Should show form and buttons
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show main dashboard elements', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Look for common dashboard elements
    const dashboardElements = [
      'h1', 'h2', 'h3', // Headers
      'button', // Buttons
      'div', // Containers
      'span', 'p' // Text elements
    ];
    
    for (const element of dashboardElements) {
      const elements = page.locator(element);
      if (await elements.count() > 0) {
        await expect(elements.first()).toBeVisible();
      }
    }
  });

  test('should handle button clicks', async ({ page }) => {
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

  test('should handle link clicks', async ({ page }) => {
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

  test('should handle select dropdowns', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find all select elements
    const selects = page.locator('select');
    const count = await selects.count();
    
    if (count > 0) {
      // Click first select
      await selects.first().click();
      
      // Should not cause page to crash
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should handle textarea inputs', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find all textarea elements
    const textareas = page.locator('textarea');
    const count = await textareas.count();
    
    if (count > 0) {
      // Type in first textarea
      const firstTextarea = textareas.first();
      await firstTextarea.fill('test textarea input');
      
      // Should accept input
      await expect(firstTextarea).toHaveValue('test textarea input');
    }
  });

  test('should handle checkbox inputs', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find all checkbox elements
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    
    if (count > 0) {
      // Click first checkbox
      await checkboxes.first().click();
      
      // Should be checked
      await expect(checkboxes.first()).toBeChecked();
    }
  });

  test('should handle radio button inputs', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find all radio button elements
    const radios = page.locator('input[type="radio"]');
    const count = await radios.count();
    
    if (count > 0) {
      // Click first radio button
      await radios.first().click();
      
      // Should be checked
      await expect(radios.first()).toBeChecked();
    }
  });

  test('should handle file inputs', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find all file input elements
    const fileInputs = page.locator('input[type="file"]');
    const count = await fileInputs.count();
    
    if (count > 0) {
      // Should be visible
      await expect(fileInputs.first()).toBeVisible();
    }
  });

  test('should handle date inputs', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find all date input elements
    const dateInputs = page.locator('input[type="date"]');
    const count = await dateInputs.count();
    
    if (count > 0) {
      // Type in first date input
      const firstDateInput = dateInputs.first();
      await firstDateInput.fill('2024-01-01');
      
      // Should accept input
      await expect(firstDateInput).toHaveValue('2024-01-01');
    }
  });

  test('should handle number inputs', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find all number input elements
    const numberInputs = page.locator('input[type="number"]');
    const count = await numberInputs.count();
    
    if (count > 0) {
      // Type in first number input
      const firstNumberInput = numberInputs.first();
      await firstNumberInput.fill('123');
      
      // Should accept input
      await expect(firstNumberInput).toHaveValue('123');
    }
  });

  test('should handle search inputs', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find all search input elements
    const searchInputs = page.locator('input[type="search"]');
    const count = await searchInputs.count();
    
    if (count > 0) {
      // Type in first search input
      const firstSearchInput = searchInputs.first();
      await firstSearchInput.fill('test search');
      
      // Should accept input
      await expect(firstSearchInput).toHaveValue('test search');
    }
  });

  test('should handle tel inputs', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find all tel input elements
    const telInputs = page.locator('input[type="tel"]');
    const count = await telInputs.count();
    
    if (count > 0) {
      // Type in first tel input
      const firstTelInput = telInputs.first();
      await firstTelInput.fill('1234567890');
      
      // Should accept input
      await expect(firstTelInput).toHaveValue('1234567890');
    }
  });

  test('should handle url inputs', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find all url input elements
    const urlInputs = page.locator('input[type="url"]');
    const count = await urlInputs.count();
    
    if (count > 0) {
      // Type in first url input
      const firstUrlInput = urlInputs.first();
      await firstUrlInput.fill('https://example.com');
      
      // Should accept input
      await expect(firstUrlInput).toHaveValue('https://example.com');
    }
  });

  test('should handle color inputs', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find all color input elements
    const colorInputs = page.locator('input[type="color"]');
    const count = await colorInputs.count();
    
    if (count > 0) {
      // Should be visible
      await expect(colorInputs.first()).toBeVisible();
    }
  });

  test('should handle range inputs', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find all range input elements
    const rangeInputs = page.locator('input[type="range"]');
    const count = await rangeInputs.count();
    
    if (count > 0) {
      // Should be visible
      await expect(rangeInputs.first()).toBeVisible();
    }
  });

  test('should handle time inputs', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find all time input elements
    const timeInputs = page.locator('input[type="time"]');
    const count = await timeInputs.count();
    
    if (count > 0) {
      // Type in first time input
      const firstTimeInput = timeInputs.first();
      await firstTimeInput.fill('12:00');
      
      // Should accept input
      await expect(firstTimeInput).toHaveValue('12:00');
    }
  });

  test('should handle datetime-local inputs', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find all datetime-local input elements
    const datetimeInputs = page.locator('input[type="datetime-local"]');
    const count = await datetimeInputs.count();
    
    if (count > 0) {
      // Type in first datetime input
      const firstDatetimeInput = datetimeInputs.first();
      await firstDatetimeInput.fill('2024-01-01T12:00');
      
      // Should accept input
      await expect(firstDatetimeInput).toHaveValue('2024-01-01T12:00');
    }
  });

  test('should handle month inputs', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find all month input elements
    const monthInputs = page.locator('input[type="month"]');
    const count = await monthInputs.count();
    
    if (count > 0) {
      // Type in first month input
      const firstMonthInput = monthInputs.first();
      await firstMonthInput.fill('2024-01');
      
      // Should accept input
      await expect(firstMonthInput).toHaveValue('2024-01');
    }
  });

  test('should handle week inputs', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find all week input elements
    const weekInputs = page.locator('input[type="week"]');
    const count = await weekInputs.count();
    
    if (count > 0) {
      // Type in first week input
      const firstWeekInput = weekInputs.first();
      await firstWeekInput.fill('2024-W01');
      
      // Should accept input
      await expect(firstWeekInput).toHaveValue('2024-W01');
    }
  });

  test('should handle password inputs', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find all password input elements
    const passwordInputs = page.locator('input[type="password"]');
    const count = await passwordInputs.count();
    
    if (count > 0) {
      // Type in first password input
      const firstPasswordInput = passwordInputs.first();
      await firstPasswordInput.fill('password123');
      
      // Should accept input
      await expect(firstPasswordInput).toHaveValue('password123');
    }
  });

  test('should handle email inputs', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find all email input elements
    const emailInputs = page.locator('input[type="email"]');
    const count = await emailInputs.count();
    
    if (count > 0) {
      // Type in first email input
      const firstEmailInput = emailInputs.first();
      await firstEmailInput.fill('test@example.com');
      
      // Should accept input
      await expect(firstEmailInput).toHaveValue('test@example.com');
    }
  });

  test('should handle text inputs', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find all text input elements
    const textInputs = page.locator('input[type="text"]');
    const count = await textInputs.count();
    
    if (count > 0) {
      // Type in first text input
      const firstTextInput = textInputs.first();
      await firstTextInput.fill('test text input');
      
      // Should accept input
      await expect(firstTextInput).toHaveValue('test text input');
    }
  });
}); 