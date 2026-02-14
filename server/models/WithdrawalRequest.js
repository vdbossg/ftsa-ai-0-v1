const mongoose = require("mongoose");

const WithdrawalRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    code: { type: String },
    ticketNumber: { type: String },
    email: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String },
    method: { type: String }, // no enum restriction
    details: { type: Object, default: {} },
    withdrawableBalance: { type: Number, default: 0 },
    pendingCommission: { type: Number, default: 0 },
    paidCommission: { type: Number, default: 0 },
    totalCommission: { type: Number, default: 0 },
    newSubscribersCount: { type: Number, default: 0 },
    totalReferredUsers: { type: Number, default: 0 },
    lastWithdrawalAt: { type: String, default: "" },
    status: { type: String, default: "pending" }
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.WithdrawalRequest ||
  mongoose.model("WithdrawalRequest", WithdrawalRequestSchema);
