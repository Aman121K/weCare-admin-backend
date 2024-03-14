
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: 'add key here',
  key_secret: 'add secret key here',
});

const createOrder = async (req, res) => {
  try {
    const { amount } = req.body; // Amount in paisa

    const options = {
      amount, // Amount in paisa
      currency: 'INR', // Currency code
      receipt: 'order_rcptid_11',
      payment_capture: '1', // Auto capture
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createOrder,
};
