const mongoose = require("mongoose");

const MTAccountSchema = new mongoose.Schema(
  {
    broker: { type: String, default: "" },
    login: { type: String, required: true },
    password: { type: String, required: true },
    server: { type: String, required: true },
    platform: { type: String, enum: ["MT4", "MT5"], default: "MT4" },
    accountType: { type: String, enum: ["demo", "live"], default: "demo" },
    currency: { type: String, default: "" }, // Added for frontend sync
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MTAccount", MTAccountSchema);
