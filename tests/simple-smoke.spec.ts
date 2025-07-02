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

  // Test navigation works
  await page.goto(`${BASE}/`);
  await page.click('[aria-label="Navigate to Journal"]');
  const currentUrl = page.url();
  expect(currentUrl.includes('/journal') || currentUrl.includes('/auth')).toBeTruthy();

  // Test auth form works
  await page.goto(`${BASE}/auth`);
  await page.fill('input[type="email"]', 'test@example.com');
  await expect(page.locator('input[type="email"]')).toHaveValue('test@example.com');

  await browser.close();
}); 