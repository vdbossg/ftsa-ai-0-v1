const mongoose = require('mongoose');

const MTTradeSchema = new mongoose.Schema({
  broker: String,
  login: String,
  summary: Object,
  trades: Array,
  closed_time: Date,
  closed_reason: String
}, { strict: false }); // strict: false keeps all live endpoint fields

module.exports = mongoose.model('MTTrade', MTTradeSchema);
