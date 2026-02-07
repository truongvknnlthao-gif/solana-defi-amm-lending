const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Set viewport
  await page.setViewportSize({ width: 1280, height: 720 });
  
  // Homepage
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'images/01-homepage.png' });
  console.log('✅ Homepage captured');
  
  // Swap page
  await page.goto('http://localhost:3000/swap');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'images/02-swap.png' });
  console.log('✅ Swap page captured');
  
  // Lending page
  await page.goto('http://localhost:3000/lending');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'images/03-lending.png' });
  console.log('✅ Lending page captured');
  
  await browser.close();
  console.log('🎉 All screenshots captured!');
})();
