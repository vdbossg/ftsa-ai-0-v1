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

module.exports = router;
