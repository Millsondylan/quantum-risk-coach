import puppeteer from 'puppeteer';

async function checkErrors() {
  console.log('🔍 Checking for JavaScript errors...');
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const logs = [];
  const errors = [];
  
  page.on('console', msg => {
    logs.push(`CONSOLE ${msg.type()}: ${msg.text()}`);
    console.log(`CONSOLE ${msg.type()}: ${msg.text()}`);
  });
  
  page.on('pageerror', err => {
    errors.push(`PAGE ERROR: ${err.message}`);
    console.log(`PAGE ERROR: ${err.message}`);
  });
  
  page.on('requestfailed', request => {
    errors.push(`REQUEST FAILED: ${request.url()} - ${request.failure()?.errorText}`);
    console.log(`REQUEST FAILED: ${request.url()} - ${request.failure()?.errorText}`);
  });
  
  try {
    await page.goto('http://localhost:8084', { waitUntil: 'networkidle2', timeout: 15000 });
    
    // Wait a bit for any async errors
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('\n📊 SUMMARY:');
    console.log('Logs:', logs.length);
    console.log('Errors:', errors.length);
    
    if (errors.length > 0) {
      console.log('\n❌ ERRORS FOUND:');
      errors.forEach(error => console.log(error));
    } else {
      console.log('\n✅ No errors found');
    }
    
  } catch (error) {
    console.error('Failed to load page:', error.message);
  }
  
  await browser.close();
}

checkErrors().catch(console.error);
