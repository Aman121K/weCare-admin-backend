
const Contact = require('../model/contact');

exports.postContact = async (req, res) => {
  try {
    const response = req.body;
    await Contact.create(response);
    return res
    .status(200)
    .json({message: "message send successfully"});
} catch (error) {
    
    return res
    .status(400)
    .json({message: "message not deliverd"});
}
};

exports.getAllUsers = async (req, res, next) => {
  try {
      const users = await User.find();

      if (!users || users.length === 0) {
          return res.status(404).json({ message: "No Users found" });
      }

      return res.status(200).json(users);
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
  }
};
