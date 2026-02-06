// server/routes/affiliate.js

const express = require("express");
const multer = require("multer");
const {
  getAffiliateData,
  registerAffiliate,
  requestWithdrawal,
} = require("../controllers/affiliateController");

const router = express.Router();

// ---------------- Multer setup ----------------
// Store files in /uploads folder
const upload = multer({ dest: "uploads/" });

// Accept multiple files for registration
const registrationUpload = upload.fields([
  { name: "docFront", maxCount: 1 },
  { name: "docBack", maxCount: 1 },
]);

// ---------------- Routes ----------------

// ✅ Register a new affiliate with file uploads (static route first)
router.post("/register", registrationUpload, registerAffiliate);

// ✅ Request withdrawal
router.post("/request-withdrawal", requestWithdrawal);

// ✅ Get affiliate profile by userId (dynamic route last)
router.get("/:userId", getAffiliateData);

module.exports = router;
