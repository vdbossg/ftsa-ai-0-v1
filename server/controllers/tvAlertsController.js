//FTSA_AI_0.v1\server\controllers\tvAlertsController.js
const TVAlert = require('../models/tvAlertModel');

// POST: receive TradingView alert
exports.handleTVAlert = async (req, res) => {
  try {
    const { symbol, type, status, entry, sl, tp1, tp2, tp3, timeframe, choch, chochType, secret } = req.body;

    // Optional security check
    if (secret !== 'FTSA2026') return res.status(401).json({ message: 'Unauthorized' });

    if (!symbol || !type) return res.status(400).json({ message: 'Symbol and type are required' });

    // Upsert document per symbol
const alertDoc = await TVAlert.findOneAndUpdate(
  { symbol },
  { type, status, entry, sl, tp1, tp2, tp3, timeframe, choch, chochType },
  { new: true, upsert: true }
);


    res.status(200).json({ message: 'Alert received', data: alertDoc });
  } catch (err) {
    console.error('TVAlert POST error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET: all current signals
exports.getAllTVAlerts = async (req, res) => {
  try {
    const alerts = await TVAlert.find().sort({ updatedAt: -1 });
    res.status(200).json({ message: 'All current TV signals', data: alerts });
  } catch (err) {
    console.error('TVAlert GET error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
