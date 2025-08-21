const path = require("path");
const { generateEA } = require("../services/eaGenerator"); // make sure .js extension is correct
const User = require("../models/User");
const License = require("../models/License");

async function downloadEA(req, res) {
  try {
    const { platform } = req.query; // "mt4" or "mt5"
    const userId = req.user.id; // from auth middleware

    const user = await User.findById(userId).populate("subscription");
    if (!user || !user.subscription || !user.subscription.isActive) {
      return res.status(403).json({ error: "No active subscription" });
    }

    const license = await License.findOne({ userId });
    if (!license) {
      return res.status(404).json({ error: "License not found" });
    }

    const filePath = await generateEA(
      userId,
      license.key,
      license.allowedAccount,
      platform
    );

    return res.download(filePath);
  } catch (err) {
    console.error("EA Download Error:", err);
    return res.status(500).json({ error: "Failed to download EA" });
  }
}

module.exports = { downloadEA };
