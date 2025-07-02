import puppeteer from 'puppeteer';

(async () => {
  console.log('🚀 Testing Page Content...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:8084', { waitUntil: 'networkidle2', timeout: 15000 });
    
    const content = await page.evaluate(() => {
      const title = document.title;
      const bodyText = document.body.innerText.substring(0, 500);
      const challengeElements = document.querySelectorAll('[class*="challenge"]').length;
      const cardElements = document.querySelectorAll('[class*="card"]').length;
      const buttonElements = document.querySelectorAll('button').length;
      const divElements = document.querySelectorAll('div').length;
      
      return { title, bodyText, challengeElements, cardElements, buttonElements, divElements };
    });
    
    console.log('✅ Page loaded successfully');
    console.log('📄 Title:', content.title);
    console.log('📝 Body text preview:', content.bodyText.substring(0, 200) + '...');
    console.log('🎯 Challenge elements:', content.challengeElements);
    console.log('💳 Card elements:', content.cardElements);
    console.log('🔘 Button elements:', content.buttonElements);
    console.log('📦 Total div elements:', content.divElements);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  await browser.close();
})();
