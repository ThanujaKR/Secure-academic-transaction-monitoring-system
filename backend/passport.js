const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
require("dotenv").config();
const studentDetails = require("./models/details/student-details.model");
const facultyDetails = require("./models/details/faculty-details.model");
const adminDetails = require("./models/details/admin-details.model");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const userType = req.query.state;

        let user = null;
        if (userType === "student") {
          user = await studentDetails.findOne({ email });
        } else if (userType === "faculty") {
          user = await facultyDetails.findOne({ email });
        } else if (userType === "admin") {
          user = await adminDetails.findOne({ email });
        }

        if (!user) {
          return done(null, false, {
            message: `No ${userType} account found with this Google email.`,
          });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });

        // Save as active token to invalidate any previous session
        await user.constructor.findByIdAndUpdate(user._id, { activeToken: token });

        return done(null, { token, userType });
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

module.exports = passport;
