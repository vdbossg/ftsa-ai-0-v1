const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    method: { 
      type: String, 
      enum: [
        "mpesa", "airtelke", "airteltz", "paynet", "unionpay",
        "ovo", "dana", "boleto", "picpay", "paypal", "visa", "bank"
      ],
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
    transactionId: { type: String, unique: true }, // Gateway reference
    ocbTransactionId: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }, // link to OCB Bank
    paymentDetails: { type: mongoose.Schema.Types.Mixed } // provider-specific info
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
