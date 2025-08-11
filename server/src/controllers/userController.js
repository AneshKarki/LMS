const User = require("../models/User");
const Course = require("../models/Course");

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      error: true,
      message: "Server Error",
      code: "SERVER_ERROR",
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userFields = {};
    if (name) userFields.name = name;
    if (email) userFields.email = email;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: userFields },
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      error: true,
      message: "Server Error",
      code: "SERVER_ERROR",
    });
  }
};

// Get user's course progress
exports.getUserProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("progress").populate({
      path: "progress.course",
      select: "title description",
    });

    res.json(user.progress);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      error: true,
      message: "Server Error",
      code: "SERVER_ERROR",
    });
  }
};

// Update video progress
exports.updateVideoProgress = async (req, res) => {
  try {
    const { courseId, videoId } = req.params;
    const { watchTime = 0, completed = false } = req.body || {};

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        error: true,
        message: "Course not found",
        code: "COURSE_NOT_FOUND",
      });
    }

    const video = course.videos.id(videoId);
    if (!video) {
      return res.status(404).json({
        error: true,
        message: "Video not found",
        code: "VIDEO_NOT_FOUND",
      });
    }

    const user = await User.findById(req.user.id);
    let courseProgress = user.progress.find(
      (p) => p.course.toString() === courseId
    );

    if (!courseProgress) {
      courseProgress = { course: courseId, completedVideos: [] };
      user.progress.push(courseProgress);
    }

    // Find existing progress entry for this video
    const existingIndex = courseProgress.completedVideos.findIndex((entry) => {
      // entry might be an object with video field or legacy string id
      if (typeof entry === "string") {
        return entry.toString() === videoId;
      }
      return entry.video && entry.video.toString() === videoId;
    });

    const now = new Date();
    if (existingIndex !== -1) {
      const existing = courseProgress.completedVideos[existingIndex];
      const prevWatchTime =
        typeof existing === "object" ? existing.watchTime || 0 : 0;
      const prevCompleted =
        typeof existing === "object" ? !!existing.completed : false;

      // Replace legacy string with structured object
      courseProgress.completedVideos[existingIndex] = {
        video: videoId,
        watchTime: Math.max(prevWatchTime, watchTime),
        completed: prevCompleted || !!completed,
        lastWatched: now,
      };
    } else {
      courseProgress.completedVideos.push({
        video: videoId,
        watchTime,
        completed: !!completed,
        lastWatched: now,
      });
    }

    await user.save();
    res.json(user.progress);
  } catch (error) {
    console.error(error.message);
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        error: true,
        message: "Invalid ID format",
        code: "INVALID_ID",
      });
    }
    res.status(500).json({
      error: true,
      message: "Server Error",
      code: "SERVER_ERROR",
    });
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(500).send("Server Error");
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    // Build user object
    const userFields = {};
    if (name) userFields.name = name;
    if (email) userFields.email = email;
    if (role && req.user.role === "admin") userFields.role = role;

    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Make sure user has permission to update
    if (user._id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({ error: "Not authorized" });
    }

    user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: userFields },
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(500).send("Server Error");
  }
};

// Delete user (admin only or self)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Make sure user has permission to delete
    if (user._id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({ error: "Not authorized" });
    }

    await user.remove();
    res.json({ msg: "User removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(500).send("Server Error");
  }
};

// Get user analytics (admin only)
exports.getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const admins = await User.countDocuments({ isAdmin: true });
    const students = totalUsers - admins;

    const usersWithProgress = await User.aggregate([
      { $match: { "progress.0": { $exists: true } } },
      { $count: "count" },
    ]);

    const activeUsers = usersWithProgress[0]?.count || 0;

    const courseProgress = await User.aggregate([
      { $unwind: "$progress" },
      {
        $group: {
          _id: "$progress.course",
          totalUsers: { $sum: 1 },
          completedUsers: {
            $sum: {
              $cond: [
                {
                  $gt: [{ $size: "$progress.completedVideos" }, 0],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    res.json({
      totalUsers,
      admins,
      students,
      activeUsers,
      courseProgress,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      error: true,
      message: "Server Error",
    });
  }
};
