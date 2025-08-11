const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Register a new user
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("Registering user:", {
      email,
      name,
      password,
    });

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password first
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("Registration: Password hashed successfully");

    // Create new user with hashed password
    user = new User({
      name,
      email,
      password: hashedPassword, // Store the hashed password
    });

    await user.save();

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        isAdmin: user.isAdmin,
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Return both token and user data
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    console.log(req.body);
    const { email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    console.log("User found:", user ? "yes" : "no");
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Check password
    console.log("Login: Starting password verification");
    console.log("Login: Stored hash length:", user.password.length);
    console.log("Login: Input password length:", password.length);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Login: Password match result:", isMatch ? "yes" : "no");

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        isAdmin: user.isAdmin,
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Return both token and user data
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Get authenticated user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
