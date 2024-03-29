const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
//const config = require('./config/config');
const cors = require("cors");
const crypto = require("crypto");
const path = require("path");
// const redis = require('redis');
const app = express();

// // Redis
// const REDIS_PORT = process.env.PORT || 6379;
// const client = redis.createClient(6379);

// Middleware for parsing the request body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//CORS HEADERS
// app.use(cors());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});

// MULTER CONFIGURATION
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, crypto.randomBytes(12).toString("hex") + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// For static data
app.use(express.static(path.join(__dirname, "images")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

// ROUTING REQUESTS
const authRoute = require("./routes/Auth");
const userRoute = require("./routes/User");
const productRoute = require("./routes/Products");
app.use(authRoute, userRoute, productRoute);

//Handling Errors
app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const data = error.data;
  const message = error.message;

  res.status(status).json({
    message: message,
    data: data,
  });
});

//Connection to Mongo-database
const MONGO_URI = `mongodb://localhost:27017/SellnBuy`;
mongoose
  .connect(MONGO_URI, { useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => {
    app.listen(8080);
    console.log("Server Running!!!");
  })
  .catch((err) => {
    console.log(err);
  });
