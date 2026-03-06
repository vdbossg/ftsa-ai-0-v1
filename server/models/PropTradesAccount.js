const mongoose = require("mongoose");

const TradeSchema = new mongoose.Schema({
  ticket: Number,
  symbol: String,
  type: String,
  volume: Number,
  open_price: Number,
  current_price: Number,
  sl: Number,
  tp: Number,
  profit: Number,
  time: String,
});

const PropSettingsSchema = new mongoose.Schema({
  accountLogin: String,
  profitTarget: Number,
  dailyDrawdown: Number,
  maxDrawdown: Number,
  phase: Number,
  status: String,
  currentProfit: Number,
});

const PropAccountSchema = new mongoose.Schema({
  broker: String,
  login: String,
  password: String,
  server: String,
  platform: String,
  accountType: String,
  currency: String,
  isConnected: Boolean,
  trades: {
    success: Boolean,
    data: [TradeSchema],
  },
  summary: {
    success: Boolean,
    data: {
      login: Number,
      currency: String,
      balance: Number,
      equity: Number,
      margin: Number,
      freeMargin: Number,
      marginLevel: Number,
    },
  },
  createdAt: Date,
  updatedAt: Date,
});

// ✅ Safe export to avoid OverwriteModelError
module.exports = {
  PropAccount: mongoose.models.PropAccount || mongoose.model("PropAccount", PropAccountSchema),
  PropSettings: mongoose.models.PropSettings || mongoose.model("PropSettings", PropSettingsSchema),
};
