const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Set viewport
  await page.setViewportSize({ width: 1280, height: 720 });
  
  // GitHub repository page
  await page.goto('https://github.com/truongvknnlthao-gif/solana-defi-amm-lending');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'images/04-github.png' });
  console.log('✅ GitHub page captured');
  
  await browser.close();
  console.log('🎉 GitHub screenshot captured!');
})();
