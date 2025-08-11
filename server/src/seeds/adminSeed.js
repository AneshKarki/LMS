const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
require("dotenv").config();

const adminUser = {
  name: "Admin User",
  email: "admin@example.com",
  password: "admin123",
  isAdmin: true,
};

async function seedAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/lms"
    );
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminUser.email });
    if (existingAdmin) {
      console.log("Admin user already exists");
      await mongoose.connection.close();
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminUser.password, salt);

    // Create new admin user
    const admin = new User({
      name: adminUser.name,
      email: adminUser.email,
      password: hashedPassword,
      isAdmin: adminUser.isAdmin,
    });

    await admin.save();
    console.log("Admin user created successfully");
    console.log("Admin credentials:");
    console.log("Email:", adminUser.email);
    console.log("Password:", adminUser.password);

    await mongoose.connection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error seeding admin user:", error);
    process.exit(1);
  }
}

// Run the seed
seedAdmin();
