// server/services/servicesNewreferrals.js
const Referral = require('../models/modelsNewreferrals');

const addReferral = async ({ userId, email, referredBy }) => {
  // Check if referral already exists
  const existing = await Referral.findOne({ userId });
  if (existing) throw new Error("Referral already exists for this user.");

  const referral = new Referral({ userId, email, referredBy, status: "pending" });
  return referral.save();
};

const getAllReferrals = async () => {
  return Referral.find().sort({ createdAt: -1 });
};

module.exports = {
  addReferral,
  getAllReferrals,
};
