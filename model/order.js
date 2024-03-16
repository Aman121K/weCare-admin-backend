

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  amount: Number,
  currency: String,
  // Add other fields as needed
});

module.exports = mongoose.model('Order', orderSchema);
