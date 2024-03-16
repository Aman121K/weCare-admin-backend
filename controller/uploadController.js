const AWS = require('aws-sdk');
const Image = require('../model/Image.js');

const s3 = new AWS.S3({
  accessKeyId: 'AKIAQBTFHEDHQ5QGDCOH',
  secretAccessKey: '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',
});

const uploadImage = async (req, res) => {
  try {
    const promises = req.files.map(async (file) => {
      // Validate the file mimetype before uploading
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.mimetype)) {
        throw new Error('Unsupported file type');
      }

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
        // Add other fields as needed (e.g., user ID, timestamps)
      });
      await image.save();
    });
    
    await Promise.all(promises);
    
    res.status(200).send('Images uploaded successfully');
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).send('Error uploading images: ' + error.message);
  }
};

module.exports = { uploadImage };
