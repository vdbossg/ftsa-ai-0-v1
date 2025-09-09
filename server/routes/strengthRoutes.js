const express = require('express');
const router = express.Router();
const strengthService = require('../services/strengthService');

// Get all ranked Forex pair strengths
router.get('/', async (req, res) => {
  try {
    const rankedPairs = await strengthService.getRankedPairs();
    res.json({ success: true, data: rankedPairs });
  } catch (err) {
    console.error("Error fetching market strength:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch market strength" });
  }
});

// Get the strongest pair
router.get('/strongest', async (req, res) => {
  try {
    const strongest = await strengthService.getStrongestPair();
    res.json({ success: true, data: strongest });
  } catch (err) {
    console.error("Error fetching strongest pair:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch strongest pair" });
  }
});

module.exports = router;
