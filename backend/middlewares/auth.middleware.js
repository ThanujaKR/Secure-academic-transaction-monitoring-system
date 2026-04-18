const jwt = require("jsonwebtoken");
const ApiResponse = require("../utils/ApiResponse");
const studentDetails = require("../models/details/student-details.model");
const facultyDetails = require("../models/details/faculty-details.model");
const adminDetails = require("../models/details/admin-details.model");

const auth = async (req, res, next) => {
  try {
    let token = req.header("Authorization");

    if (!token || !token.startsWith("Bearer ")) {
      return ApiResponse.unauthorized("Authentication token required").send(res);
    }

    token = token.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded.userId) {
        return ApiResponse.unauthorized("Invalid token format").send(res);
      }
    } catch (jwtError) {
      return ApiResponse.unauthorized("Invalid or expired token").send(res);
    }

    // Check token matches the active session in DB
    const userId = decoded.userId;
    let user =
      (await studentDetails.findById(userId).select("activeToken").lean()) ||
      (await facultyDetails.findById(userId).select("activeToken").lean()) ||
      (await adminDetails.findById(userId).select("activeToken").lean());

    if (!user) {
      return ApiResponse.unauthorized("User not found").send(res);
    }

    if (user.activeToken && user.activeToken !== token) {
      return ApiResponse.unauthorized(
        "Session invalidated. Please log in again."
      ).send(res);
    }

    req.userId = userId;
    req.token = token;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return ApiResponse.unauthorized("Authentication failed").send(res);
  }
};

module.exports = auth;
