import { chromium } from 'playwright';

async function testNetwork() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  const requests = [];
  const responses = [];
  
  // Capture all requests and responses
  page.on('request', request => {
    requests.push({
      url: request.url(),
      method: request.method(),
      headers: request.headers()
    });
  });
  
  page.on('response', response => {
    responses.push({
      url: response.url(),
      status: response.status(),
      statusText: response.statusText()
    });
  });
  
  try {
    console.log('🔍 Testing network requests...');
    
    await page.goto('http://localhost:8082/', { waitUntil: 'domcontentloaded' });
    
    // Wait a bit
    await page.waitForTimeout(3000);
    
    console.log('\n📡 REQUESTS:');
    requests.forEach(req => {
      console.log(`${req.method} ${req.url}`);
    });
    
    console.log('\n📡 RESPONSES:');
    responses.forEach(resp => {
      console.log(`${resp.status} ${resp.statusText} - ${resp.url}`);
    });
    
    // Check if main.tsx loaded
    const mainTsxResponse = responses.find(r => r.url.includes('main.tsx'));
    if (mainTsxResponse) {
      console.log('\n🔍 Main.tsx response:', mainTsxResponse);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

testNetwork().catch(console.error); 