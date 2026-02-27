const mongoose = require('mongoose');

const getStartedSchema = new mongoose.Schema({
  email: { type: String, required: true },
  referralCode: { type: String, required: true },
  used: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Optionally, add an index to prevent duplicate emails
getStartedSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('GetStarted', getStartedSchema);