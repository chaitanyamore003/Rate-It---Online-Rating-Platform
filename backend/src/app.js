const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const authRouter = require("./routes/auth.routes");
const dotenv = require("dotenv");
// Load environment variables from .env file
dotenv.config();

//creating a express application
const app = express();
app.use(morgan("combined"));

//adding cors and json middleware to the application
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
  }),
);
app.use(express.json());

//adding routes to the application
app.use("/api/auth", authRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

module.exports = app;
