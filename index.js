const express = require('express');
const puppeteer = require('puppeteer');

const app = express();

app.get('/', async (req, res) => {
  const electronicUrl = 'https://www.vietnamworks.com/';
  try {
    const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
    const page = await browser.newPage();
    
    await page.goto(electronicUrl);

    let electronicData = await page.evaluate(() => {
      let products = [];
      let product_wrapper = document.querySelectorAll('.companyBlock__box');
      product_wrapper.forEach((product) => {
        let dataJson = {};
        try {
          dataJson.img = product.querySelector('img').src;
          dataJson.title = product.querySelector('.companyBlock__name').innerText;
        } catch (err) {
          console.log(err);
        }
        products.push(dataJson);

      });
      return products;
    });

    console.log(electronicData);
    await browser.close();
    
    res.json(electronicData); 
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/detail', async (req, res) => {
    const electronicUrl = 'https://www.vietnamworks.com/';
    try {
      const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
      const page = await browser.newPage();
      await page.goto(electronicUrl);
  
      let electronicData = await page.evaluate(() => {
        let products = [];
        let product_wrapper = document.querySelectorAll('.sc-hCgVqe.cWubWt.top_recommend.view_job_item');

        product_wrapper.forEach((product) => {
          let dataJson = {};
          try {
            dataJson.img = product.querySelector('.iJqjx > img').src;
            dataJson.title = product.querySelector('.fyPyUo > a').innerText;
            dataJson.salary = product.querySelector('.sc-cNQtGM').innerText
            dataJson.position = product.querySelector('.sc-gvRZDQ').innerText
          } catch (err) {
            console.log(err);
          }

          products.push(dataJson);
  
        });
        return products;
      });
  
      await browser.close();
      
      res.json(electronicData); 
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });



app.get('/extra', async (req, res) => {

    const page = Number(req.query.page);

    const electronicUrl = `https://www.vietnamworks.com/viec-lam-tot-nhat?page=${page-1}`;
    const userAgent = 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36';

    try {
      const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true});
      const page = await browser.newPage();
      await page.goto(electronicUrl);
      await page.waitForSelector('.job');

      let electronicData = await page.evaluate(() => {
        let products = [];
        let product_wrapper = document.querySelectorAll('.job');

        product_wrapper.forEach(async (product) => {
          let dataJson = {};
          try {
            
            dataJson.title = product.querySelector('.job__info-subTitle').innerText;
            dataJson.img = await product.querySelector('div.job__image > div > span > img').src;    
            dataJson.salary = product.querySelector('.salary').innerText
            dataJson.position = product.querySelector('.job__info-text').innerText
            dataJson.infor = product.querySelector('.job__info-text > span').innerText
            dataJson.check = product.querySelector('.job__info > a').innerText
            let link = product.querySelector('.job__info-title ').href
            linkProduct = link.split('https://www.vietnamworks.com/')[1]
            dataJson.link = 'http://localhost:3000/extra/' + linkProduct
          } catch (err) {
            console.log(err);
          }
          products.push(dataJson);
  
        });
        return products;
      });
  
      await browser.close();
      
      res.json(electronicData); 
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
});


app.get('/extra/:id', async (req, res) => {

    const id = req.params.id
    const electronicUrl = `https://www.vietnamworks.com/` + id;
    try {
      const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true});
      const page = await browser.newPage();
      await page.goto(electronicUrl);
      await page.waitForSelector('.job');

      let electronicData = await page.evaluate(() => {
        let products = [];
        let product_wrapper = document.querySelectorAll('.page-job-detail ');

        product_wrapper.forEach(async (product) => {
          let dataJson = {};
          try { 
            let title = product.querySelector('.job-title').innerText.trim();
            let titleConfig = title.split('\n')[0]
            dataJson.title = titleConfig
            dataJson.name =  product.querySelector('.name').innerText.trim();
            let benifit = []
            let location = []
            product.querySelectorAll('.benefit-name').forEach((be) => {
                benifit.push(be.innerText)
            })
            dataJson.benifit = benifit
            dataJson.requirements = product.querySelector('.requirements').innerText.trim().replace('\n', '');
            product.querySelectorAll('.location-name').forEach((be) => {
                location.push(be.innerText.trim())
            })
            dataJson.location = location
    
          } catch (err) {
            console.log(err);
          }
          products.push(dataJson);
  
        });
        return products;
      });
  
      await browser.close();
      
      res.json(electronicData); 
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
});


app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
