const mongoose = require("mongoose");

const ValidTradeDataSchema = new mongoose.Schema(
  {
    tradeId: { type: String, required: true, unique: true },

    symbol: { type: String, required: true },
    type: { type: String, required: true },
    mode: { type: String, required: true },

    entry: { type: Number, required: true },
    sl: { type: Number, required: true },
    tp: { type: Number, required: true },

    timeframe: { type: String, required: true },

    maxTrades: { type: Number, required: true },
    risk: { type: Number, required: true },
    dailyMaxLoss: { type: Number, required: true },
    tpTargets: { type: String, required: true },

    initialBalance: { type: Number, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ValidTradeData", ValidTradeDataSchema);
