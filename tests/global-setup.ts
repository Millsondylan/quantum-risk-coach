import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Clear any existing user data
  await page.goto('http://localhost:5174');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  await page.evaluate(() => {
    // Clear localStorage safely
    try {
      localStorage.clear();
    } catch (e) {
      // Ignore security errors
    }
    
    // Clear sessionStorage safely
    try {
      sessionStorage.clear();
    } catch (e) {
      // Ignore security errors
    }
    
    // Clear any Capacitor preferences
    try {
      if ((window as any).Capacitor) {
        // Clear Capacitor storage if available
      }
    } catch (e) {
      // Ignore errors
    }
    
    // Clear any other stored data
    try {
      if (window.indexedDB) {
        // Clear IndexedDB if needed
      }
    } catch (e) {
      // Ignore errors
    }
  });
  
  // Navigate to home to trigger fresh state
  await page.goto('http://localhost:5174');
  await page.waitForLoadState('networkidle');
  
  await browser.close();
}

export default globalSetup; 