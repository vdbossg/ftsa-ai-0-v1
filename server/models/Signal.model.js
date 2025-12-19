const mongoose = require("mongoose");

const SignalSchema = new mongoose.Schema({
  symbol: String,
  type: String,
  mode: String,

  choch: Number,
  resistance: Number,
  support: Number,  // <-- added support
  entry: Number,
  sl: Number,
  tp: Number,

  timeframe: String,

  createdAt: { type: Date, default: Date.now },
  expiresAt: Date
});

// auto delete when expired
SignalSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Signal", SignalSchema);
