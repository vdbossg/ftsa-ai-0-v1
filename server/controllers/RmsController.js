const Rms = require("../models/Rms");

// Save or update RMS settings
exports.saveRmsSettings = async (req, res) => {
  try {
    const { maxTrades, risk, dailyMaxLoss, tpTargets } = req.body;

    // Create new RMS document
    const newRms = new Rms({ maxTrades, risk, dailyMaxLoss, tpTargets });
    await newRms.save();

    return res.json({ success: true, data: newRms });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Failed to save RMS settings" });
  }
};

// Fetch latest RMS settings
exports.getLatestRmsSettings = async (req, res) => {
  try {
    const latest = await Rms.findOne().sort({ createdAt: -1 }); // latest document
    return res.json({ success: true, data: latest });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Failed to fetch RMS settings" });
  }
};
