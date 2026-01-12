const mongoose = require('mongoose');

const tvAlertSchema = new mongoose.Schema({
    symbol: { type: String, required: true },
    type: { type: String, enum: ['BUY', 'SELL'], required: true },
    timeframe: { type: String, required: true },

    // Both bullish and bearish 30m choch
    "30m bullish choch": { type: Number },
    "30m bearish choch": { type: Number },

    // Both bullish and bearish 5m choch
    "5m bullish choch": { type: Number },
    "5m bearish choch": { type: Number },

    "5m support": { type: Number, required: true },
    "5m resistance": { type: Number, required: true },

    timestamp: { type: Date, default: Date.now }
});

// Export the model
module.exports = mongoose.model('TVAlert', tvAlertSchema);
