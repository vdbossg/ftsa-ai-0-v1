const mongoose = require("mongoose");

const PropSettingSchema = new mongoose.Schema({
  accountLogin: { type: String, required: true, unique: true },
  profitTarget: { type: Number, required: true },     // %
  dailyDrawdown: { type: Number, required: true },     // %
  maxDrawdown: { type: Number, required: true },       // %
  phase: { type: Number, enum: [1, 2], default: 1 },
  status: { type: String, enum: ["active", "completed", "failed"], default: "active" },
  currentProfit: { type: Number, default: 0 },         // %
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("PropSetting", PropSettingSchema);
