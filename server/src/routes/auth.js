const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const authController = require("../controllers/authController");

// Register new user
router.post("/register", authController.register);

// Login user
router.post("/login", authController.login);

// Get current user
router.get("/me", authMiddleware, authController.getMe);

module.exports = router;
