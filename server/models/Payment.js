// server/models/Payment.js
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    method: { 
      type: String, 
      enum: ["card", "paypal", "crypto", "cfa"], 
      required: true 
    },
    status: { 
      type: String, 
      enum: ["pending", "completed", "failed"], 
      default: "pending" 
    },
    plan: { 
      type: String, 
      enum: ["Basic", "Plus", "Unlimited"], 
      required: true 
    },
    transactionId: { type: String, unique: true }, // CFA or gateway reference
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
