import puppeteer from 'puppeteer';
import fs from 'fs';

const TEST_URL = 'http://localhost:8084';
const testUserInject = fs.readFileSync('test-user-inject.js', 'utf8');

async function debugDOM() {
  console.log('�� DEBUG DOM CONTENT - Quantum Risk Coach');
  console.log('==================================================');

  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });
  
  try {
    const page = await browser.newPage();
    
    // Listen for console logs and errors
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
    
    console.log('⏳ Loading page...');
    await page.goto(TEST_URL, { waitUntil: 'networkidle2', timeout: 15000 });
    
    console.log('🔧 Injecting test user...');
    await page.evaluate(testUserInject);
    
    console.log('🔄 Reloading...');
    await page.reload({ waitUntil: 'networkidle2' });
    
    // Wait and check what's actually in the DOM
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const domContent = await page.evaluate(() => {
      return {
        innerHTML: document.body.innerHTML,
        childElementCount: document.body.childElementCount,
        hasReactRoot: !!document.querySelector('#root'),
        rootContent: document.querySelector('#root')?.innerHTML || 'No #root found',
        allDivs: document.querySelectorAll('div').length,
        scripts: Array.from(document.querySelectorAll('script')).map(s => s.src || 'inline').slice(0, 5)
      };
    });
    
    console.log('\n🔍 DOM ANALYSIS:');
    console.log('   Child Elements:', domContent.childElementCount);
    console.log('   Total Divs:', domContent.allDivs);
    console.log('   Has React Root:', domContent.hasReactRoot);
    console.log('   Scripts:', domContent.scripts);
    console.log('   Root Content Preview:', domContent.rootContent.substring(0, 300));
    
    if (domContent.innerHTML.length < 1000) {
      console.log('\n📄 FULL BODY CONTENT:');
      console.log(domContent.innerHTML);
    }
    
    // Check for errors in console
    const jsErrors = await page.evaluate(() => {
      return window.jsErrors || [];
    });
    
    if (jsErrors.length > 0) {
      console.log('\n❌ JS ERRORS FOUND:');
      jsErrors.forEach(error => console.log('  ', error));
    }
    
    // Keep browser open for manual inspection
    console.log('\n⏸️ Browser will stay open for 30 seconds for manual inspection...');
    await new Promise(resolve => setTimeout(resolve, 30000));

  } catch (error) {
    console.error('❌ Debug Error:', error.message);
  } finally {
    await browser.close();
  }
}

debugDOM().catch(console.error);
