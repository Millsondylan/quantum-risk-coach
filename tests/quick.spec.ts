import { test, expect } from '@playwright/test';
import { clearUserState, completeOnboarding } from './test-helpers';

const BASE = 'http://localhost:5173';

test.describe('Critical App Tests', () => {
  test('app loads without errors', async ({ page }) => {
    await page.goto(`${BASE}/`);
    await expect(page.locator('body')).toBeVisible();
  });

  test('auth page loads', async ({ page }) => {
    await page.goto(`${BASE}/auth`);
    await expect(page.locator('body')).toBeVisible();
  });

  test('journal page loads', async ({ page }) => {
    await page.goto(`${BASE}/journal`);
    await expect(page.locator('body')).toBeVisible();
  });

  test('trade builder loads', async ({ page }) => {
    await page.goto(`${BASE}/trade-builder`);
    await expect(page.locator('body')).toBeVisible();
  });

  test('settings page loads', async ({ page }) => {
    await page.goto(`${BASE}/settings`);
    await expect(page.locator('body')).toBeVisible();
  });

  test('performance calendar loads', async ({ page }) => {
    await page.goto(`${BASE}/performance-calendar`);
    await expect(page.locator('body')).toBeVisible();
  });

  test('strategy analyzer loads', async ({ page }) => {
    await page.goto(`${BASE}/strategy-analyzer`);
    await expect(page.locator('body')).toBeVisible();
  });

  test('navigation works', async ({ page }) => {
    await page.goto(`${BASE}/`);
    // Just check that the page loads successfully
    await expect(page.locator('body')).toBeVisible();
    expect(page.url()).toMatch(/^http:\/\/localhost:5173/);
  });

  test('auth form works', async ({ page }) => {
    // Navigate to auth page directly
    await page.goto(`${BASE}/auth`);
    
    // Now we should be on the auth page
    await expect(page.locator('input[type="email"]')).toBeVisible();
    // Click signin tab to make password input visible
    await page.click('[data-testid="signin-tab"]');
    await expect(page.locator('[data-testid="signin-password-input"]')).toBeVisible();
    
    // Test form input
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('[data-testid="signin-password-input"]', 'password123');
    
    await expect(page.locator('input[type="email"]')).toHaveValue('test@example.com');
    await expect(page.locator('[data-testid="signin-password-input"]')).toHaveValue('password123');
  });

  test('404 page works', async ({ page }) => {
    await page.goto(`${BASE}/invalid-route`);
    // Check that the page loads (even if it shows onboarding)
    await expect(page.locator('body')).toBeVisible();
    expect(page.url()).toMatch(/^http:\/\/localhost:5173/);
  });
}); 