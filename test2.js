// get all job

const puppeteer = require("puppeteer"); 

(async () => {
  const urls = ['https://www.vietnamworks.com/viec-lam-tot-nhat?page=0','https://www.vietnamworks.com/viec-lam-tot-nhat?page=1', 'https://www.vietnamworks.com/viec-lam-tot-nhat?page=2']
  for (let i = 0; i < urls.length; i++) {

      const url = urls[i];
      let data = []
      const browser = await puppeteer.launch({ headless: true,  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
      const page = await browser.newPage();
      await page.goto(`${url}`, { waitUntil: 'networkidle2' });
      const hrefs = await page.$$eval('.job__info > a', as => as.map(a => a.innerText));
      const img = await page.$$eval('.image > span > img', as => as.map(a => a.src));
      const nameCompany = await page.$$eval('.job__info-text', as => as.map(a => a.innerText));
      const date = await page.$$eval('.job__info-text > span', as => as.map(a => a.innerText));

      for(let i = 0 ; i < img.length ; i++)
      {
        const hrefDetail = hrefs[i]
        const imgDetail = img[i]
        const nameCompanyDetail = nameCompany[i]
        const dateDetail = date[i]
        data.push({hrefDetail, imgDetail, nameCompanyDetail, dateDetail})
      }

      console.log(data);
      await browser.close();

  }
})()