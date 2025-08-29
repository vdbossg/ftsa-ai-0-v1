import express from "express";
import { getAffiliateData, registerAffiliate } from "../controllers/affiliateController.js";

const router = express.Router();

router.get("/:userId", getAffiliateData);
router.post("/register", registerAffiliate);

export default router;
