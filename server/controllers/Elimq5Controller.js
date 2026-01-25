// server/controllers/Elimq5Controller.js
const Elimq5Service = require("../services/Elimq5Service");


class Elimq5Controller {
  static async generateEA(req, res) {
    try {
      // Get logged-in user's ID from req.user (authenticateToken ensures this exists)
const userId = req.user?._id;
if (!userId) return res.status(401).json({ success: false, error: "Not logged in" });

// Pass userId instead of token
const result = await Elimq5Service.injectLatestLicense(userId);

      res.json({ success: true, ...result });
    } catch (err) {
      console.error("Controller Error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

module.exports = Elimq5Controller;
