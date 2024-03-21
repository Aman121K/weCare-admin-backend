const mongoose = require("mongoose");

const LeadsSchema = new mongoose.Schema({
    agent_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },//Agent Id
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