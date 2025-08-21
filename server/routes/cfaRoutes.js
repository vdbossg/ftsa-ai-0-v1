const express = require("express");
const router = express.Router();
const cfaController = require("../controllers/cfaAccountController"); // correct
const adminAuth = require("../middleware/adminAuthMiddleware"); // singular 'middleware', matches folder

// Admin routes
router.get("/balance", adminAuth, cfaController.getBalance);
router.post("/release-payout", adminAuth, cfaController.releaseAffiliatePayout);

// Public / affiliate routes
router.post("/deposit", cfaController.deposit);
router.post("/request-withdrawal", cfaController.requestAffiliateWithdrawal);

module.exports = router;
