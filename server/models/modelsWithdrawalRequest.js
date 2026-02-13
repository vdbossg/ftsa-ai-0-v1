const mongoose = require('mongoose');

const withdrawalRequestSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // From currentWatcherUser.json
  code: String,
  ticketNumber: String,
  extension: Number,
  firstName: String,
  middleName: String,
  lastName: String,
  username: String,
  phone: String,
  email: String,
  amount: Number,
  currency: String,
  method: { type: String, enum: ['bank','visacard','paypal','m-pesa'], required: true },
  details: { type: Object, default: {} },
  withdrawableBalance: { type: Number, default: 0 },
  pendingCommission: { type: Number, default: 0 },
  paidCommission: { type: Number, default: 0 },
  totalCommission: { type: Number, default: 0 },
  newSubscribersCount: { type: Number, default: 0 },
  totalReferredUsers: { type: Number, default: 0 },
  lastWithdrawalAt: { type: Date, default: null },
  status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('WithdrawalRequest', withdrawalRequestSchema);
