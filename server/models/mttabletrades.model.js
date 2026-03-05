// FTSA_AI_0.v1\server\models\mttabletrades.model.js
const mongoose = require("mongoose");

// Schema for individual trades
const tradeSchema = new mongoose.Schema({
  symbol: { type: String, default: "" },
  ticket: { type: Number, default: 0 },
  time: { type: Date, default: Date.now },
  type: { type: String, default: "" },
  volume: { type: Number, default: 0 },
  open_price: { type: Number, default: 0 },
  current_price: { type: Number, default: 0 },
  sl: { type: Number, default: 0 },
  tp: { type: Number, default: 0 },
  profit: { type: Number, default: 0 },
});

// Schema for account summary
const summarySchema = new mongoose.Schema({
  balance: { type: Number, default: 0 },
  equity: { type: Number, default: 0 },
  margin: { type: Number, default: 0 },
  freeMargin: { type: Number, default: 0 },
});

// Schema for MT account
const mtAccountSchema = new mongoose.Schema(
  {
    broker: { type: String, default: "" },
    login: { type: Number, default: 0, unique: true },
    summary: summarySchema,
    trades: [tradeSchema],
  },
  { timestamps: true } // adds createdAt & updatedAt
);

module.exports = mongoose.model("MTAccount", mtAccountSchema);