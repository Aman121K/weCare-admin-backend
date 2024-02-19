const express = require("express");
const app = express();
const mongoose = require("mongoose");
const connectDB = require("./db");
const bodyParser = require("body-parser");
const routes = require("./routes/index");
const cors = require("cors");
const PORT = 6000

app.use(cors({
    origin: "*",
}))
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", routes);

connectDB();

app.listen(PORT, () => {
    console.log(`connected to server on PORT ${PORT}`)
})