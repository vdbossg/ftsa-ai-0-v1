// server/routes/chochRoutes.js
const express = require('express');
const router = express.Router();
const brainService = require('../services/brainService'); // live brainService

const allPairs = [
  "EURUSD","GBPUSD","USDJPY","USDCHF","AUDUSD","NZDUSD","USDCAD",
  "EURGBP","EURJPY","EURCHF","EURAUD","EURNZD",
  "GBPJPY","GBPCHF","GBPAUD","GBPNZD",
  "AUDJPY","AUDNZD","AUDCHF",
  "CADJPY","CADCHF",
  "CHFJPY","NZDJPY","NZDCHF"
];

// GET /choch?symbol=EURUSD
router.get('/', async (req, res) => {
  const symbolQuery = req.query.symbol ? String(req.query.symbol).toUpperCase() : null;

  try {
    const results = [];

    for (const pair of allPairs) {
      if (symbolQuery && pair !== symbolQuery) continue;

      const candles = brainService.candlesStore[pair]?.[900]; // 15m
      if (!candles || candles.length < 6) {
        // No candles yet, return placeholder
        results.push({ symbol: pair, side: null, valid: false });
        continue;
      }

      const ltf = brainService.detectLTFChochFromCandles(candles, 5);

      results.push({
        symbol: pair,
        side: ltf.side,          // "BUY" or "SELL" or null
        valid: !!ltf.valid       // true/false
      });
    }

    res.json(results);
  } catch (err) {
    console.error("❌ CHoCH route error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
