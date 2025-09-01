// server/routes/brainRoutes.js
const express = require("express");
const router = express.Router();
const brainController = require("../controllers/brainController");
const { authenticateToken } = require("../middleware/auth");
const User = require("../models/User");

// ✅ Middleware: check subscription
const checkSubscription = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.subscription) {
      return res.status(403).json({ success: false, error: "No active subscription" });
    }

    if (new Date(user.subscription.expiryDate) < new Date()) {
      return res.status(403).json({ success: false, error: "Subscription expired" });
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Subscription check failed" });
  }
};

// ================== ROUTES ==================

// ✅ Core Brain features
router.get("/strength", authenticateToken, checkSubscription, brainController.getStrength);
router.post("/tv-webhook", authenticateToken, checkSubscription, brainController.receiveTradingViewSignal);
router.get("/command", authenticateToken, checkSubscription, brainController.getCommand);
router.post("/equity-report", authenticateToken, checkSubscription, brainController.postEquityReport);

// ✅ Advanced Brain features
router.get("/news", authenticateToken, checkSubscription, brainController.getLatestNews);
router.get("/choch", authenticateToken, checkSubscription, brainController.getChochDirection);

// ✅ Optional AI insights
router.get("/strongest-pair", authenticateToken, checkSubscription, brainController.getStrongestPair);
router.get("/dashboard", authenticateToken, checkSubscription, brainController.getDashboardData);
// CFA SYNC endpoint (called by OCB cron)
router.post("/cfa-sync", async (req, res) => {
  try {
    const axios = require("axios");

    const OCB_BANK_URL = process.env.OCB_BANK_URL; // e.g. http://localhost:5001/api
    const OCB_ACCOUNT_ID = process.env.FTSA_CFA_ACCOUNT_ID; 
    const OCB_BANK_KEY = process.env.OCB_BANK_KEY;

    // ✅ Ask OCB for CFA account balance
    const { data: ocbRes } = await axios.get(
      `${OCB_BANK_URL}/accounts/${OCB_ACCOUNT_ID}`,
      { headers: { "x-api-key": OCB_BANK_KEY } }
    );

    if (!ocbRes || !ocbRes.account || ocbRes.account.balance === undefined) {
  return res.status(400).json({ success: false, error: "OCB CFA account not found" });
}

const ocbBalance = ocbRes.account.balance;


    // ✅ Save to FTSA database
    const CFA = require("../models/CFA");
    let cfa = await CFA.findOne({ centralAccountId: OCB_ACCOUNT_ID });

    if (!cfa) {
      cfa = new CFA({ centralAccountId: OCB_ACCOUNT_ID, balance: ocbBalance });
    } else {
      cfa.balance = ocbBalance;
    }

    await cfa.save();

    res.json({
      success: true,
      message: "CFA sync completed ✅",
      balance: ocbBalance,
    });
  } catch (err) {
    console.error("❌ CFA sync failed:", err.message);
    res.status(500).json({ success: false, error: "CFA sync failed", details: err.message });
  }
});

module.exports = router;
