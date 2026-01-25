const User = require("../models/User");
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

// ---------------------- Get Current User Latest License ----------------------
exports.getUserLicense = async (req, res) => {
  try {
    const userId = req.user?._id; // guaranteed by authenticateToken
    if (!userId) return res.status(401).json({ success: false, error: "Not logged in" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    const { getUserLatestLicense } = require("../services/licenseService");

    // Fetch **only the latest active license** for this user
    const license = await getUserLatestLicense(user._id);

    res.json({ success: true, data: license || null });
  } catch (err) {
    console.error("Failed to fetch user license:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
