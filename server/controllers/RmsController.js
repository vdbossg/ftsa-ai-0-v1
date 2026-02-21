// FTSA_AI_0.v1\server\controllers\RmsController.js
const Rms = require("../models/Rms");
const fs = require("fs");
const path = require("path");

// Helper to get current userId from JSON watcher
const getCurrentUserId = () => {
  const watcherPath = path.join(__dirname, "../services/currentWatcherUser.json");
  try {
    const data = fs.readFileSync(watcherPath, "utf8");
    const json = JSON.parse(data);
    return json.userId || null;
  } catch (err) {
    console.error("Failed to read currentWatcherUser.json:", err);
    return null;
  }
};

// Save or update RMS settings for current user
exports.saveRmsSettings = async (req, res) => {
  try {
    const { maxTrades, risk, dailyMaxLoss, tpTargets } = req.body;
    const userId = getCurrentUserId();

    if (!userId) {
      return res.status(400).json({ success: false, error: "No user logged in" });
    }

    // Check if RMS already exists for this user
    let rmsDoc = await Rms.findOne({ userId });

    if (rmsDoc) {
      // Update existing document
      rmsDoc.maxTrades = maxTrades;
      rmsDoc.risk = risk;
      rmsDoc.dailyMaxLoss = dailyMaxLoss;
      rmsDoc.tpTargets = tpTargets;
      await rmsDoc.save();
    } else {
      // Create new RMS document for user
      rmsDoc = new Rms({ userId, maxTrades, risk, dailyMaxLoss, tpTargets });
      await rmsDoc.save();
    }

    return res.json({ success: true, data: rmsDoc });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Failed to save RMS settings" });
  }
};

// Fetch latest RMS settings for current user
exports.getLatestRmsSettings = async (req, res) => {
  try {
    const userId = getCurrentUserId();

    if (!userId) {
      return res.status(400).json({ success: false, error: "No user logged in" });
    }

    const latest = await Rms.findOne({ userId });

    return res.json({ success: true, data: latest });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Failed to fetch RMS settings" });
  }
};