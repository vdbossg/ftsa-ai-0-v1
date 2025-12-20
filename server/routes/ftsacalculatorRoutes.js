const express = require('express');
const router = express.Router();
const { ftsaCalculator, getLatestTrade } = require('../controllers/ftsacalculatorController');

// POST: calculate and save trade
router.post('/ftsacalculator', ftsaCalculator);

// GET: fetch latest trade
router.get('/ftsacalculator', getLatestTrade);

module.exports = router;
