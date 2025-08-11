const Course = require("../models/Course");

/**
 * Validate course input
 */
function validateCourseInput(body) {
  const errors = [];
  const { title, description, category, thumbnail } = body;

  if (!title || title.trim().length === 0) {
    errors.push("Title is required");
  }

  if (!description || description.trim().length === 0) {
    errors.push("Description is required");
  }

  if (!category || category.trim().length === 0) {
    errors.push("Category is required");
  }

  if (!thumbnail || thumbnail.trim().length === 0) {
    errors.push("Thumbnail URL is required");
  }

  return errors;
}

/**
 * Validate video input
 */
function validateVideoInput(body) {
  const errors = [];
  const { title, videoUrl, duration, order } = body;

  if (!title || title.trim().length === 0) {
    errors.push("Title is required");
  }

  // Enhanced YouTube URL validation
  if (!videoUrl || !isValidVideoUrl(videoUrl)) {
    errors.push("Valid video URL is required (YouTube URLs supported)");
  }

  if (!duration || isNaN(duration) || duration <= 0) {
    errors.push("Valid duration is required");
  }

  if (!order || isNaN(order)) {
    errors.push("Valid order number is required");
  }

  return errors;
}

/**
 * Validate video URL (supports YouTube and other video formats)
 */
function isValidVideoUrl(url) {
  if (!url || typeof url !== "string") return false;

  // YouTube URL patterns
  const youtubePatterns = [
    /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^(https?:\/\/)?(www\.)?(youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];

  // Check if it's a valid YouTube URL
  for (const pattern of youtubePatterns) {
    if (pattern.test(url)) {
      return true;
    }
  }

  // You can add more video platform patterns here
  // For now, we'll also accept URLs that look like video files
  const videoFilePattern = /\.(mp4|webm|ogg|mov|avi|mkv)$/i;
  if (videoFilePattern.test(url)) {
    return true;
  }

  return false;
}

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const { q } = req.query;
    let query = {};

    if (q) {
      query.$text = { $search: q };
    }

    const courses = await Course.find(query)
      .sort({ createdAt: -1 })
      .select("-__v");

    res.json(courses);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      error: true,
      message: "Server Error",
      code: "SERVER_ERROR",
    });
  }
};

// Get single course by ID
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).select("-__v");

    if (!course) {
      return res.status(404).json({
        error: true,
        message: "Course not found",
        code: "COURSE_NOT_FOUND",
      });
    }

    res.json(course);
  } catch (error) {
    console.error(error.message);
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        error: true,
        message: "Course not found",
        code: "COURSE_NOT_FOUND",
      });
    }
    res.status(500).json({
      error: true,
      message: "Server Error",
      code: "SERVER_ERROR",
    });
  }
};

// Create new course (admin only)
exports.createCourse = async (req, res) => {
  try {
    const errors = validateCourseInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        error: true,
        message: errors[0],
        code: "VALIDATION_ERROR",
        errors,
      });
    }

    // Validate videos if they exist
    if (req.body.videos && req.body.videos.length > 0) {
      for (let i = 0; i < req.body.videos.length; i++) {
        const video = req.body.videos[i];
        const videoErrors = validateVideoInput(video);
        if (videoErrors.length > 0) {
          return res.status(400).json({
            error: true,
            message: `Video ${i + 1}: ${videoErrors[0]}`,
            code: "VIDEO_VALIDATION_ERROR",
            errors: videoErrors,
          });
        }
      }
    }

    const newCourse = new Course({
      ...req.body,
    });

    const course = await newCourse.save();
    res.status(201).json(course);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      error: true,
      message: "Server Error",
      code: "SERVER_ERROR",
    });
  }
};

// Update course (admin only)
exports.updateCourse = async (req, res) => {
  try {
    const errors = validateCourseInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        error: true,
        message: errors[0],
        code: "VALIDATION_ERROR",
        errors,
      });
    }

    // Validate videos if they exist
    if (req.body.videos && req.body.videos.length > 0) {
      for (let i = 0; i < req.body.videos.length; i++) {
        const video = req.body.videos[i];
        const videoErrors = validateVideoInput(video);
        if (videoErrors.length > 0) {
          return res.status(400).json({
            error: true,
            message: `Video ${i + 1}: ${videoErrors[0]}`,
            code: "VIDEO_VALIDATION_ERROR",
            errors: videoErrors,
          });
        }
      }
    }

    let course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        error: true,
        message: "Course not found",
        code: "COURSE_NOT_FOUND",
      });
    }

    course = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(course);
  } catch (error) {
    console.error(error.message);
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        error: true,
        message: "Course not found",
        code: "COURSE_NOT_FOUND",
      });
    }
    res.status(500).json({
      error: true,
      message: "Server Error",
      code: "SERVER_ERROR",
    });
  }
};

