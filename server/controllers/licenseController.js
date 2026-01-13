// server/controllers/licenseController.js
const License = require("../models/License");
const Subscription = require("../models/Subscription");
const User = require("../models/User");
const CFAAccount = require("../services/cfaAccount"); // Optional EA service
const Transaction = require("../models/Transaction"); // if not already imported
const { handlePaystackWebhook, getUserLicense } = require("../services/licenseService");

// ---------------------- Paystack Webhook Handler ----------------------
exports.paystackWebhook = async (req, res) => {
  try {
    const license = await handlePaystackWebhook(req);
    if (license) {
      return res.status(200).send("License created via Paystack");
    } else {
      return res.status(200).send("Webhook received, no license action required");
    }
  } catch (err) {
    console.error("Paystack webhook error:", err);
    return res.status(400).send("Failed to process webhook");
  }
};

// ---------------------- Get Current User License ----------------------
exports.getUserLicense = async (req, res) => {
  try {
    const license = await getUserLicense(req.user.id);
    if (!license) return res.json({ success: false, message: "No active license" });

    res.json({ success: true, license });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
