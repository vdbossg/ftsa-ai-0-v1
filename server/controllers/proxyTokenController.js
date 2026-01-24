const ProxyTokenService = require("../services/proxyTokenService");

// GET /api/proxy/token/my
exports.getMyToken = async (req, res) => {
  try {
    const userId = req.user.id; // comes from auth middleware
    const tokenData = await ProxyTokenService.getLatestToken(userId);

    if (!tokenData) return res.status(404).json({ success: false, error: "Token not found" });

    res.json({
      success: true,
      data: {
        userId: tokenData.userId,
        email: tokenData.email,
        firstName: tokenData.firstName,
        token: tokenData.token,
        updatedAt: tokenData.updatedAt
      }
    });
  } catch (err) {
    console.error("ProxyTokenController error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
