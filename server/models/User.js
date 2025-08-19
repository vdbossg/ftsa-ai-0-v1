// server/models/User.js
const mongoose = require("mongoose");

// Sub-schema for trading settings
const TradingSettingsSchema = new mongoose.Schema(
  {
    pairs: { type: [String], default: [] },   // e.g. ["EURUSD","GBPUSD"]
    risk: { type: Number, default: 1 },       // %
    dailyTarget: { type: Number, default: 2 },// %
    dailyStopLoss: { type: Number, default: 1 } // %
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    middleName: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },

    // ✅ where we’ll store the BrainPage settings
    tradingSettings: { type: TradingSettingsSchema, default: () => ({}) },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
