//FTSA_AI_0.v1\server\models\PropAccount.js
const mongoose = require("mongoose");

const PropAccountSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true }, // <-- Add this line to track the owner
    broker: { type: String, default: "" },
    login: { type: String, required: true },
    password: { type: String, required: true },
    server: { type: String, required: true },
    platform: { type: String, enum: ["MT4", "MT5"], default: "MT5" },
    accountType: { type: String, enum: ["demo", "live"], default: "demo" },
    currency: { type: String, default: "USD" },

    // Track which account is active/connected
    isConnected: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("PropAccount", PropAccountSchema);
