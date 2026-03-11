const RiskStateCenter = require("../models/modelstoggleButton");

class ToggleButtonService {
  async toggleRSC(userId, status) {
    if (!userId || !status) throw new Error("Missing userId or status");

    const updated = await RiskStateCenter.findOneAndUpdate(
      { userId },
      { "autoTrade.status": status },
      { new: true, upsert: true }
    );

    return updated;
  }
}

module.exports = new ToggleButtonService();