const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("./passport");
const authRoute = require("./routes/auth.route");

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_API_LINK, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: process.env.JWT_SECRET, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Auth routes (Google OAuth)
app.use("/api/auth", authRoute);

// Error handling middleware
module.exports = app;
