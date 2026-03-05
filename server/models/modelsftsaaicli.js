const mongoose = require("mongoose");

const TradeSchema = new mongoose.Schema({
  ticket: Number,
  symbol: String,
  type: String,
  volume: Number,
  price_open: Number,
  price_current: Number,
  profit: Number,
  sl: Number,
  tp: Number,
  time: Number
}, { _id: false });

const SummarySchema = new mongoose.Schema({
  balance: Number,
  equity: Number,
  margin: Number,
  free_margin: Number,
  margin_level: Number
}, { _id: false });

const MT5LiveSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  broker: String,
  login: Number,
  summary: SummarySchema,
  trades: [TradeSchema],
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: "mt5_live_accounts"
});

module.exports = mongoose.model("MT5LiveAccount", MT5LiveSchema);