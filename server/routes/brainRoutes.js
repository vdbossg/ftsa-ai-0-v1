const express = require("express");
const router = express.Router();
const brainController = require("../controllers/brainController");

// ✅ Existing routes
router.get("/strength", brainController.getStrength);
router.post("/tv-webhook", brainController.receiveTradingViewSignal);
router.get("/command", brainController.getCommand);
router.post("/equity-report", brainController.postEquityReport);

// 🆕 Upgraded FTSA AI Brain routes
router.get("/news", brainController.getLatestNews);
router.get("/choch", brainController.getChochDirection);

// 🆕 Optional advanced endpoints
router.get("/strongest-pair", brainController.getStrongestPair);
router.get("/dashboard", brainController.getDashboardData);

module.exports = router;
