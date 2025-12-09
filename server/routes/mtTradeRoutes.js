const express = require('express');
const router = express.Router();
const MTTrade = require('../models/MTTrade');

// GET all closed MT trades
router.get('/closed-mt-trades', async (req, res) => {
  try {
    const trades = await MTTrade.find().sort({ closed_time: -1 });
    res.json({ success: true, data: trades });
  } catch (err) {
    console.error('Error fetching closed MT trades:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
// GET closed MT trade by ticket
router.get('/closed-mt-trades/:ticket', async (req, res) => {
  try {
    const ticketNum = Number(req.params.ticket);
    const trade = await MTTrade.findOne({ ticket: ticketNum });
    if (!trade) return res.status(404).json({ success: false, message: 'Trade not found' });
    // Optional: return only the matched trade
    res.json({ success: true, data: trade });
  } catch (err) {
    console.error('Error fetching MT trade by ticket:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


module.exports = router;
