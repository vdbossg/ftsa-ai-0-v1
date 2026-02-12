// FTSA_AI_0.v1/server/models/modelsAffiliatestatusMy.js
const mongoose = require('mongoose');

const affiliateSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  code: String,
  ticketNumber: String,
  extension: Number,
  firstName: String,
  middleName: String,
  lastName: String,
  username: String,
  phone: String,
  email: String,
  country: String,
  idType: String,
  idNumber: String,
  docFront: String,
  docBack: String,
  withdrawableBalance: Number,
  pendingCommission: Number,
  paidCommission: Number,
  totalCommission: Number,
  newSubscribersCount: Number,
  referredUsers: [String],
  status: String,
}, { timestamps: true });

// ✅ Fix: only create model if it doesn't already exist
module.exports = mongoose.models.Affiliate || mongoose.model('Affiliate', affiliateSchema);
