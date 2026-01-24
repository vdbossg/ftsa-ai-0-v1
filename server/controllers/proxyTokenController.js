// server/controllers/proxyTokenController.js
const ProxyTokenService = require("../services/proxyTokenService");
const User = require("../models/User");

/**
 * GET /api/proxy/token/my
 * Returns the latest token for the currently logged-in user.
 * Requires auth middleware to set req.user
 */
exports.getMyToken = async (req, res) => {
  try {
    // Ensure req.user exists (auth middleware should set this)
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userId = req.user.id;

    // Fetch the latest token for this user
    const tokenData = await ProxyTokenService.getLatestToken(userId);

    if (!tokenData) {
      return res.status(404).json({ success: false, message: "No token found" });
    }

    // Return the response in the desired format
    res.json({
      success: true,
      data: {
        userId: tokenData.userId,
        name: tokenData.firstName,
        email: tokenData.email,
        token: tokenData.token,
        updatedAt: tokenData.updatedAt
      }
    });
  } catch (err) {
    console.error("ProxyTokenController error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
