const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  // Currency pair, e.g., "EURUSD"
  pair: { type: String, required: true, uppercase: true },

  // Trade type: BUY or SELL
  type: { type: String, enum: ['BUY', 'SELL'], required: true },

  // Entry price for the trade
  price: { type: Number, required: true },

  // Trade size (units, lots, or quantity depending on your logic)
  size: { type: Number, required: true },

  // Current status of the trade
  status: { type: String, enum: ['OPEN', 'CLOSED'], default: 'OPEN' },

  // Optional: target profit and stop loss
  takeProfit: { type: Number },
  stopLoss: { type: Number },

  // Optional: additional metadata like strategy or signal info
  signal: { type: String },

  // Record when the trade was created and closed
  createdAt: { type: Date, default: Date.now },
  closedAt: { type: Date }
});

// Optional: pre-save hook to automatically calculate anything if needed
tradeSchema.pre('save', function (next) {
  // Example: you could calculate risk/reward here
  next();
});

module.exports = mongoose.model('Trade', tradeSchema);
