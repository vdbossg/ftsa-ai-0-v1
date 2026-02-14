const mongoose = require("mongoose");

const WithdrawalRequestSchema = new mongoose.Schema(
  {},
  {
    strict: false, // ✅ VERY IMPORTANT (stores FULL JSON exactly as sent)
    timestamps: true
  }
);

// ✅ FIX: prevent OverwriteModelError
module.exports =
  mongoose.models.WithdrawalRequest ||
  mongoose.model("WithdrawalRequestRaw", WithdrawalRequestSchema);

