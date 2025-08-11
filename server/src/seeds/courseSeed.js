const mongoose = require("mongoose");
const Course = require("../models/Course");
require("dotenv").config();

const sampleCourses = [
  {
    title: "Introduction to Web Development",
    description: "Learn the basics of HTML, CSS, and JavaScript to build modern websites.",
    category: "Web Development",
    thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop",
    published: true,
    videos: [
      {
        title: "What is Web Development?",
        description: "An overview of web development and what you'll learn in this course.",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Sample YouTube URL
        duration: 300, // 5 minutes
        order: 1,
      },
      {
        title: "Setting Up Your Development Environment",
        description: "Install and configure the tools you need for web development.",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Sample YouTube URL
        duration: 600, // 10 minutes
        order: 2,
      },
      {
        title: "HTML Basics",
        description: "Learn the fundamental structure of HTML documents.",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Sample YouTube URL
        duration: 900, // 15 minutes
        order: 3,
      },
    ],
  },
  {
    title: "JavaScript Fundamentals",
    description: "Master the core concepts of JavaScript programming language.",
    category: "Programming",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d9bab73c?w=800&h=600&fit=crop",
    published: true,
    videos: [
      {
        title: "Introduction to JavaScript",
        description: "What is JavaScript and why is it important?",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Sample YouTube URL
        duration: 450, // 7.5 minutes
        order: 1,
      },
      {
        title: "Variables and Data Types",
        description: "Learn about variables, strings, numbers, and booleans.",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Sample YouTube URL
        duration: 600, // 10 minutes
        order: 2,
      },
    ],
  },
];

async function seedCourses() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/lms"
    );
    console.log("Connected to MongoDB");

    // Clear existing courses
    await Course.deleteMany({});
    console.log("Cleared existing courses");

    // Insert sample courses
    const courses = await Course.insertMany(sampleCourses);
    console.log(`Created ${courses.length} sample courses`);

    // Display created courses
    courses.forEach((course, index) => {
      console.log(`\n${index + 1}. ${course.title}`);
      console.log(`   Category: ${course.category}`);
      console.log(`   Videos: ${course.videos.length}`);
      course.videos.forEach((video, vIndex) => {
        console.log(`   ${vIndex + 1}. ${video.title} (${video.duration}s)`);
        console.log(`      URL: ${video.videoUrl}`);
      });
    });

    await mongoose.connection.close();
    console.log("\nDatabase connection closed");
  } catch (error) {
    console.error("Error seeding courses:", error);
    process.exit(1);
  }
}

// Run the seed
seedCourses();
