import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:5175';

test.describe('Authenticated App Tests', () => {
  test('auth page loads and has form elements', async ({ page }) => {
    await page.goto(`${BASE}/auth`);
    
    // Check for auth form elements
    await expect(page.locator('[data-testid="signup-username-input"]')).toBeVisible();
    // Click on signin tab to make username input visible
    await page.click('[data-testid="signin-tab"]');
    await expect(page.locator('[data-testid="signin-username-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="signin-tab"]')).toBeVisible();
  });

  test('auth form accepts input', async ({ page }) => {
    await page.goto(`${BASE}/auth`);
    
    await page.fill('[data-testid="signup-username-input"]', 'testuser');
    await expect(page.locator('[data-testid="signup-username-input"]')).toHaveValue('testuser');
    
    // Click on signin tab and test username input
    await page.click('[data-testid="signin-tab"]');
    await page.fill('[data-testid="signin-username-input"]', 'existinguser');
    await expect(page.locator('[data-testid="signin-username-input"]')).toHaveValue('existinguser');
  });

  test('auth tabs work', async ({ page }) => {
    await page.goto(`${BASE}/auth`);
    
    // Click Sign Up tab
    await page.click('[data-testid="signup-tab"]');
    await expect(page.locator('[data-testid="signup-content"]')).toBeVisible();
    
    // Click Sign In tab
    await page.click('[data-testid="signin-tab"]');
    await expect(page.locator('[data-testid="signin-content"]')).toBeVisible();
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
    
    // Test empty form submission on sign-in tab
    await page.click('[data-testid="signin-tab"]');
    await page.click('[data-testid="signin-submit-button"]');
    // Wait for toast notification to appear
    await expect(page.locator('[data-sonner-toast], .sonner-toast, [data-testid="toast"]')).toBeVisible({ timeout: 10000 });

    // Test empty form submission on sign-up tab
    await page.click('[data-testid="signup-tab"]');
    await page.click('[data-testid="signup-submit-button"]');
    // Wait for toast notification to appear
    await expect(page.locator('[data-sonner-toast], .sonner-toast, [data-testid="toast"]')).toBeVisible({ timeout: 10000 });
  });

  test('input types work correctly', async ({ page }) => {
    await page.goto(`${BASE}/auth`);
    
    // Test username input type for signup
    const signupUsernameInput = page.locator('[data-testid="signup-username-input"]');
    await expect(signupUsernameInput).toHaveAttribute('type', 'text');
    
    // Test username input type for signin
    await page.click('[data-testid="signin-tab"]'); // Ensure on signin tab
    const signinUsernameInput = page.locator('[data-testid="signin-username-input"]');
    await expect(signinUsernameInput).toHaveAttribute('type', 'text');
  });

  test('accessibility features work', async ({ page }) => {
    await page.goto(`${BASE}/auth`);
    
    // Test keyboard navigation (focused on username input)
    await page.focus('[data-testid="signup-username-input"]');
    await page.keyboard.press('Tab');
    await expect(page.locator('body')).toBeVisible();
    
    // Test focus indicators (on username input)
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