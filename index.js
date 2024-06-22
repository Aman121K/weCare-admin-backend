const express = require("express");
const app = express();
const mongoose = require("mongoose");
const connectDB = require("./db");
const bodyParser = require("body-parser");
const routes = require("./routes/index");
const cors = require("cors");
const port = process.env.PORT || 3000;

app.use(cors({
    origin: "*",
}))
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", routes);
app.use(express.json());
// app.use('/contact', contactRouter);

connectDB();

app.listen(port,"0.0.0.0", () => {
    console.log(`connected to server on PORT ${PORT}`)
})