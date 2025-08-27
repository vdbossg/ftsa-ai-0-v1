// server/routes/cfaRoutes.js
const express = require("express");
const router = express.Router();
const cfaController = require("../controllers/cfaAccountController");
const { authenticateToken } = require("../middleware/auth"); // for affiliates
const adminAuth = require("../middleware/adminAuthMiddleware"); // for admins

// ================== ADMIN CFA ROUTES ==================
router.get("/balance", adminAuth, cfaController.getBalance);
router.post("/release-payout/:affiliateId", adminAuth, cfaController.releaseAffiliatePayout);

// ================== AFFILIATE CFA ROUTES ==================
router.post("/deposit", authenticateToken, cfaController.deposit);
router.post("/request-withdrawal", authenticateToken, cfaController.requestAffiliateWithdrawal);

module.exports = router;
