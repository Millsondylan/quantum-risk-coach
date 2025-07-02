import { test, expect, chromium } from '@playwright/test';

const BASE = 'http://localhost:5173';

test('basic smoke test - app loads without errors', async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors: string[] = [];
  
  page.on('pageerror', e => errors.push(`PageError: ${e.message}`));
  page.on('console', msg => {
    if (msg.type() === 'error') {
      if (!msg.text().includes('ERR_NAME_NOT_RESOLVED') && 
          !msg.text().includes('Failed to load resource')) {
        errors.push(`ConsoleError: ${msg.text()}`);
      }
    }
  });

  // Test main page loads
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 10000 });
  await expect(page.locator('body')).toBeVisible();
  
  // Test auth page loads
  await page.goto(`${BASE}/auth`, { waitUntil: 'domcontentloaded', timeout: 10000 });
  await expect(page.locator('body')).toBeVisible();

  await browser.close();
  
  expect(errors, `Found errors in smoke test:\n${errors.join('\n')}`).toEqual([]);
});

test('critical functionality test', async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Test onboarding flow works
  await page.goto(`${BASE}/`);
  await expect(page.locator('[data-testid="onboarding-title"]')).toBeVisible();
  
  // Complete onboarding quickly
  await page.click('[data-testid="onboarding-next-button"]');
  await expect(page.locator('[data-testid="risk-tolerance-title"]')).toBeVisible();
  
  await page.click('[data-testid="onboarding-next-button"]');
  await expect(page.locator('[data-testid="onboarding-step-3"]')).toBeVisible();
  
  await page.click('[data-testid="onboarding-next-button"]');
  await expect(page.locator('[data-testid="onboarding-step-4"]')).toBeVisible();
  
  await page.click('[data-testid="onboarding-next-button"]');
  await expect(page.locator('[data-testid="onboarding-step-5"]')).toBeVisible();
  
  await page.click('[data-testid="onboarding-next-button"]');
  await expect(page.locator('[data-testid="onboarding-step-6"]')).toBeVisible();
  
  await page.click('[data-testid="onboarding-complete-button"]');
  
  // Now test navigation works
  await expect(page.locator('[data-testid="mobile-bottom-nav"]')).toBeVisible();
  await page.click('[data-testid="nav-journal"]');
  await expect(page).toHaveURL(/.*\/journal/);

  // Test auth form works
  await page.goto(`${BASE}/auth`);
  await page.fill('[data-testid="signin-email-input"]', 'test@example.com');
  await expect(page.locator('[data-testid="signin-email-input"]')).toHaveValue('test@example.com');

  await browser.close();
}); 