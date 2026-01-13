// server/services/licenseService.js
const License = require("../models/License");
const Subscription = require("../models/Subscription");
const Transaction = require("../models/Transaction");
const CFAAccount = require("../services/cfaAccount"); // EA generator
const User = require("../models/User");
const crypto = require("crypto");

// Replace with your Paystack Secret Key
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

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
  else if (plan === "Unlimited") return null;
  return now;
};

// ---------------------- Webhook: Verify & Create License from Paystack ----------------------
async function handlePaystackWebhook(req) {
  const signature = req.headers["x-paystack-signature"];
  const payload = req.rawBody;

const hash = crypto
  .createHmac("sha512", PAYSTACK_SECRET_KEY)
  .update(payload)
  .digest("hex");


  if (hash !== signature) {
    throw new Error("Invalid Paystack webhook signature");
  }

  const event = req.body.event;
  const data = req.body.data;

  console.log("Paystack webhook event:", event);

  // Only handle successful payments
  if (event === "charge.success" || event === "subscription.charge.success") {
    const reference = data.reference; // unique payment reference
    const metadata = data.metadata || {};

    const userId = metadata.user_id;
    const mtLogin = metadata.mt_login;
    const broker = metadata.broker || "";
    const plan = metadata.plan;

    if (!userId || !plan || !mtLogin) {
      throw new Error("Missing required metadata");
    }

    // Avoid duplicate license
    let existing = await License.findOne({ paystackReference: reference });
    if (existing) return existing;

    // Create license
    const licenseKey = generateLicenseKey(userId, plan);
    const endDate = calculateExpiry(plan);

    const license = await License.create({
      userId,
      mtLogin,
      broker,
      plan,
      licenseKey,
      startDate: new Date(),
      endDate,
      paystackReference: reference,
    });

    // Update subscription to active & attach license
    await Subscription.findOneAndUpdate(
  { userId, mtLogin },
  {
    status: "active",
    plan,
    licenseKey,
    expiryDate: endDate,
  },
  { upsert: true }
);


    // Mark Transaction as completed
    await Transaction.updateMany(
      { "metadata.reference": reference },
      { $set: { status: "completed" } }
    );

    // Generate EA (one-time)
    await CFAAccount.generateEA(userId, licenseKey);

    console.log(`✅ License created & EA generated for user ${userId}, plan ${plan}`);
    return license;
  }

  // Handle failed payments
  if (event === "charge.failed" || event === "subscription.charge.failed") {
    const metadata = data.metadata || {};
    const userId = metadata.user_id;

    if (userId) {
      await Subscription.updateMany(
        { userId },
        { status: "failed" }
      );
      console.log(`❌ Payment failed for user ${userId}`);
    }
  }

  return null;
}

// ---------------------- Get Active License ----------------------
async function getUserLicense(userId) {
  const license = await License.findOne({
    userId,
    $or: [
      { endDate: { $gte: new Date() } },
      { endDate: null },
    ],
  }).sort({ createdAt: -1 });

  return license;
}


module.exports = {
  handlePaystackWebhook,
  getUserLicense,
  generateLicenseKey,
  calculateExpiry,
};
