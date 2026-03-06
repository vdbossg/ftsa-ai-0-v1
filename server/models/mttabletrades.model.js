const mongoose = require("mongoose");

const tradeSchema = new mongoose.Schema({
  symbol: String,
  ticket: Number,
  time: Date,
  type: String,
  volume: Number,
  open_price: Number,
  current_price: Number,
  sl: Number,
  tp: Number,
  profit: Number,
});

const summarySchema = new mongoose.Schema({
  balance: Number,
  equity: Number,
  margin: Number,
  freeMargin: Number,
});

const mtAccountSchema = new mongoose.Schema({
  broker: String,
  login: Number,
  summary: summarySchema,
  trades: [tradeSchema],
});

module.exports = mongoose.model("MTAccount", mtAccountSchema);
