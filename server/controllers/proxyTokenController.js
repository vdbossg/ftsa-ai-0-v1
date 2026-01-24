const ProxyTokenService = require("../services/proxyTokenService");
const User = require("../models/User");

// GET /api/proxy/token/my
exports.getMyToken = async (req, res) => {
  try {
    // Fetch the most recently saved token in the database
    const tokenData = await ProxyTokenService.getLatestToken(); // no userId passed

    if (!tokenData) {
      return res.status(404).json({ success: false, message: "No token found" });
    }

    // Fetch user info for this token
    const user = await User.findById(tokenData.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Return the response in the desired format
    res.json({
      success: true,
      data: {
        userId: user._id,
        name: user.firstName || user.name,
        email: user.email,
        token: tokenData.token
      }
    });
  } catch (err) {
    console.error("ProxyTokenController error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
