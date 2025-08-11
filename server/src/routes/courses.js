const express = require("express");
const router = express.Router();
const { authMiddleware, adminMiddleware } = require("../middleware/auth");
const courseController = require("../controllers/courseController");

// Public routes
router.get("/", courseController.getAllCourses);
router.get("/:id", courseController.getCourseById);

// Comments
router.get("/:id/comments", courseController.getCourseComments);
router.post("/:id/comments", authMiddleware, courseController.addCourseComment);
router.delete(
  "/:id/comments/:commentId",
  authMiddleware,
  courseController.deleteCourseComment
);

// Admin only routes
router.post(
  "/",
  [authMiddleware, adminMiddleware],
  courseController.createCourse
);
router.put(
  "/:id",
  [authMiddleware, adminMiddleware],
  courseController.updateCourse
);
router.delete(
  "/:id",
  [authMiddleware, adminMiddleware],
  courseController.deleteCourse
);

// Video management (admin only)
router.post(
  "/:id/videos",
  [authMiddleware, adminMiddleware],
  courseController.addVideo
);
router.put(
  "/:courseId/videos/:videoId",
  [authMiddleware, adminMiddleware],
  courseController.updateVideo
);
router.delete(
  "/:courseId/videos/:videoId",
  [authMiddleware, adminMiddleware],
  courseController.removeVideo
);

module.exports = router;
