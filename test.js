const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('http://localhost:8084', { waitUntil: 'networkidle2' });
  
  const content = await page.evaluate(() => {
    const title = document.title;
    const bodyText = document.body.innerText.substring(0, 500);
    const challengeElements = document.querySelectorAll('[class*="challenge"]').length;
    const cardElements = document.querySelectorAll('[class*="card"]').length;
    const buttonElements = document.querySelectorAll('button').length;
    
    return { title, bodyText, challengeElements, cardElements, buttonElements };
  });
  
  console.log('Content:', content);
  
  await browser.close();
})();
