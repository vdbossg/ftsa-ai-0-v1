// server/routes/binanceRoutes.js
const express = require("express");
const {
  connectBinance,
  fetchBinanceData,
  refreshBinanceData,
} = require("../controllers/binanceController.js");
const authMiddleware = require("../middleware/authMiddleware.js");

const router = express.Router();

router.post("/connect", authMiddleware, connectBinance);
router.get("/", authMiddleware, fetchBinanceData);
router.post("/refresh", authMiddleware, refreshBinanceData);

module.exports = router;
