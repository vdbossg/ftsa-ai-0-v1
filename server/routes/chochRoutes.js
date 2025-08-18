// server/routes/chochRoutes.js
const express = require('express');
const router = express.Router();
const chochService = require('../services/chochService');

// GET /api/choch?symbol=EURUSD
router.get('/', async (req, res) => {
  const symbol = req.query.symbol;
  const choch = await chochService.getLTFChoch(symbol);
  res.json(choch);
});

// POST /api/choch
router.post('/', async (req, res) => {
  const { symbol, side, valid } = req.body;
  await chochService.storeLTFChoch(symbol, side, valid);
  res.json({ ok: true });
});

module.exports = router;
