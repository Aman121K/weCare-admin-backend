
const AWS = require('aws-sdk');
const Image = require('../models/Image');

const s3 = new AWS.S3({
  accessKeyId: 'AKIAQBTFHEDHQ5QGDCOH',
  secretAccessKey: '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',
});

const uploadImage = async (req, res) => {
  try {
    const promises = req.files.map(async (file) => {
      const params = {
        Bucket: 'bucket-image-upld',
        Key: file.originalname,
        Body: file.buffer,
        ContentType: file.mimetype,
      };
      await s3.upload(params).promise();
      
      // Save image metadata to database
      const image = new Image({
        filename: file.originalname,
        contentType: file.mimetype,
        data: file.buffer,
      });
      await image.save();
    });
    
    await Promise.all(promises);
    
    res.status(200).send('Images uploaded successfully');
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).send('Error uploading images');
  }
};

module.exports = { uploadImage };
