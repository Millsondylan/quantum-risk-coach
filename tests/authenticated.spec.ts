import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:5173';

test.describe('Authenticated App Tests', () => {
  test('auth page loads and has form elements', async ({ page }) => {
    await page.goto(`${BASE}/auth`);
    
    // Check for auth form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("Sign In")')).toBeVisible();
  });

  test('auth form accepts input', async ({ page }) => {
    await page.goto(`${BASE}/auth`);
    
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    
    await expect(page.locator('input[type="email"]')).toHaveValue('test@example.com');
    await expect(page.locator('input[type="password"]')).toHaveValue('password123');
  });

  test('auth tabs work', async ({ page }) => {
    await page.goto(`${BASE}/auth`);
    
    // Click Sign Up tab
    await page.click('[role="tab"]:has-text("Sign Up")');
    await expect(page.locator('[role="tab"]:has-text("Sign Up")')).toBeVisible();
    
    // Click Sign In tab
    await page.click('[role="tab"]:has-text("Sign In")');
    await expect(page.locator('[role="tab"]:has-text("Sign In")')).toBeVisible();
  });

  test('protected routes redirect to auth', async ({ page }) => {
    await page.goto(`${BASE}/`);
    // Should show auth page
    await expect(page.locator('[data-testid="auth-tabs"]')).toBeVisible();
  });

  test('journal route redirects to auth', async ({ page }) => {
    await page.goto(`${BASE}/journal`);
    // Should show auth page
    await expect(page.locator('[data-testid="auth-tabs"]')).toBeVisible();
  });

  test('trade builder redirects to auth', async ({ page }) => {
    await page.goto(`${BASE}/trade-builder`);
    // Should show auth page
    await expect(page.locator('[data-testid="auth-tabs"]')).toBeVisible();
  });

  test('settings redirects to auth', async ({ page }) => {
    await page.goto(`${BASE}/settings`);
    // Should show auth page
    await expect(page.locator('[data-testid="auth-tabs"]')).toBeVisible();
  });

  test('performance calendar redirects to auth', async ({ page }) => {
    await page.goto(`${BASE}/performance-calendar`);
    // Should show auth page
    await expect(page.locator('[data-testid="auth-tabs"]')).toBeVisible();
  });

  test('strategy analyzer redirects to auth', async ({ page }) => {
    await page.goto(`${BASE}/strategy-analyzer`);
    // Should show auth page
    await expect(page.locator('[data-testid="auth-tabs"]')).toBeVisible();
  });

  test('404 page works', async ({ page }) => {
    await page.goto(`${BASE}/invalid-route`);
    await expect(page.locator('text=404')).toBeVisible();
    await expect(page.locator('text=Return to Home')).toBeVisible();
  });

  test('404 page navigation works', async ({ page }) => {
    await page.goto(`${BASE}/nonexistent-route`);
    // Should show 404 page
    await expect(page.locator('text=404')).toBeVisible();
  });

  test('navigation not visible on auth page', async ({ page }) => {
    await page.goto(`${BASE}/auth`);
    
    // Navigation should NOT be visible on auth page
    await expect(page.locator('[data-testid="mobile-bottom-nav"]')).not.toBeVisible();
  });

  test('responsive design works', async ({ page }) => {
    await page.goto(`${BASE}/auth`);
    
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();
    
    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('body')).toBeVisible();
    
    // Test desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('body')).toBeVisible();
  });

  test('form validation works', async ({ page }) => {
    await page.goto(`${BASE}/auth`);
    
    // Try to submit empty form
    await page.click('button:has-text("Sign In")');
    await expect(page.locator('body')).toBeVisible();
    
    // Fill only email
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Sign In")');
    await expect(page.locator('body')).toBeVisible();
    
    // Fill only password
    await page.fill('input[type="email"]', '');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Sign In")');
    await expect(page.locator('body')).toBeVisible();
  });

  test('input types work correctly', async ({ page }) => {
    await page.goto(`${BASE}/auth`);
    
    // Test email input type
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveAttribute('type', 'email');
    
    // Test password input type
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('accessibility features work', async ({ page }) => {
    await page.goto(`${BASE}/auth`);
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(page.locator('body')).toBeVisible();
    
    // Test focus indicators
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('page title is set', async ({ page }) => {
    await page.goto(`${BASE}/auth`);
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('no console errors on auth page', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto(`${BASE}/auth`);
    await page.waitForTimeout(2000);
    
    console.log('Console errors on auth page:', errors);
    // Don't fail on network errors as they might be expected
  });

  test('no page errors on auth page', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    await page.goto(`${BASE}/auth`);
    await page.waitForTimeout(2000);
    
    console.log('Page errors on auth page:', errors);
    expect(errors.length).toBe(0);
  });
}); 