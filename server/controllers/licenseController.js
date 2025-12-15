const License = require("../models/License");
const Subscription = require("../models/Subscription");
const User = require("../models/User");
const CFAAccount = require("../services/cfaAccount"); // Optional EA service
const Transaction = require("../models/Transaction"); // if not already imported

// Generate unique license key
const generateLicenseKey = (userId, plan) => {
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "");
  return `${userId}_${plan}_${timestamp}`;
};

// Calculate expiry
const calculateExpiry = (plan) => {
  const now = new Date();
  if (plan === "Basic") now.setDate(now.getDate() + 30);
  else if (plan === "Plus") now.setFullYear(now.getFullYear() + 1);
  else if (plan === "Unlimited") now.setFullYear(now.getFullYear() + 100);
  return now;
};

// Handle Selar webhook
exports.selarWebhook = async (req, res) => {
  try {
    const data = req.body;

    // TODO: validate Selar webhook signature

    if (data.status !== "paid") return res.status(200).send("Payment not completed, ignoring");

    const { userId, mtLogin, broker, plan, orderId } = data.metadata;

    // Prevent duplicate license
    const existing = await License.findOne({ selarOrderId: orderId });
    if (existing) return res.status(200).send("License already created");

    // Create license
    const licenseKey = generateLicenseKey(userId, plan);
    const endDate = calculateExpiry(plan);

    const license = await License.create({
      userId,
      plan,
      mtLogin,
      broker,
      licenseKey,
      startDate: new Date(),
      endDate,
      selarOrderId: orderId,
    });

    // Update subscription to active and attach licenseKey
    await Subscription.findOneAndUpdate(
  { userId, plan, status: "pending" },
  { status: "active", expiryDate: endDate }
);

await Transaction.findOneAndUpdate(
  { userId, "metadata.plan": plan, status: "pending" },
  { status: "completed" }
);

    // Optional: generate EA and store on server (one-time)
    await CFAAccount.generateEA(userId, licenseKey);

    console.log(`License & EA created for user ${userId}, plan ${plan}`);
    res.status(200).send("License created");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// Get active license
exports.getUserLicense = async (req, res) => {
  try {
    const license = await License.findOne({
      userId: req.user.id,
      endDate: { $gte: new Date() },
    }).sort({ createdAt: -1 });

    if (!license) return res.json({ success: false, message: "No active license" });

    res.json({ success: true, license });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
