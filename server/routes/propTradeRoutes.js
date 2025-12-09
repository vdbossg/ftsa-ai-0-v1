const express = require('express');
const router = express.Router();
const PropTrade = require('../models/PropTrade');

// GET all closed Prop trades
router.get('/closed-prop-trades', async (req, res) => {
  try {
    const trades = await PropTrade.find().sort({ closed_time: -1 });
    res.json({ success: true, data: trades });
  } catch (err) {
    console.error('Error fetching closed Prop trades:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
// GET closed Prop trades by ticket
router.get('/closed-prop-trades/:ticket', async (req, res) => {
  try {
    const ticketNum = Number(req.params.ticket);
    const tradeDoc = await PropTrade.findOne({ 'trades.ticket': ticketNum });
    if (!tradeDoc) return res.status(404).json({ success: false, message: 'Trade not found' });

    const matchedTrade = tradeDoc.trades.find(t => t.ticket === ticketNum);
    res.json({ success: true, data: matchedTrade });
  } catch (err) {
    console.error('Error fetching Prop trade by ticket:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


module.exports = router;
