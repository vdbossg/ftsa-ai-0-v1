
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    accountId: { type: String, required: true }, // e.g. "CFA_ACCOUNT"
    type: { 
      type: String, 
      enum: ["deposit", "reserve", "payout", "adminWithdraw"], 
      required: true 
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    affiliateId: { type: mongoose.Schema.Types.ObjectId, ref: "Affiliate" },
    amount: { type: Number, required: true },
    method: { type: String }, // payment method if deposit
    status: { 
      type: String, 
      enum: ["pending", "completed", "failed"], 
      required: true,
      default: "pending" 
    },
    // ocbTransactionId: { type: String }, // ❌ Commented out since OCB is disabled
    metadata: { type: mongoose.Schema.Types.Mixed }, // extra details
  },
  { timestamps: true }
);
