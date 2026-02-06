const express = require("express");
const router = express.Router();
const cfaController = require("../controllers/cfaAccountController");
const { authenticateToken } = require("../middleware/auth"); // for affiliates
const adminAuth = require("../middleware/adminAuthMiddleware"); // for admins
const multer = require("multer");
const path = require("path");

// ---------- Multer setup for file uploads ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads")); // save files to /uploads
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// ================== ADMIN CFA ROUTES ==================
router.get("/balance", adminAuth, cfaController.getBalance);
router.post("/release-payout/:affiliateId", adminAuth, cfaController.releaseAffiliatePayout);

// ================== AFFILIATE CFA ROUTES ==================

// GET affiliate profile
router.get("/:userId", authenticateToken, cfaController.getAffiliateData);

// REGISTER affiliate (multipart/form-data)
router.post(
  "/register",
  authenticateToken,
  upload.fields([
    { name: "docFront", maxCount: 1 },
    { name: "docBack", maxCount: 1 }
  ]),
  cfaController.registerAffiliate
);

// REQUEST withdrawal
router.post("/request-withdrawal", authenticateToken, cfaController.requestAffiliateWithdrawal);

// Optional: deposit
router.post("/deposit", authenticateToken, cfaController.deposit);

module.exports = router;
