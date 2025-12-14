// routes/settings.js
const express = require("express");
const router = express.Router();

const {
  getSettings,
  updateProfile,
  updateSecurity,
  updateNotifications,
} = require("../controllers/settingsController");

// GET settings for a user
router.get("/:userId", getSettings);

// UPDATE sections
router.put("/profile/:userId", updateProfile);
router.put("/security/:userId", updateSecurity);
router.put("/notifications/:userId", updateNotifications);

module.exports = router;
