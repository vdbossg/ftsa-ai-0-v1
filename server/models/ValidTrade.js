const mongoose = require("mongoose");

const validTradeSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  type: { type: String, required: true },   // BUY / SELL
  mode: { type: String, default: "market" },

  entry: { type: Number, required: true },
  sl: { type: Number, required: true },
  tp: { type: Number, required: true },

  timeframe: { type: String, required: true },

  signalId: { type: String, unique: true }, // prevents duplicates
}, { timestamps: true });

module.exports = mongoose.model("ValidTrade", validTradeSchema);
