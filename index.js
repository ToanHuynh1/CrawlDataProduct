const express = require('express');
const puppeteer = require('puppeteer');
// const downloadImage = require('./downLoadAnh')
const fs = require('fs');
const app = express();

app.get('/', async (req, res) => {
  const electronicUrl = 'https://www.vietnamworks.com/';
  try {
    const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
    const page = await browser.newPage();
    
    await page.goto(electronicUrl);

    let electronicData = await page.evaluate(() => {
      let products = [];
      let product_wrapper = document.querySelectorAll('.companyBlock');
      product_wrapper.forEach(async (product) => {
        let dataJson = {};
        try {
          dataJson.img = product.querySelector('img').src;
          dataJson.title = product.querySelector('.companyBlock__name').innerText;
          dataJson.href = product.querySelector('.companyBlock  > a').href;
  
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
  // const requestedPage = Number(req.query.page);

  const requestedPage = 1

  const userAgent =
    'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36';

  try {
    const browser = await puppeteer.launch({
      executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
      headless: true,
    });
    const page = await browser.newPage();
    await page.setUserAgent(userAgent);

    const electronicData = [];

    await page.goto('https://www.vietnamworks.com/viec-lam-tot-nhat');
    await page.waitForSelector('.pagination__item-link');

    const pageLinks = await page.$$eval('.pagination__item-link', (links) =>
      links.map((link) => link.textContent.trim())
    );

    let number = []

    for(let i = 0 ; i < pageLinks.length ; i++) {
      if (!isNaN(pageLinks[i])) {
        number.push(pageLinks[i])
      }
    }

    const totalPages = number.length;

    if (requestedPage < 1 || requestedPage > totalPages) {
      await browser.close();
      return res.status(400).send('Invalid page number');
    }

    let currentPage = requestedPage - 1;

    while (true) {
      const electronicUrl = `https://www.vietnamworks.com/viec-lam-tot-nhat?page=${currentPage}`;
      await page.goto(electronicUrl);
      await page.waitForSelector('.job', {timeout: 100000});

      const newData = await page.evaluate(() => {
        let products = [];
        let product_wrapper = document.querySelectorAll('.sc-aead75fd-0.fdwkBs');

        product_wrapper.forEach((product) => {
          let dataJson = {};
          try {

            const img  = product.querySelector('.image > span > img').src
            ? product.querySelector('.image > span > img').src
            : null;

            if (!img.includes('data:image/'))
            {
              dataJson.img = product.querySelector('.image > span > img').src
              ? product.querySelector('.image > span > img').src
              : null;
            }
            dataJson.title = product.querySelector('.job__info-subTitle').innerText;
            dataJson.salary = product.querySelector('.salary').innerText;
            dataJson.position = product.querySelector('.job__info-text').innerText;
            dataJson.infor = product.querySelector('.job__info-text > span').innerText;
            dataJson.check = product.querySelector('.job__info > a').innerText;
            let link = product.querySelector('.job__info-title').href;
            linkProduct = link.split('https://www.vietnamworks.com/')[1];
            dataJson.link = 'http://localhost:3000/extra/' + linkProduct;
          } catch (err) {
            console.log(err);
          }

          
          products.push(dataJson);
        });
        return products;
      });

      electronicData.push(...newData);
      console.log(newData);

      if (currentPage === requestedPage - 1) {
        currentPage++;
        continue;
      }

      const nextPageButton = await page.$('.pagination__item-link');

      if (!nextPageButton) break;

      await Promise.all([
        page.waitForNavigation({ timeout: 1000000, waitUntil: 'networkidle2' }),
        nextPageButton.click(),
      ]);

      currentPage++;

      
      // fs.writeFile('company.json', JSON.stringify(newData), (err) => {
      //   if (err) throw err;
      //   console.log('Save success');
      // });
    }

    await browser.close();

    // res.json(electronicData);
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
      await page.goto(electronicUrl, {timeout: 1000000});
      await page.waitForSelector('.summary-item');

      let electronicData = await page.evaluate(() => {
        let products = [];
        
        let product_wrapper = document.querySelectorAll('.page-job-detail');

        product_wrapper.forEach(async (product) => {
          let dataJson = {};
          let company = {}
          try { 
            dataJson.image = product.querySelector('.track-event > img').src;
            let title = product.querySelector('.job-title').innerText.trim();
            let titleConfig = title.split('\n')[0]
            dataJson.title = titleConfig
            dataJson.name =  product.querySelector('.name').innerText.trim();
            dataJson.view = (product.querySelector('.view.gray-light').innerText.trim() + " - " + product.querySelector('.expiry.gray-light').innerText.trim())
            let benifit = []
            let location = []
            let jobrecoment = []
            let cheat = []
            let work_infor = []
            let infor = []

            dataJson.benifit = benifit
            let requirements = product.querySelector('.requirements').innerText.trim();
            requirements = requirements.replace(/\n/g, '');
            const sentences = requirements.split(/•/);
            const filteredRequirements = sentences.filter((requirement) => requirement.trim() !== "");
            dataJson.requirements = filteredRequirements;
            product.querySelectorAll('.location-name').forEach((be) => {
                location.push(be.innerText.trim())
            })
            dataJson.location = location;

            /////////////////////
            product.querySelectorAll(".box-summary.link-list").forEach((be) => {
              infor = (be.innerText.trim());
            })

            infor = infor.split('\n')       

            let titleInfor = []
            let detailInfor = []

            for(let i = 0 ; i < infor.length ; i++)
            {
              if (i % 2 == 0)
              {
                titleInfor.push(infor[i])
              }

              else
              {
                detailInfor.push(infor[i])
              }
            }

            for(let i = 0 ; i < titleInfor.length ; i++)
            {
              let title = titleInfor[i]
              let detail = detailInfor[i]
              work_infor.push({
                title, detail
              })
            }


            product.querySelectorAll('div.jobdetail_recommend').forEach((be) => {
              const name = be.querySelector('.sc-gZMcBi > a').innerText.trim()
              const img = be.querySelector('.sc-gzVnrw > img').src
              const company = be.querySelector('.sc-gqjmRU > a').innerText.trim()
              const salary = be.querySelector('.sc-VigVT').innerText.trim()
              const position = be.querySelector('.sc-gqjmRU').innerText.trim()

              jobrecoment.push({name, img, company, salary, position})
            })

            product.querySelectorAll('div.sc-kasBVs.juNozh').forEach((be) => {
              const img = be.querySelector('img').src
              const title = be.querySelector('.sc-eInJlc.ekPvzl').innerText.trim()
              const des = be.querySelector('.sc-gtfDJT.gTjKCe').innerText.trim()

              cheat.push({img, title, des})
            })
          
            dataJson.cheat = cheat;
            dataJson.jobrecoment = jobrecoment;
            company.extra = product.querySelector('.company-info p').innerText.trim();
            company.work_infor = work_infor

          } catch (err) {
            console.log(err);
          }
          products.push({
            infor: dataJson, company : company
          });
  
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

app.get('/newspaper', async (req, res) => {
  const electronicUrl = 'https://www.vietnamworks.com/';
  try {
    const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
    const page = await browser.newPage();
    await page.goto(electronicUrl);

    let electronicData = await page.evaluate(() => {
      let products = [];
      let product_wrapper = document.querySelectorAll('div.sc-803c3194-16.kMKvtM');
      product_wrapper.forEach((product) => {
        let dataJson = {};
        try {
          dataJson.img =  product.querySelector('img').src;
          dataJson.title = product.querySelector('.sc-803c3194-15.clknNh').innerText;
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


app.get('/extraidea', async (req, res) => {
  // const requestedPage = Number(req.query.page);
  const requestedPage = 1

  const userAgent =
    'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36';

  try {
    const browser = await puppeteer.launch({
      executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
      headless: true,
    });
    const page = await browser.newPage();
    await page.setUserAgent(userAgent);

    const electronicData = [];

    await page.goto('https://www.vietnamworks.com/viec-lam-goi-y');
    await page.waitForSelector('.pagination__item-link');

    const pageLinks = await page.$$eval('.pagination__item-link', (links) =>
      links.map((link) => link.textContent.trim())
    );

    let number = []

    for(let i = 0 ; i < pageLinks.length ; i++) {
      if (!isNaN(pageLinks[i])) {
        number.push(pageLinks[i])
      }
    }

    const totalPages = number.length;

    if (requestedPage < 1 || requestedPage > totalPages) {
      await browser.close();
      return res.status(400).send('Invalid page number');
    }

    let currentPage = requestedPage - 1;

    while (true) {
      const electronicUrl = `https://www.vietnamworks.com/viec-lam-tot-nhat?page=${currentPage}`;
      await page.goto(electronicUrl);
      await page.waitForSelector('.job', {timeout: 100000});

      const newData = await page.evaluate(() => {
        let products = [];
        let product_wrapper = document.querySelectorAll('.sc-aead75fd-0.fdwkBs');

        product_wrapper.forEach((product) => {
          let dataJson = {};
          try {

            const img  = product.querySelector('.image > span > img').src
            ? product.querySelector('.image > span > img').src
            : null;

            if (!img.includes('data:image/'))
            {
              dataJson.img = product.querySelector('.image > span > img').src
              ? product.querySelector('.image > span > img').src
              : null;
            }
            dataJson.title = product.querySelector('.job__info-subTitle').innerText;
            dataJson.salary = product.querySelector('.salary').innerText;
            dataJson.position = product.querySelector('.job__info-text').innerText;
            dataJson.infor = product.querySelector('.job__info-text > span').innerText;
            dataJson.check = product.querySelector('.job__info > a').innerText;
            let link = product.querySelector('.job__info-title').href;
            linkProduct = link.split('https://www.vietnamworks.com/')[1];
            dataJson.link = 'http://localhost:3000/extra/' + linkProduct;
          } catch (err) {
            console.log(err);
          }
 
          products.push(dataJson);
        });
        return products;
      });

      electronicData.push(...newData);
      console.log(newData);

      if (currentPage === requestedPage - 1) {
        currentPage++;
        continue;
      }

      const nextPageButton = await page.$('.pagination__item-link');

      if (!nextPageButton) break;

      await Promise.all([
        page.waitForNavigation({ timeout: 1000000, waitUntil: 'networkidle2' }),
        nextPageButton.click(),
      ]);

      currentPage++;

    }

    await browser.close();

    // res.json(electronicData);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// detail newpaper

app.get('/url_detail_newpaper', async (req, res) => {
  const electronicUrl = 'https://www.vietnamworks.com/';
  try {
    const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
    const page = await browser.newPage();
    
    await page.goto(electronicUrl);
    

    let electronicData = await page.evaluate(() => {
      let products = [];
      let product_wrapper = document.querySelectorAll('.sc-fvyVFy > a');
      product_wrapper.forEach((product) => {
        let dataJson = {};
        try {
          dataJson.url = product.href;
        } catch (err) {
          console.log(err);
        }

        products.push(dataJson);

      });
      return products;
    });

    await browser.close();

    
    fs.writeFile('url_newpapre.json', JSON.stringify(electronicData), (err) => {
      if (err) throw err;
      console.log('Save success');
    });
    
    res.json(electronicData); 
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/full_url', async (req, res) => {
  const electronicUrl = 'https://www.vietnamworks.com/viec-lam-tot-nhat';
  try {
    const browser = await puppeteer.launch({ ignoreHTTPSErrors: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
    const page = await browser.newPage();
    let hrefsHotJob = []
    let dataDetailJob = []

    
    await page.goto(electronicUrl);

    getLink = async () => {

      let currentPage = 1;
      let totalHref = []
      while(true)
      {

        try {
          await page.goto(`https://www.vietnamworks.com/viec-lam-tot-nhat?page=${currentPage-1}`, { waitUntil: 'networkidle2' });
          await page.waitForSelector('.job__info > a')

          let hrefs = await page.$$eval('.job__info > a', as => as.map(a => a.href));

          totalHref.push(hrefs);

          const nextPageButton = await page.$$eval('.pagination__item-link',  a => a.map(a => a.innerText));
  
          if (nextPageButton.indexOf(">") < 0) break;
  
          currentPage = currentPage + 1;
      
        
        } catch (error) {
          console.log(error);
        }
      }

      return totalHref
    }

    let hrefs = await getLink()

    hrefs = [].concat(...hrefs);

    for(let i = 0 ; i < hrefs.length ; i++)
    {
      if(hrefs[i].includes("jv")){
        hrefsHotJob.push(hrefs[i])
      }
    }

    for(let i = 0 ; i < hrefsHotJob.length ; i++) {

      let newPage = await browser.newPage();
      await newPage.goto(`${hrefsHotJob[i]}`, { waitUntil: 'networkidle2' });
   
      const title =  await newPage.$eval('.job-title', as => as.innerText.trim());
      const name =  await newPage.$eval('.name', as => as.innerText);
      const company_location = await newPage.$eval('.company-location', as => as.innerText);
      const salary = await newPage.$eval('.salary > strong', as => as.innerText);
      // const img = await newPage.$eval('.track-event > img', as => as.src);
      const benifit = await newPage.$$eval('.benefit-name', as => as.map(a => a.innerText));
      const description = await newPage.$$eval('.description',as => as.map(a => a.innerText));
      const requirements = await newPage.$$eval('.requirements', as => as.map(a => a.innerText));
      const locaition = await newPage.$$eval('.location-name', as => as.map(a => a.innerText));
      const keys = await newPage.$$eval('span.job-tags__tag-name ', as => as.map(a => a.innerText));


      dataDetailJob.push({
        title,name, salary, benifit, description, requirements, company_location, locaition, keys
      })

      console.log(dataDetailJob);

      // await newPage.close();
      
    }

    
    fs.writeFile('detail_company.json', JSON.stringify(dataDetailJob), (err) => {
      if (err) throw err;
      console.log('Save success');
    });

    await page.close();
	  await browser.close()


  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
