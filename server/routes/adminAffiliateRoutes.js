import express from "express";
import {
  approveAffiliate,
  declineAffiliate,
  approveWithdrawal,
} from "../controllers/adminAffiliateController.js";

const router = express.Router();

// ✅ Admin actions
router.put("/:affiliateId/approve", approveAffiliate);
router.put("/:affiliateId/decline", declineAffiliate);
router.put("/:affiliateId/withdrawal/approve", approveWithdrawal);

export default router;
