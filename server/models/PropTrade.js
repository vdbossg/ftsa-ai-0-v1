const mongoose = require('mongoose');

const PropTradeSchema = new mongoose.Schema({
  ticket: Number,           // trade ticket
  broker: String,
  login: String,
  summary: Object,
  trades: Array,
  platform: String,
  accountType: String,
  propSettings: Object,
  stats: Object,
  chartData: Array,
  symbol: String,           // trade symbol
  type: String,             // BUY/SELL
  volume: Number,
  open_price: Number,
  current_price: Number,
  sl: Number,
  tp: Number,
  profit: Number,
  time: String,             // trade open time
  closed_time: Date,
  closed_reason: String,
  status: String            // closed / active
}, { strict: false });


module.exports = mongoose.model('PropTrade', PropTradeSchema);
