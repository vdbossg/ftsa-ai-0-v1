// server/controllers/Elimq5Controller.js
const Elimq5Service = require("../services/Elimq5Service");


class Elimq5Controller {
  static async generateEA(req, res) {
    try {
      // Get userId from request body (sent automatically from frontend after payment)
const userId = req.body.userId || req.query.userId;
if (!userId) return res.status(400).json({ success: false, error: "userId is required" });


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
