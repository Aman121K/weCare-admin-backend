const mongoose = require("mongoose");

const LeadsSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    warranty_status: String,
    contact_name: String,
    phone_number: Number,
    email: String,
    device_brand: String,
    device_emi_number: String,
    device_images: [String],
    product_value: String,
    address: String,
    price: Number,
    added_date: { type: Date, default: Date.now },
})
module.exports = mongoose.model("Leads", LeadsSchema)