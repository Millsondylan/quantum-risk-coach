import { chromium } from 'playwright';

async function testSimple() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    }
  });
  
  // Capture page errors
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });
  
  try {
    console.log('🔍 Testing simple page load...');
    
    await page.goto('http://localhost:8082/', { waitUntil: 'networkidle' });
    
    // Wait a bit for React to load
    await page.waitForTimeout(5000);
    
    // Check if root element exists
    const rootExists = await page.evaluate(() => {
      const root = document.getElementById('root');
      return {
        exists: !!root,
        children: root ? root.children.length : 0,
        innerHTML: root ? root.innerHTML.substring(0, 200) : 'No root'
      };
    });
    
    console.log('Root element check:', rootExists);
    
    // Check for any React errors
    const reactErrors = await page.evaluate(() => {
      return {
        hasReact: typeof React !== 'undefined',
        hasReactDOM: typeof ReactDOM !== 'undefined',
        rootElement: document.getElementById('root')?.innerHTML || 'No root'
      };
    });
    
    console.log('React check:', reactErrors);
    
    // Check page title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Take a screenshot
    await page.screenshot({ path: 'test-simple.png' });
    console.log('Screenshot saved as test-simple.png');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

testSimple().catch(console.error); 