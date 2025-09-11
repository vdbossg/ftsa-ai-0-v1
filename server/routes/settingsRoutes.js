// routes/settings.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const bcrypt = require("bcryptjs");

// GET user settings
router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({
  success: true,
  profile: {
    firstName: user.firstName,
    middleName: user.middleName,
    sirName: user.sirName,
    profitPhoto: user.profitPhoto,
    country: user.country,
    phoneNumber: user.phone,
    phoneCode: user.phoneCode,
    email: user.email,
  },
  security: {
    twoFactorEnabled: user.twoFactorEnabled || false,
  },
  notifications: user.notifications || {},
  theme: user.theme || {},
  language: user.language || "ENGLISH",
});

  } catch (err) {
    console.error("❌ Error fetching settings:", err);
    res.status(500).json({ msg: "Server error fetching settings" });
  }
});

// POST save user settings
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { profile, security, notifications, theme, language } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Save each section
   const bcrypt = require("bcryptjs"); // add at top

if (profile) {
  user.firstName = profile.firstName ?? user.firstName;
  user.middleName = profile.middleName ?? user.middleName;
  user.sirName = profile.sirName ?? user.sirName;
  user.profitPhoto = profile.profitPhoto ?? user.profitPhoto;
  user.country = profile.country ?? user.country;
  user.phone = profile.phoneNumber ?? user.phone;
  user.phoneCode = profile.phoneCode ?? user.phoneCode;
  user.email = profile.email ?? user.email;
}

if (security) {
  user.twoFactorEnabled = security.twoFactorEnabled ?? user.twoFactorEnabled;

  // ✅ Handle password change
  if (security.newPassword && security.oldPassword) {
    const isMatch = await bcrypt.compare(security.oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Old password incorrect" });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(security.newPassword, salt);
  }
}

    if (notifications) user.notifications = notifications;
    if (theme) user.theme = theme;
    if (language) user.language = language;

    await user.save();

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error saving settings:", err);
    res.status(500).json({ msg: "Server error saving settings" });
  }
});

module.exports = router;
