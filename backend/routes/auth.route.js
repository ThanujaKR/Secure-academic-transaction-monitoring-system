const express = require("express");
const passport = require("../passport");
const router = express.Router();

// Initiate Google OAuth — userType passed as state param
router.get("/google", (req, res, next) => {
  const { userType } = req.query;
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: userType,
  })(req, res, next);
});

// Google OAuth callback
router.get("/google/callback", (req, res, next) => {
  const userType = req.query.state;
  passport.authenticate("google", { session: false }, (err, user, info) => {
    if (err || !user) {
      const message = info?.message || "Google login failed";
      return res.redirect(
        `${process.env.FRONTEND_API_LINK}/login?error=${encodeURIComponent(message)}`
      );
    }
    res.redirect(
      `${process.env.FRONTEND_API_LINK}/auth/callback?token=${user.token}&userType=${userType}`
    );
  })(req, res, next);
});

module.exports = router;
