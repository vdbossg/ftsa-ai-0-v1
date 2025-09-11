// server/models/Trade.js
const mongoose = require("mongoose");

const tradeSchema = new mongoose.Schema({
  // Currency pair, e.g., "EURUSD"
  pair: { type: String, required: true, uppercase: true, index: true },

  // Trade type: BUY or SELL
  type: { type: String, enum: ["BUY", "SELL"], required: true },

  // Entry price for the trade
  price: { type: Number, required: true },

  // Trade size (lots, units, or qty depending on your logic)
  size: { type: Number, required: true },

  // Current status of the trade
  status: { type: String, enum: ["OPEN", "CLOSED"], default: "OPEN", index: true },

  // Optional: take profit and stop loss levels (price values)
  takeProfit: { type: Number, default: null },
  stopLoss: { type: Number, default: null },

  // Metadata (strategy name, signal ID, etc.)
  signal: { type: String, default: null },

  // PnL tracking (optional, but useful if EA syncs back results)
  profit: { type: Number, default: null },

  // Record timestamps
  createdAt: { type: Date, default: Date.now },
  closedAt: { type: Date, default: null }
});

// Pre-save hook (optional future logic: auto-calculate R:R, etc.)
tradeSchema.pre("save", function (next) {
  // Example: you could enforce pair uppercase even if API forgets
  if (this.pair) this.pair = this.pair.toUpperCase();
  next();
});

module.exports = mongoose.model("Trade", tradeSchema);
