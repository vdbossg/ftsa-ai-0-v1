const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    plan: { 
      type: String, 
      enum: ["Basic", "Plus", "Unlimited"], 
      required: true 
    },
    paymentMethod: { 
      type: String, 
      enum: [
        "mpesa", "airtelke", "airteltz", "paynet", "unionpay",
        "ovo", "dana", "boleto", "picpay", "paypal", "visa", "bank"
      ],
      required: true 
    },
    amount: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ["active", "expired", "cancelled"], 
      default: "active" 
    },
    licenseKey: { type: String, unique: true },
    mtLogin: { type: String, required: true }, // MT4/5 login ID
    expiryDate: { type: Date, required: true },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" }, // link to Payment record
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
