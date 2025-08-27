// server/models/Affiliate.js
const mongoose = require("mongoose");

const AffiliateSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Linked user
    code: { type: String, unique: true, required: true }, // referral code (e.g. "KELVIN123")

    // Earnings
    pendingCommission: { type: Number, default: 0 }, // earned but not yet withdrawn
    paidCommission: { type: Number, default: 0 },    // lifetime paid out
    totalCommission: { type: Number, default: 0 },   // lifetime earned (paid + pending)

    // Optional: track who was referred
    referredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Withdrawal requests
    pendingWithdrawal: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Affiliate", AffiliateSchema);
