// server/models/WithdrawalRequest.js
const mongoose = require("mongoose");

const WithdrawalRequestSchema = new mongoose.Schema(
  {
    affiliate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Affiliate",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    method: {
      type: String,
      enum: ["mpesa", "paypal", "bank", "card"],
      required: true,
    },
    accountDetails: {
      type: Object,
      default: {},
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    declineReason: {
      type: String,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    processedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WithdrawalRequest", WithdrawalRequestSchema);
