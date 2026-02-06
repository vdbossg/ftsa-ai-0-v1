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
const upload = multer({ dest: "uploads/" });
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
