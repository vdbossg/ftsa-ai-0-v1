const mongoose = require("mongoose");

const RmsSchema = new mongoose.Schema(
  {
    maxTrades: { type: Number, default: 1 },
    risk: { type: Number, default: 1 },           // Risk % per trade
    dailyMaxLoss: { type: Number, default: 1 },   // Daily max loss %
    tpTargets: { type: String, default: "tp1" }, // TP1/TP2/TP3
  },
  { timestamps: true }
);

module.exports = mongoose.model("Rms", RmsSchema);
