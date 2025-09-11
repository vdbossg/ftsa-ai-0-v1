// server/models/Signal.js
const mongoose = require("mongoose");

const signalSchema = new mongoose.Schema({
  // Instrument symbol (e.g., "EURUSD")
  symbol: { type: String, required: true, uppercase: true, index: true },

  // Timeframe: e.g. "H1", "M15", "D1"
  tf: { type: String, required: true },

  // Type of signal: HTF (high time frame) or LTF (low time frame)
  type: { type: String, enum: ["HTF", "LTF"], required: true },

  // Market side: bull (long bias) or bear (short bias)
  side: { type: String, enum: ["bull", "bear"], required: true },

  // Confidence score (numeric rating of validity)
  score: { type: Number, default: 0 },

  // Timestamp of when the signal was generated
  t: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Signal", signalSchema);
