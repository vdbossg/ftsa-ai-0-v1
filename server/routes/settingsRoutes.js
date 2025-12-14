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
const auth = require("../middleware/authMiddleware"); // ✅ correct path

// Routes without userId in URL
router.get("/", auth, getSettings);
router.put("/profile", auth, upload.single("profitPhoto"), updateProfile);
router.put("/security", auth, updateSecurity);
router.put("/notifications", auth, updateNotifications);

module.exports = router;
