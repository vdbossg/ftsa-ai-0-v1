const mongoose = require("mongoose");

const RiskStateCenterSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    date: { type: String, required: true, default: new Date().toISOString().split("T")[0] },
    autoTrade: { status: { type: String, default: "RUNNING" } },
    limits: {
      maxTrades: { type: Number, default: 1 },
      dailyMaxLoss: { type: Number, default: 1 },
    },
    today: {
      tradesTaken: { type: Number, default: 0 },
      remainingTrades: { type: Number, default: 1 },
      totalLossPercent: { type: Number, default: 0 },
    },
    todayTrades: {
      pending: { type: Number, default: 0 },
      active: { type: Number, default: 0 },
      closed: { type: Number, default: 0 },
    },
    permissions: {
      canTrade: { type: Boolean, default: true },
      blockedReason: { type: String, default: null },
    },
  },
  { timestamps: true }
);

// ✅ Fix OverwriteModelError
const RiskStateCenter = mongoose.models.RiskStateCenter || mongoose.model("RiskStateCenter", RiskStateCenterSchema);

module.exports = RiskStateCenter;