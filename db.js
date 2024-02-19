const mongoose = require("mongoose");
require("dotenv").config();
const DB_URL = process.env.CONN_URL;

const connectDB = async () => {
    try {
        await mongoose.connect(DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1); // Exit process with failure
    }
}

module.exports = connectDB;
