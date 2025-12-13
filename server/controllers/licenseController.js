//C:\Users\LENOVO\Desktop\FTSA_AI_0.v1\server\controllers\licenseController.js
const License = require("../models/License");
const User = require("../models/User");

// Generate a unique license key
const generateLicenseKey = (userId, plan) => {
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "");
  return `${userId}_${plan}_${timestamp}`;
};

// Calculate expiry based on plan
const calculateExpiry = (plan) => {
  const now = new Date();
  if (plan === "Basic") now.setDate(now.getDate() + 30); // 30 days
  else if (plan === "Plus") now.setFullYear(now.getFullYear() + 1); // 360 days ~ 1 year
  else if (plan === "Unlimited") now.setFullYear(now.getFullYear() + 100); // Lifetime
  return now;
};

// Get active license for user
exports.getUserLicense = async (req, res) => {
  try {
    const license = await License.findOne({
      userId: req.user.id,
      active: true,
      endDate: { $gte: new Date() },
    }).sort({ createdAt: -1 });

    if (!license) return res.json({ success: false, message: "No active license" });

    res.json({ success: true, license });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Handle Selar webhook
exports.selarWebhook = async (req, res) => {
  try {
    const data = req.body;

    // Validate webhook signature here if needed

    // Only proceed if payment successful
    if (data.status !== "paid") {
      return res.status(200).send("Payment not completed, ignoring");
    }

    const { userId, mtLogin, broker, plan, orderId } = data.metadata;

    // Prevent duplicate license creation for same order
    const existing = await License.findOne({ selarOrderId: orderId });
    if (existing) return res.status(200).send("License already created");

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

    // Optional: send email notification to user
    console.log(`License created for user ${userId}, plan ${plan}`);

    res.status(200).send("License created");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};
