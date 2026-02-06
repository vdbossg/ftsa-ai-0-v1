//FTSA_AI_0.v1\server\models\Affiliate.js
const mongoose = require("mongoose");

const AffiliateSchema = new mongoose.Schema(
  {
    // Link to the User who owns this affiliate account
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Referral code (unique to each affiliate)
    code: { type: String, unique: true },

    // Ticket system (acts as a unique payout identifier)
    ticketNumber: { type: String, unique: true }, // e.g. "#001/username/+254/email@gmail.com"
    extension: { type: Number, default: 0 }, // increments with each new subscriber

    // Affiliate profile details
    firstName: String,
    middleName: String,
    lastName: String,
    username: { type: String, required: true, unique: true },
    phone: String,
    email: String,
    country: String,
    idType: { type: String, enum: ["id", "passport", "dl"], required: true },
    idNumber: String,
    docFront: { type: String, required: true }, // image path or URL
    docBack: { type: String, required: true },


    
    // Earnings & balances
    withdrawableBalance: { type: Number, default: 0 }, // funds available for withdrawal
    pendingCommission: { type: Number, default: 0 },   // locked, awaiting admin approval
    paidCommission: { type: Number, default: 0 },      // total successfully withdrawn
    totalCommission: { type: Number, default: 0 },     // lifetime earned (withdrawable + pending + paid)
    newSubscribersCount: { type: Number, default: 0 }, // tracks how many new subscribers joined


    // Track referred users
    referredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Withdrawals
    lastWithdrawalAt: { type: Date },

    // Status of affiliate account
    status: { type: String, enum: ["pending", "active", "rejected"], default: "pending" }
  },
  { timestamps: true }
);
AffiliateSchema.index({ user: 1 }, { unique: true });
AffiliateSchema.index({ ticketNumber: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Affiliate", AffiliateSchema);
