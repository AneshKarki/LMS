const express = require("express");
const router = express.Router();
const { authMiddleware, adminMiddleware } = require("../middleware/auth");
const userController = require("../controllers/userController");

// User profile routes
router.get("/me/progress", authMiddleware, userController.getUserProgress);
router.post(
  "/progress/:courseId/:videoId",
  authMiddleware,
  userController.updateVideoProgress
);
router.get("/me", authMiddleware, userController.getProfile);
router.put("/me", authMiddleware, userController.updateProfile);

// Admin routes
router.get("/", [authMiddleware, adminMiddleware], userController.getAllUsers);
router.get(
  "/analytics",
  [authMiddleware, adminMiddleware],
  userController.getAnalytics
);

module.exports = router;
