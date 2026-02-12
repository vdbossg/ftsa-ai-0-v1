// server/models/modelsNewreferrals.js
const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true }, // user _id from users collection
    email: { type: String, required: true },
    referredBy: { type: String, required: true },            // affiliate code
    status: { type: String, enum: ["pending", "subscribed"], default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Referral', referralSchema);
