const axios = require('axios');
const fs = require('fs');
const path = require('path');

function downloadImage(url, folder) {
  const currentDirectory = __dirname;

  const downloadFolder = path.join(currentDirectory, folder);

  if (!fs.existsSync(downloadFolder)) {
    fs.mkdirSync(downloadFolder, { recursive: true });
  }

  const extension = path.extname(url).split('?')[0];
  const filename = `image${Date.now()}` + '.png';
  const filePath = path.join(downloadFolder, filename);

  axios({
    method: 'get',
    url: url,
    responseType: 'stream'
  }).then(function (response) {
    const writeStream = fs.createWriteStream(filePath);
    writeStream.on('error', function (error) {
      console.error('Lỗi khi ghi ảnh vào thư mục:', error);
    });
    response.data.pipe(writeStream);

    writeStream.on('finish', function () {
      console.log('Ảnh đã được tải xuống và lưu vào thư mục:', downloadFolder);
    });
  }).catch(function (error) {
    console.error('Lỗi khi tải xuống ảnh:', error);
  });
}

const imageUrl = 'https://www.google.com/url?sa=i&url=https%3A%2F%2Flifestyle.zingnews.vn%2F10-buc-anh-dep-nhat-giai-nhiep-anh-thien-van-cua-nam-post1237834.html&psig=AOvVaw0694E9RttgUnbFxtWS0rH6&ust=1687418314650000&source=images&cd=vfe&ved=0CBEQjRxqFwoTCJDAnqHp0_8CFQAAAAAdAAAAABAD';
const downloadFolder = 'images';
downloadImage(imageUrl, downloadFolder);
