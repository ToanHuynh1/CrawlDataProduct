const cors = require('cors')
const express = require('express')
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs')


const app = express()
app.use(bodyParser.json({ limit: "50mb" }));

app.use(cors())
dotenv.config();

app.use(
    bodyParser.urlencoded({
      limit: "50mb",
      extended: true,
      parameterLimit: 50000,
    })
);

const url = 'https://www.vietnamworks.com/?utm_source=google&utm_medium=ppc&utm_campaign=google_ppc_inhouse_05-SEM-all-brand-01_adg001_ad001&gclid=Cj0KCQjw1rqkBhCTARIsAAHz7K36qRaU1UCu6vQNsUPSnKGpZtGFTpak6KjiGQG3ETHSNb2-LJsu0G8aAvveEALw_wcB'
const urljob = 'https://www.vietnamworks.com/viec-lam-tot-nhat'
const urljobidea = 'https://www.vietnamworks.com/viec-lam-tot-nhat?page=1'

app.get("/v1/topcompany", async (req, resp) => {
  let dataTopCompany = []
  const limit = Number(req.query.limit);
  try {
    axios(url)
      .then((res) => {
        const html = res.data;
        const $ = cheerio.load(html);

        $('div.companyBlock.view_job_item.top_company').each(function(i,e){
          const img = $(this).find('div.companyBlock__box > img').attr('src')
          const name = $(this).find('.companyBlock__name').text().trim()

          dataTopCompany.push({img,name})
        })

        if (dataTopCompany.length > 0)
        {
          if (limit && limit > 0)
          {
            dataTopCompany = dataTopCompany.splice(0,limit)
            resp.status(200).json({
              error: 0,
              dataTopCompany
            });
          }
  
          resp.status(200).json({
            error: 0,
            errMessage: 'success',
            dataTopCompany
          });
        }

      })
      .catch((error) => {
        console.log(error);
        resp.status(500).json({
          error: 1,
          errMessage: "Error"
        });
      });
  } catch (error) {
    console.log(error);
    resp.status(500).json({
      error: 1,
      errMessage: "Error"
    });
  }
});


app.get("/v1/goodjob", async (req, resp) => {
  let dataGoodJob = []

  const limit = Number(req.query.limit);
  try {
    axios.get(urljobidea)
      .then((res) => {
        const html = res.data;
        const $ = cheerio.load(html);

        $('div.view_job_item', html).each(function(i,e){
          console.log(i);
        })

        if (limit && limit > 0)
        {
            dataGoodJob = dataGoodJob.splice(0,limit)
            resp.status(200).json({
              error: 0,
              dataGoodJob
            });
        }

        resp.status(200).json({
          error: 0,
          errMessage: 'success',
          dataGoodJob
        });


      })
      .catch((error) => {
        console.log(error);
        resp.status(500).json({
          error: 1,
          errMessage: "Error"
        });
      });
  } catch (error) {
    console.log(error);
    resp.status(500).json({
      error: 1,
      errMessage: "Error"
    });
  }
});


app.listen(8000, () => {
    console.log('Server is running...');
})