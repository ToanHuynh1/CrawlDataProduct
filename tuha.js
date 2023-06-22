const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = await browser.newPage();

  let currentPage = 2;
  while(true)
  {
      
      await page.goto(`https://www.sweelee.com.vn/collections/featured-deals-ngot-giua-nam?page=${currentPage}`, { waitUntil: 'networkidle2' });
      
      const href = await page.$$eval('.product-card__title > a', as => as.map(a => a.href));

      console.log(href);
    
      const nextPageButton = await page.$$eval('.ais-Pagination-link',  a => a.map(a => a.ariaLabel));

      if(nextPageButton.indexOf("Next") < 0) break;

      currentPage = currentPage + 1;
    

      
  }

  await browser.close();
})();
