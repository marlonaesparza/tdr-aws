const AWS = require('aws-sdk');
const helpers = require('./utils/helpers.js')
const card_images = require('../mysql/utils/card_images.js');
const config = require('./config.json');

AWS.config.loadFromPath('./config.json');
const S3 = new AWS.S3();

(async function () {
  try {
    let bucketData = await S3.listObjectsV2({
      Bucket: config.bucket
    }).promise();

    let cachedFolders = await helpers.cacheFolderNames(bucketData.Contents);

    for (let folder in cachedFolders) {
      let folderData = await S3.listObjectsV2({
        Bucket: config.bucket,
        Prefix: cachedFolders[folder] + ''
      }).promise();

      let title = await helpers.getProductTitle(folderData.Prefix);
      let price = await helpers.generateProductPrice();
      let colors = await helpers.generateProductColors();
      let urls = await helpers.getImageUrls(folderData.Contents);

      let entry = {title, price, colors, urls};

      try {
        await card_images.insert(entry);
      } catch (error) {
        console.log('Error entering entries into MySQL datbase:', error);
      }
    }

  } catch (error) {
    console.log(error.stack);
  }
})();
