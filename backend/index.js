const connectToMongo = require("./Database/db");
const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");
const passport = require("./passport");
require("dotenv").config();
connectToMongo();
const port = process.env.PORT || 4000;
var cors = require("cors");

app.use(
  cors({
    origin: process.env.FRONTEND_API_LINK,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: process.env.JWT_SECRET, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

const path = require("path");

// Serve frontend
app.use(express.static(path.join(__dirname, "build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.use("/media", express.static(path.join(__dirname, "media")));

app.use("/api/auth", require("./routes/auth.route"));
app.use("/api/admin", require("./routes/details/admin-details.route"));
app.use("/api/faculty", require("./routes/details/faculty-details.route"));
app.use("/api/student", require("./routes/details/student-details.route"));

app.use("/api/branch", require("./routes/branch.route"));
app.use("/api/subject", require("./routes/subject.route"));
app.use("/api/notice", require("./routes/notice.route"));
app.use("/api/timetable", require("./routes/timetable.route"));
app.use("/api/material", require("./routes/material.route"));
app.use("/api/exam", require("./routes/exam.route"));
app.use("/api/marks", require("./routes/marks.route"));

app.listen(port, () => {
  console.log(`Server Listening On http://localhost:${port}`);
});
