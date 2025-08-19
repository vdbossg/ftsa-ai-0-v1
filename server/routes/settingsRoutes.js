const express = require("express");
const router = express.Router();
const User = require("../models/User"); // adjust if your User model path is different
const authMiddleware = require("../middleware/authMiddleware"); // ✅ if you already use JWT middleware

// ✅ Save trading settings
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { pairs, risk, dailyTarget, dailyStopLoss } = req.body;

    const user = await User.findById(req.user.id); // `req.user` comes from authMiddleware
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.tradingSettings = {
      pairs,
      risk,
      dailyTarget,
      dailyStopLoss,
    };

    await user.save();

    res.json({ success: true, settings: user.tradingSettings });
  } catch (err) {
    console.error("❌ Error saving settings:", err);
    res.status(500).json({ msg: "Server error saving settings" });
  }
});

// ✅ Get saved trading settings
router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({ success: true, settings: user.tradingSettings || {} });
  } catch (err) {
    console.error("❌ Error loading settings:", err);
    res.status(500).json({ msg: "Server error loading settings" });
  }
});

module.exports = router;
