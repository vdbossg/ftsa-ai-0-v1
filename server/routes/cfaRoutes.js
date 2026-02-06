const express = require("express");
const router = express.Router();
const cfaController = require("../controllers/cfaAccountController");
const { authenticateToken } = require("../middleware/auth"); // affiliate JWT
const adminAuth = require("../middleware/adminAuthMiddleware"); // admin JWT

// ================== ADMIN ROUTES ==================
router.get("/balance", adminAuth, cfaController.getBalance);
router.post("/release-payout", adminAuth, cfaController.releaseAffiliatePayout);

// ================== AFFILIATE ROUTES ==================
router.post("/deposit", authenticateToken, cfaController.deposit);
router.post("/request-withdrawal", authenticateToken, cfaController.requestAffiliateWithdrawal);

module.exports = router;
