
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: 'rzp_test_uO5CW1cDit9nww',
  key_secret: '5eQ1T4XLhk1VrRAHinsUdpDw',
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
