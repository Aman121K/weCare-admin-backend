
const Contact = require('../models/contact');

exports.postContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    // Save data to database using the Contact model
    const contact = new Contact({ name, email, message });
    await contact.save();
    res.status(201).json({ message: 'Contact form data stored successfully' });
  } catch (error) {
    console.error('Error storing contact form data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
