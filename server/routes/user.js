// server/routes/user.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto"); // For generating tokens
const User = require("../models/User");
const { JWT_SECRET, BASE_URL } = process.env; // BASE_URL for email links
const sendEmail = require("../utils/sendEmail"); // We'll use a simple email util

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
// Forgot Password
// -----------------------
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: "Email is required." });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, error: "User not found." });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = await bcrypt.hash(resetToken, 10);
    const resetTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour

    // Save hashed token and expiry in user document
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Send email
    const resetLink = `${BASE_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    await sendEmail({
      to: email,
      subject: "Password Reset Request",
      text: `Click the link to reset your password: ${resetLink}`,
    });

    return res.json({ success: true, message: "Password reset email sent." });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ success: false, error: "Failed to send reset email." });
  }
});

// -----------------------
// Reset Password
// -----------------------
router.post("/reset-password", async (req, res) => {
  try {
    const { token, email, password } = req.body;
    if (!token || !email || !password) {
      return res.status(400).json({ success: false, error: "Token, email and new password required." });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, error: "User not found." });

    // Check token validity
    const isValid = await bcrypt.compare(token, user.resetPasswordToken || "");
    if (!isValid || Date.now() > user.resetPasswordExpires) {
      return res.status(400).json({ success: false, error: "Invalid or expired token." });
    }

    // Hash new password and save
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.json({ success: true, message: "Password reset successfully." });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ success: false, error: "Failed to reset password." });
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
