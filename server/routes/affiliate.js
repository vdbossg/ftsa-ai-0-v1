const express = require("express");
const {
  getAffiliateData,
  registerAffiliate,
  requestWithdrawal
} = require("../controllers/affiliateController");

const router = express.Router();

// ✅ Get affiliate profile
router.get("/:userId", getAffiliateData);

// ✅ Register a new affiliate
router.post("/register", registerAffiliate);

// ✅ Request withdrawal (matches frontend exactly)
router.post("/request-withdrawal", requestWithdrawal);

module.exports = router;
