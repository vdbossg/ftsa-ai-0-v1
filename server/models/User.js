// server/models/User.js
const mongoose = require("mongoose");

// Sub-schema for trading settings
const TradingSettingsSchema = new mongoose.Schema(
  {
    pairs: { type: [String], default: [] },   // e.g. ["EURUSD","GBPUSD"]
    risk: { type: Number, default: 1 },       // %
    dailyTarget: { type: Number, default: 2 },// %
    dailyStopLoss: { type: Number, default: 1 } // %
  },
  { _id: false }
);

// Sub-schema for subscription info
const SubscriptionSchema = new mongoose.Schema(
  {
    plan: { type: String, enum: ["Basic", "Plus", "Unlimited"], required: true },
    mtLogin: { type: String, required: true },
    licenseKey: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", default: null }, // links to Payment
    ocbTransactionId: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction", default: null } // links to OCB Bank transaction
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    middleName: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },


    // PROFILE
sirName: { type: String, default: "" },
profitPhoto: { type: String, default: "" },
country: { type: String, default: "" },
phoneCode: { type: String, default: "+254" },

// SECURITY
twoFactorEnabled: { type: Boolean, default: false },

// NOTIFICATIONS
notifications: {
  appUpdate: { type: Boolean, default: true },
  tradesUpdate: { type: Boolean, default: true },
  newsHeadlines: { type: Boolean, default: true },
  marketOffers: { type: Boolean, default: false },
},

// THEME
theme: {
  darkMode: { type: Boolean, default: true },
  neonAccentColor: { type: String, default: "Blue" },
},


    // ✅ BrainPage settings
    tradingSettings: { type: TradingSettingsSchema, default: () => ({}) },

    // ✅ Subscription info
    subscription: { type: SubscriptionSchema },

    // ✅ Affiliate reference (who referred this user)
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "Affiliate", default: null },

  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
