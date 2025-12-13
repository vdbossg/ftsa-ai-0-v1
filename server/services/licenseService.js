//C:\Users\LENOVO\Desktop\FTSA_AI_0.v1\server\services\licenseService.js
const License = require("../models/License");
const PendingSubscription = require("../models/PendingSubscription");
const User = require("../models/User");

// Helper to generate unique license key
const generateLicenseKey = (userId, plan) => {
  const timestamp = new Date().toISOString().replace(/[-:.]/g, "");
  return `LIC_${userId}_${plan}_${timestamp}`;
};

// Helper to calculate expiry based on plan
const calculateExpiry = (plan) => {
  const now = new Date();
  if (plan === "Basic") now.setDate(now.getDate() + 30);
  else if (plan === "Plus") now.setFullYear(now.getFullYear() + 1);
  else if (plan === "Unlimited") now.setFullYear(now.getFullYear() + 100);
  return now;
};

// ---------------------- Deposit / Subscription ----------------------
async function createLicenseFromSelarWebhook(metadata) {
  const { USER_ID, LOGIN_ID, BROKER, PLAN } = metadata;

  // Avoid duplicate license
  const existing = await License.findOne({
    userId: USER_ID,
    mtLogin: LOGIN_ID,
    endDate: { $gte: new Date() },
  });

  if (existing) return existing;

  const licenseKey = generateLicenseKey(USER_ID, PLAN);
  const endDate = calculateExpiry(PLAN);

  const license = await License.create({
    userId: USER_ID,
    mtLogin: LOGIN_ID,
    broker: BROKER || "",
    plan: PLAN,
    licenseKey,
    startDate: new Date(),
    endDate,
  });

  // Mark pending subscription as paid
  await PendingSubscription.updateOne(
    { userId: USER_ID, mtLogin: LOGIN_ID },
    { $set: { paid: true } }
  );

  return license;
}

// ---------------------- Download License ----------------------
async function getUserLicense(userId) {
  return await License.findOne({ userId }).sort({ createdAt: -1 }).lean();
}

module.exports = {
  createLicenseFromSelarWebhook,
  getUserLicense,
  generateLicenseKey,
  calculateExpiry,
};
