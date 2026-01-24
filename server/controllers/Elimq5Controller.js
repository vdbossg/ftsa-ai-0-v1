// server/controllers/Elimq5Controller.js
const Elimq5Service = require("../services/Elimq5Service");

class Elimq5Controller {
  static async generateEA(req, res) {
    try {
      const token = req.headers.authorization?.split(" ")[1]; // Bearer token
      if (!token) return res.status(401).json({ success: false, error: "Unauthorized" });

      const result = await Elimq5Service.injectLatestLicense(token);
      res.json({ success: true, ...result });
    } catch (err) {
      console.error("Controller Error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

module.exports = Elimq5Controller;
