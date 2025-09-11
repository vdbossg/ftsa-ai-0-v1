// server/models/DailySelection.js
const mongoose = require("mongoose");

const DailySelectionSchema = new mongoose.Schema({
  date: { type: String, required: true, index: true }, // YYYY-MM-DD
  pair: { type: String, required: true },              // e.g. "EURUSD"
  side: { type: String, enum: ["BUY", "SELL"], required: true },
  strength: { type: Number, default: null },           // 0–100, can be null
  balanceAtSelection: { type: Number, default: null }, // balance when chosen
  createdAt: { type: Date, default: Date.now }
});

// Ensure only one record per day
DailySelectionSchema.index({ date: 1 }, { unique: true });

module.exports = mongoose.model("DailySelection", DailySelectionSchema);
