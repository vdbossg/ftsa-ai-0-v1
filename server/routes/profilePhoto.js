const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Save uploaded photos to public/assets/images/profile-photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/assets/images/profile-photos"));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// POST /api/profile/photo
router.post("/photo", upload.single("profitPhoto"), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: "No file uploaded" });

  // Updated relative path to match new folder
  const filePath = `assets/images/profile-photos/${req.file.filename}`;
  res.json({ success: true, data: { profitPhoto: filePath } });
});

module.exports = router;
