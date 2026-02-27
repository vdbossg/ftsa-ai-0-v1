const express = require("express");
const router = express.Router();
const referralCheckController = require("../controllers/controllersReferralCheck");

// GET /api/referral/check
router.get("/check", referralCheckController.checkAndProcessReferral.bind(referralCheckController));

module.exports = router;