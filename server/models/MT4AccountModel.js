const mongoose = require("mongoose");

const MT4AccountSchema = new mongoose.Schema(
  {
    broker: { type: String, required: true },
    login: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    server: { type: String, required: true },
    platform: { type: String, enum: ["MT4"], default: "MT4" },
    accountType: { type: String, enum: ["demo", "live"], default: "demo" },
    currency: { type: String, required: true },
    isConnected: { type: Boolean, default: false },
    leverage: { type: Number, default: 100 },
    lastConnection: { type: Date },
    notes: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MT4Account", MT4AccountSchema);
