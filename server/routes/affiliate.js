import express from "express";
import {
  getAffiliateData,
  registerAffiliate,
  requestWithdrawal
} from "../controllers/affiliateController.js";

const router = express.Router();

// ✅ Get affiliate profile & stats
router.get("/:userId", getAffiliateData);

// ✅ Register a new affiliate
router.post("/register", registerAffiliate);

// ✅ Request withdrawal (moves balance to pending, waiting admin approval)
router.post("/withdraw", requestWithdrawal);

export default router;
