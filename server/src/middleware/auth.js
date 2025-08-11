const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        error: true,
        message: "Authentication required",
        code: "AUTH_REQUIRED",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user.id).select("-password");

    if (!user) {
      return res.status(401).json({
        error: true,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

const adminMiddleware = async (req, res, next) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({
        error: true,
        message: "Admin access required",
        code: "ADMIN_REQUIRED",
      });
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { authMiddleware, adminMiddleware };
