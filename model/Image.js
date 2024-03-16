const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
    unique: true,
  },
  contentType: {
    type: String,
    required: true,
  },
  data: Buffer, // Consider whether storing image data directly is necessary
}, { timestamps: true }); // Add timestamps for createdAt and updatedAt fields

// Add indexes for efficient querying if needed
imageSchema.index({ filename: 1 });
imageSchema.index({ contentType: 1 });

module.exports = mongoose.model('Image', imageSchema);
