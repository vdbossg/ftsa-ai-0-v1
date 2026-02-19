//FTSA_AI_0.v1\server\models\tvAlertModel.js
const mongoose = require('mongoose');

const tvAlertSchema = new mongoose.Schema({
  _id: String, // allow custom string IDs
  symbol: { type: String, required: true },
  type: { type: String, required: true }, // BUY or SELL
  status: { type: String, enum: ['NEW','TP1','TP2','TP3','SL'], default: 'NEW' },
  entry: Number,
  sl: Number,
  tp1: Number,
  tp2: Number,
  tp3: Number,
  timeframe: String,
  choch: Boolean,
  chochType: String
}, { timestamps: true });

module.exports = mongoose.model('TVAlert', tvAlertSchema);
