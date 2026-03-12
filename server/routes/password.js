// server/routes/password.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { sendEmail } = require("../utils/emailService");
const { JWT_SECRET, BASE_URL } = process.env;

// Helper: send reset email using sendEmail utility
async function sendResetEmail(email, token) {
  // Use hash routing for React
  const resetLink = `${process.env.FRONTEND_URL}/#/reset-password?token=${token}`;

  const subject = "FTSA AI – Password Reset Request";
  const html = `
    <div style="text-align:center; margin-bottom:20px;">
      <img src="https://ftsa-ai-0-v1.netlify.app/assets/images/ftsa-email-logo.png" 
           alt="FTSA AI Logo" 
           style="width:200px; max-width:100%;"/>
    </div>
    <p>Hi,</p>
    <p>We received a request to reset the password for your FTSA AI account (${email}).</p>
    <p>Click the button below to securely reset your password:</p>
    <p style="text-align:center;">
      <a href="${resetLink}" style="
        display:inline-block;
        padding:12px 24px;
        font-size:16px;
        color:#ffffff;
        background-color:#007bff;
        text-decoration:none;
        border-radius:5px;
        font-weight:bold;
      ">Reset Password</a>
    </p>
    <p>This password reset link will expire in <strong>1 hour</strong>.</p>
    <p>If you did not request a password reset, please ignore this email or contact our support immediately.</p>
    <p>Thank you,<br/>FTSA AI Team</p>
  `;
  await sendEmail(email, subject, html);
  console.log("Reset link sent in email:", resetLink); // ✅ debug
}

// ----------------------
// Forgot Password
// ----------------------
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: "Email is required." });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, error: "User not found." });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    await sendResetEmail(email, token);

    return res.json({ success: true, message: "Reset link sent to email." });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ success: false, error: "Failed to send reset email." });
  }
});

// ----------------------
// Reset Password
// ----------------------
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password)
      return res.status(400).json({ success: false, error: "Token and new password required." });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({
      _id: decoded.id,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ success: false, error: "Invalid or expired token." });

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

module.exports = router;
