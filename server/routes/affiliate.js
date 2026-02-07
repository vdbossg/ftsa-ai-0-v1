const express = require("express");
const multer = require("multer");
const {
  getAffiliateData,
  registerAffiliate,
  requestWithdrawal,
} = require("../controllers/affiliateController");
const { authenticateToken } = require("../middleware/auth"); // <-- auth middleware

const router = express.Router();

// ---------------- Multer setup ----------------
const path = require("path");

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // save in uploads folder
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname); // get .png, .jpg, etc.
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });
const registrationUpload = upload.fields([
  { name: "docFront", maxCount: 1 },
  { name: "docBack", maxCount: 1 },
]);

// ---------------- Routes ----------------

// ✅ Register a new affiliate (requires auth)
router.post("/register", authenticateToken, registrationUpload, registerAffiliate);

// ✅ Request withdrawal (requires auth)
router.post("/request-withdrawal", authenticateToken, requestWithdrawal);

// ✅ Get affiliate profile by userId (requires auth)
// Must be LAST to avoid matching "/register" as a userId
router.get("/:userId", authenticateToken, getAffiliateData);

module.exports = router;
