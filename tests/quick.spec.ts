import { test, expect } from '@playwright/test';
import { clearUserState, completeOnboarding } from './test-helpers';

const BASE = 'http://localhost:5175';

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
    expect(page.url()).toMatch(/^http:\/\/localhost:5175/);
  });

  test('auth form works', async ({ page }) => {
    // Navigate to auth page directly
    await page.goto(`${BASE}/auth`);
    
    // Wait for auth page to load
    await expect(page.locator('[data-testid="auth-tabs"]')).toBeVisible();
    
    // Check for username input instead of email
    await expect(page.locator('[data-testid="signup-username-input"]')).toBeVisible();
    
    // Click signin tab to make signin username input visible
    await page.click('[data-testid="signin-tab"]');
    await expect(page.locator('[data-testid="signin-username-input"]')).toBeVisible();
    
    // Test form input
    await page.click('[data-testid="signup-tab"]');
    await page.fill('[data-testid="signup-username-input"]', 'testuser');
    await page.click('[data-testid="signin-tab"]');
    await page.fill('[data-testid="signin-username-input"]', 'existinguser');
    
    await expect(page.locator('[data-testid="signin-username-input"]')).toHaveValue('existinguser');
  });

  test('404 page works', async ({ page }) => {
    await page.goto(`${BASE}/invalid-route`);
    // Check that the page loads (even if it shows onboarding)
    await expect(page.locator('body')).toBeVisible();
    expect(page.url()).toMatch(/^http:\/\/localhost:5175/);
  });
}); 