const cors = require('cors')
const express = require('express')
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const axios = require('axios')
const cheerio = require('cheerio')


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

const url = 'https://muachung365.vn/?utm_campaign=18036050079&gad=1'



app.get("/v1", async (req, resp) => {
  const thumbnails = [];
  const limit = Number(req.query.limit);
  try {
    axios(url)
      .then((res) => {
        const html = res.data;
        const $ = cheerio.load(html);

        $('.product', html).each(function(){
          const title = $(this).find("a").attr("title")
          const image = $(this).find("a > img").attr("src")
          const priceCurrent = $(this).find(".price > ins ").text().trim()
          const priceSale = $(this).find(".price > del ").text().trim()
          const detail = $(this).find("a").attr("href")

          thumbnails.push({
            title,
            image,
            priceCurrent,
            priceSale,
            detail
          })
        });

        if (limit && limit > 0)
        {

          resp.status(200).json(thumbnails.slice(0,limit));
        }

        resp.status(200).json(thumbnails);

      })
      .catch((error) => {
        console.log(error);
        resp.status(500).json(error);
      });
  } catch (error) {
    console.log(error);
    resp.status(500).json(error);
  }
});



app.listen(8000, () => {
    console.log('Server is running...');
})