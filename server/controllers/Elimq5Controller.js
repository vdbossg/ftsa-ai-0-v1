// server/controllers/Elimq5Controller.js
const Elimq5Service = require("../services/Elimq5Service");


class Elimq5Controller {
  static async generateEA(req, res) {
    try {
      // Call service directly; userId is read automatically from currentWatcherUser.json
const result = await Elimq5Service.injectLatestLicense();


      res.json({ success: true, ...result });
    } catch (err) {
      console.error("Controller Error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

module.exports = Elimq5Controller;
