const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // temporary storage for uploaded files

const {
  getSettings,
  updateProfile,
  updateSecurity,
  updateNotifications,
} = require("../controllers/settingsController");

// GET settings for a user
router.get("/:userId", getSettings);

// UPDATE sections
router.put("/profile/:userId", upload.single("profitPhoto"), updateProfile); // ✅ handle file upload
router.put("/security/:userId", updateSecurity);
router.put("/notifications/:userId", updateNotifications);

module.exports = router;
