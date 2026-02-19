const express = require('express');
const router = express.Router();
const { ftsaCalculator, getLatestTrade, updateTradeStatus } = require('../controllers/ftsacalculatorController');

// POST: calculate and save trade
router.post('/ftsacalculator', ftsaCalculator);

// GET: fetch latest trade
router.get('/ftsacalculator', getLatestTrade);

// POST: receive trade updates from EA
router.post('/ftsacalculator/updateTrade', updateTradeStatus);

module.exports = router;
