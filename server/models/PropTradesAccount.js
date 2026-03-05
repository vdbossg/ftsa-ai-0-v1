const mongoose = require("mongoose");

// Schema for individual trades
const TradeSchema = new mongoose.Schema({
  ticket: { type: Number, required: true },
  symbol: { type: String, required: true },
  type: { type: String, required: true },
  volume: { type: Number, required: true },
  open_price: { type: Number, required: true },
  current_price: { type: Number, required: true },
  sl: { type: Number, default: 0 },
  tp: { type: Number, default: 0 },
  profit: { type: Number, default: 0 },
  time: { type: String, required: true },
});

// Schema for prop/trading settings
const PropSettingsSchema = new mongoose.Schema({
  accountLogin: { type: String, required: true },
  profitTarget: { type: Number, default: 0 },
  dailyDrawdown: { type: Number, default: 0 },
  maxDrawdown: { type: Number, default: 0 },
  phase: { type: Number, default: 1 },
  status: { type: String, default: "inactive" },
  currentProfit: { type: Number, default: 0 },
  initialBalance: { type: Number, default: 0 }, // matches API field
});

// Schema for prop account
const PropAccountSchema = new mongoose.Schema({
  broker: { type: String, default: "Unknown" },
  login: { type: String, required: true, unique: true },
  password: { type: String, select: false },
  server: { type: String, default: "" },
  platform: { type: String, default: "MT5" },
  accountType: { type: String, default: "live" },
  currency: { type: String, default: "USD" },
  isConnected: { type: Boolean, default: false },
  trades: {
    success: { type: Boolean, default: true },
    data: [TradeSchema],
  },
  summary: {
    success: { type: Boolean, default: true },
    data: {
      login: { type: Number },
      currency: { type: String },
      balance: { type: Number, default: 0 },
      equity: { type: Number, default: 0 },
      margin: { type: Number, default: 0 },
      freeMargin: { type: Number, default: 0 },
      marginLevel: { type: Number, default: 0 },
    },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// ✅ Safe exports to prevent OverwriteModelError
module.exports = {
  PropAccount: mongoose.models.PropAccount || mongoose.model("PropAccount", PropAccountSchema),
  PropSettings: mongoose.models.PropSettings || mongoose.model("PropSettings", PropSettingsSchema),
};