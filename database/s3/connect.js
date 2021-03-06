const AWS = require('aws-sdk');
const config = require('./config.json');
const helpers = require('./utils/helpers.js')
const card_images = require('../mysql/utils/card_images.js');
const display_images = require('../mysql/utils/display_images.js');
const related_images = require('../mysql/utils/related_images.js');

AWS.config.loadFromPath('./config.json');
const S3 = new AWS.S3();

(async function() {
  const titles = [];
  const prices = [];

  await (async function () {
    try {
      let cardBucketData = await S3.listObjectsV2({
        Bucket: config.cardBucket
      }).promise();

      let cachedFolders = await helpers.cacheFolderNames(cardBucketData.Contents);

      for (let folder in cachedFolders) {
        let folderData = await S3.listObjectsV2({
          Bucket: config.cardBucket,
          Prefix: cachedFolders[folder] + ''
        }).promise();

        let title = await helpers.getProductTitle(folderData.Prefix);
        titles.push(title);
        let price = await helpers.generateProductPrice();
        prices.push(price);
        let colors = await helpers.generateProductColors();
        let urls = await helpers.getImageUrls(folderData.Contents, 'card');

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

  await (async function () {
    try {
      let displayBucketData = await S3.listObjectsV2({
        Bucket: config.displayBucket
      }).promise();

      let cachedFolders = await helpers.cacheFolderNames(displayBucketData.Contents);

      for (let folder in cachedFolders) {
        let folderData = await S3.listObjectsV2({
          Bucket: config.displayBucket,
          Prefix: cachedFolders[folder] + ''
        }).promise();

        let urls = await helpers.getImageUrls(folderData.Contents, 'display');

        let entry = {urls};

        try {
          await display_images.insert(entry);
        } catch (error) {
          console.log('Error entering entries into MySQL datbase:', error);
        }
      }

    } catch (error) {
      console.log(error.stack);
    }
  })();

  await (async function () {
    try {
      let relatedBucketData = await S3.listObjectsV2({
        Bucket: config.relatedBucket
      }).promise();

      let urls = await helpers.getImageUrls(relatedBucketData.Contents, 'related');

      for (let i = 0; i < urls.length; i++) {
        let title = titles[i];
        let price = prices[i];
        let url = urls[i];

        let entry = {title, price, url};

        try {
          await related_images.insert(entry);
        } catch (error) {
          console.log('Error entering entries into MySQL datbase:', error);
        }
      }

    } catch (error) {
      console.log(error.stack);
    }
  })();
})();