// Delete course (admin only)
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        error: true,
        message: "Course not found",
        code: "COURSE_NOT_FOUND",
      });
    }

    await course.remove();
    res.json({
      message: "Course removed successfully",
      code: "COURSE_DELETED",
    });
  } catch (error) {
    console.error(error.message);
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        error: true,
        message: "Course not found",
        code: "COURSE_NOT_FOUND",
      });
    }
    res.status(500).json({
      error: true,
      message: "Server Error",
      code: "SERVER_ERROR",
    });
  }
};

// Add video to course (admin only)
exports.addVideo = async (req, res) => {
  try {
    const errors = validateVideoInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        error: true,
        message: errors[0],
        code: "VALIDATION_ERROR",
        errors,
      });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        error: true,
        message: "Course not found",
        code: "COURSE_NOT_FOUND",
      });
    }

    course.videos.push(req.body);
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    console.error(error.message);
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        error: true,
        message: "Course not found",
        code: "COURSE_NOT_FOUND",
      });
    }
    res.status(500).json({
      error: true,
      message: "Server Error",
      code: "SERVER_ERROR",
    });
  }
};

// Update video in course (admin only)
exports.updateVideo = async (req, res) => {
  try {
    const errors = validateVideoInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        error: true,
        message: errors[0],
        code: "VALIDATION_ERROR",
        errors,
      });
    }

    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({
        error: true,
        message: "Course not found",
        code: "COURSE_NOT_FOUND",
      });
    }

    const video = course.videos.id(req.params.videoId);
    if (!video) {
      return res.status(404).json({
        error: true,
        message: "Video not found",
        code: "VIDEO_NOT_FOUND",
      });
    }

    Object.assign(video, req.body);
    await course.save();
    res.json(course);
  } catch (error) {
    console.error(error.message);
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        error: true,
        message: "Course not found",
        code: "COURSE_NOT_FOUND",
      });
    }
    res.status(500).json({
      error: true,
      message: "Server Error",
      code: "SERVER_ERROR",
    });
  }
};

// Remove video from course (admin only)
exports.removeVideo = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({
        error: true,
        message: "Course not found",
        code: "COURSE_NOT_FOUND",
      });
    }

    const video = course.videos.id(req.params.videoId);
    if (!video) {
      return res.status(404).json({
        error: true,
        message: "Video not found",
        code: "VIDEO_NOT_FOUND",
      });
    }

    video.remove();
    await course.save();
    res.json({
      message: "Video removed successfully",
      code: "VIDEO_DELETED",
      course,
    });
  } catch (error) {
    console.error(error.message);
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        error: true,
        message: "Course not found",
        code: "COURSE_NOT_FOUND",
      });
    }
    res.status(500).json({
      error: true,
      message: "Server Error",
      code: "SERVER_ERROR",
    });
  }
};

// Get course comments
exports.getCourseComments = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .select("comments")
      .populate("comments.user", "name email");
    if (!course) {
      return res.status(404).json({
        error: true,
        message: "Course not found",
        code: "COURSE_NOT_FOUND",
      });
    }
    res.json(course.comments || []);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      error: true,
      message: "Server Error",
      code: "SERVER_ERROR",
    });
  }
};

// Add a comment to a course
exports.addCourseComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        error: true,
        message: "Comment text is required",
        code: "VALIDATION_ERROR",
      });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        error: true,
        message: "Course not found",
        code: "COURSE_NOT_FOUND",
      });
    }

    course.comments.push({ user: req.user.id, text: text.trim() });
    await course.save();

    const populated = await Course.findById(req.params.id)
      .select("comments")
      .populate("comments.user", "name email");

    res.status(201).json(populated.comments);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      error: true,
      message: "Server Error",
      code: "SERVER_ERROR",
    });
  }
};

// Delete a comment (owner or admin)
exports.deleteCourseComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        error: true,
        message: "Course not found",
        code: "COURSE_NOT_FOUND",
      });
    }

    const comment = course.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        error: true,
        message: "Comment not found",
        code: "COMMENT_NOT_FOUND",
      });
    }

    // Only the comment owner or an admin can delete
    const isOwner = comment.user.toString() === req.user.id;
    if (!isOwner && !req.user.isAdmin) {
      return res.status(403).json({
        error: true,
        message: "Not authorized to delete this comment",
        code: "NOT_AUTHORIZED",
      });
    }

    comment.remove();
    await course.save();

    res.json({ message: "Comment deleted" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      error: true,
      message: "Server Error",
      code: "SERVER_ERROR",
    });
  }
};
