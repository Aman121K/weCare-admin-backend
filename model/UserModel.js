const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: String,
    password: String,
    type: String,
    mobile_no: Number,
    address: String,
    user_img: String,
    Gst: String,
    Pan: String,
    Aadhar: String,
    Farm_no: String,
    Owner_name: String,
    Account_no: String,
    added_date: { type: Date, default: Date.now },
})
module.exports = mongoose.model("User", UserSchema)