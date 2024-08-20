/**
 * Initializes and configures the Express application server.
 * Connects to the MongoDB database using the provided MONGO_URL.
 */
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const logger = require("./utils/loggerUtils");
const rateLimit = require('express-rate-limit');

const { MONGO_URL, CLIENT_URL, port, DEV_CLIENT_URL } = require("./config");

mongoose.connect(MONGO_URL);

 const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());

const allowedOrigins = [CLIENT_URL, DEV_CLIENT_URL];

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, 
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true, 
  legacyHeaders: false, 
});

app.use(cors({
  credentials: true,
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(limiter);

/**
 * Handles root endpoint request and sends a response with "Stack_db Endpoint".
 */
app.get("/", (_, res) => {
  res.status(200).json("Stack_db Endpoint");
  res.end();
});


// Importing controllers for routing
const questionController = require("./controller/questionController");
const tagController = require("./controller/tagController");
const answerController = require("./controller/answerController");
const userController = require("./controller/userController");
const authController = require("./controller/authController");
const commentController = require("./controller/commentController");

// Routing endpoints to respective controllers
app.use("/question", questionController);
app.use("/tag", tagController);
app.use("/answer", answerController);
app.use("/user", userController);
app.use("/auth", authController);
app.use("/comment", commentController);

/**
 * Error handling middleware for handling internal server errors.
 * Logs the error using the logger utility and sends a 500 response with "Internal server error".
 */
app.use((err, req, res, next) => {
  logger.error(`[${req.method}] ${req.url} ${err.message}`);
  res.status(500).json({ error: "Internal server error" });
});

/**
 * Starts the server on the specified port and logs the server start message.
 */
let server = app.listen(port, () => {
  console.log(`Server starts at http://localhost:${port}`);
});

/**
 * Handles SIGINT signal (Ctrl+C) to gracefully shut down the server and disconnect from the MongoDB database.
 * Closes the server and disconnects the MongoDB instance, then logs a shutdown message.
 */
process.on("SIGINT", () => {
  server.close();
  mongoose.disconnect();
  console.log("Server closed. Database instance disconnected");
  process.exit(0);
});

module.exports = server

