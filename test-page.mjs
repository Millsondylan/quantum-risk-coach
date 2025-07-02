import puppeteer from 'puppeteer';

async function testPage() {
  console.log('🔍 Testing page functionality...');
  
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  const logs = [];
  const errors = [];
  
  page.on('console', msg => {
    logs.push(`CONSOLE: ${msg.text()}`);
    console.log(`CONSOLE: ${msg.text()}`);
  });
  
  page.on('pageerror', err => {
    errors.push(`ERROR: ${err.message}`);
    console.log(`ERROR: ${err.message}`);
  });
  
  try {
    await page.goto('http://localhost:8083', { waitUntil: 'networkidle2', timeout: 15000 });
    
    // Wait for React to render
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check if React components are rendered
    const content = await page.evaluate(() => {
      const root = document.querySelector('#root');
      const hasContent = root && root.children.length > 0;
      const bodyText = document.body.innerText;
      
      return {
        hasRoot: !!root,
        hasContent,
        rootChildren: root ? root.children.length : 0,
        bodyText: bodyText.substring(0, 500),
        allDivs: document.querySelectorAll('div').length,
        allButtons: document.querySelectorAll('button').length
      };
    });
    
    console.log('\n📊 PAGE ANALYSIS:');
    console.log('Has root element:', content.hasRoot);
    console.log('Has content in root:', content.hasContent);
    console.log('Root children:', content.rootChildren);
    console.log('Total divs:', content.allDivs);
    console.log('Total buttons:', content.allButtons);
    console.log('Body text preview:', content.bodyText.substring(0, 200));
    
    if (errors.length > 0) {
      console.log('\n❌ ERRORS FOUND:');
      errors.forEach(error => console.log(error));
    } else {
      console.log('\n✅ No JavaScript errors');
    }
    
    // Keep browser open for manual inspection
    console.log('\n⏸️ Browser will stay open for 30 seconds for manual inspection...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
  } catch (error) {
    console.error('Failed to test page:', error.message);
  }
  
  await browser.close();
}

testPage().catch(console.error);
