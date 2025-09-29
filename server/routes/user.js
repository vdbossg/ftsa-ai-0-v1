// server/routes/user.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User"); // Make sure you have a User model
const { JWT_SECRET } = process.env;

// -----------------------
// Signup
// -----------------------
router.post("/signup", async (req, res) => {
  try {
    const { firstName, middleName, email, phone, password } = req.body;

    if (!firstName || !email || !phone || !password) {
      return res.status(400).json({ success: false, error: "All fields are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      firstName,
      middleName,
      email,
      phone,
      password: hashedPassword,
    });

    return res.json({ success: true, data: { id: newUser._id, email: newUser.email } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Signup failed." });
  }
});

// -----------------------
// Login
// -----------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, error: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: "Invalid credentials." });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

    return res.json({
      success: true,
      data: { id: user._id, firstName: user.firstName, email: user.email },
      token,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Login failed." });
  }
});

// -----------------------
// Profile (Protected example)
// -----------------------
router.get("/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "Unauthorized." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    return res.json({ success: true, data: user, token });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ success: false, error: "Unauthorized." });
  }
});

module.exports = router;
