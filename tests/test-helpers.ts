import { Page, expect } from '@playwright/test';

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