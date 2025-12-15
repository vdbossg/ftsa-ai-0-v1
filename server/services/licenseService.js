const License = require("../models/License");
const Subscription = require("../models/Subscription");
const PendingSubscription = require("../models/PendingSubscription");
const Transaction = require("../models/Transaction");
const CFAAccount = require("../services/cfaAccount"); // EA generator
const User = require("../models/User");

// Helper: generate unique license
const generateLicenseKey = (userId, plan) => {
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "");
  return `LIC_${userId}_${plan}_${timestamp}`;
};

// Helper: calculate expiry
const calculateExpiry = (plan) => {
  const now = new Date();
  if (plan === "Basic") now.setDate(now.getDate() + 30);
  else if (plan === "Plus") now.setFullYear(now.getFullYear() + 1);
  else if (plan === "Unlimited") now.setFullYear(now.getFullYear() + 100);
  return now;
};

// ---------------------- Webhook: Create License from Selar ----------------------
async function createLicenseFromSelarWebhook(metadata) {
  const { userId, mtLogin, broker, plan, orderId } = metadata;

  // Avoid duplicate license
  let existing = await License.findOne({ selarOrderId: orderId });
  if (existing) return existing;

  // Create license
  const licenseKey = generateLicenseKey(userId, plan);
  const endDate = calculateExpiry(plan);

  const license = await License.create({
    userId,
    mtLogin,
    broker: broker || "",
    plan,
    licenseKey,
    startDate: new Date(),
    endDate,
    selarOrderId: orderId,
  });

  // Update subscription to active & attach license
await Subscription.findOneAndUpdate(
  { userId, mtLogin },
  { status: "active", licenseKey, expiryDate: endDate }
);

  // Mark Transaction as completed
  await Transaction.updateMany(
    { "metadata.orderId": orderId },
    { $set: { status: "completed" } }
  );

  // Generate EA (one-time)
  await CFAAccount.generateEA(userId, licenseKey);

  console.log(`✅ License created & EA generated for user ${userId}, plan ${plan}`);
  return license;
}

// ---------------------- Get Active License ----------------------
async function getUserLicense(userId) {
  const license = await License.findOne({
    userId,
    endDate: { $gte: new Date() },
  }).sort({ createdAt: -1 });

  return license;
}

module.exports = {
  createLicenseFromSelarWebhook,
  getUserLicense,
  generateLicenseKey,
  calculateExpiry,
};
