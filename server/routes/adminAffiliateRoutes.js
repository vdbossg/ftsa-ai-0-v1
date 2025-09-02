const express = require("express");
const router = express.Router();
const {
  approveAffiliate,
  declineAffiliate,
  approveWithdrawal,
} = require("../controllers/adminAffiliateController"); // no .js in CommonJS

// Admin actions
router.put("/:affiliateId/approve", approveAffiliate);
router.put("/:affiliateId/decline", declineAffiliate);
router.put("/:affiliateId/withdrawal/approve", approveWithdrawal);

module.exports = router; // ✅ CommonJS export
