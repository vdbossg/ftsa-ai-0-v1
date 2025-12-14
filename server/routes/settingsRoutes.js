const express = require("express");
const router = express.Router();
const multer = require("multer");

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = file.originalname.split(".").pop();
    cb(null, `${Date.now()}-${file.fieldname}.${ext}`);
  },
});
const upload = multer({ storage });

// Controllers
const {
  getSettings,
  updateProfile,
  updateSecurity,
  updateNotifications,
} = require("../controllers/settingsController");

// Middleware
const { requireAuth } = require("../middlewares/auth");

// Routes
router.get("/:userId", requireAuth, getSettings);
router.put("/profile/:userId", requireAuth, upload.single("profitPhoto"), updateProfile);
router.put("/security/:userId", requireAuth, updateSecurity);
router.put("/notifications/:userId", requireAuth, updateNotifications);

module.exports = router;
