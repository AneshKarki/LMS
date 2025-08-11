const express = require("express");
const router = express.Router();
const { authMiddleware, adminMiddleware } = require("../middleware/auth");
const quizController = require("../controllers/quizController");

// Get all quizzes (admin only optional)
router.get("/", authMiddleware, quizController.getAllQuizzes);

// Get quiz by ID
router.get("/:id", authMiddleware, quizController.getQuizById);

// Get quiz by video id
router.get("/video/:videoId", authMiddleware, quizController.getQuizByVideo);

// Create new quiz (admin only)
router.post("/", [authMiddleware, adminMiddleware], quizController.createQuiz);

// Update quiz (admin only)
router.put(
  "/:id",
  [authMiddleware, adminMiddleware],
  quizController.updateQuiz
);

// Delete quiz (admin only)
router.delete(
  "/:id",
  [authMiddleware, adminMiddleware],
  quizController.deleteQuiz
);

// Submit quiz attempt (students)
router.post("/:id/submit", authMiddleware, quizController.submitQuiz);

module.exports = router;
