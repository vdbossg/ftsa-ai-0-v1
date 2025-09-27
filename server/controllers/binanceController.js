// server/controllers/binanceController.js
const { saveUserKeys, fetchData, refresh } = require("../services/binanceService.js");

// --- Connect Binance API keys ---
async function connectBinance(req, res) {
  try {
    const userId = req.user._id;
    const { apiKey, apiSecret } = req.body;

    if (!apiKey || !apiSecret) {
      return res
        .status(400)
        .json({ success: false, message: "API Key and Secret required" });
    }

    await saveUserKeys(userId, apiKey, apiSecret);
    const data = await fetchData(userId);

    return res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: err.message || "Failed to connect Binance" });
  }
}

// --- Get Binance account data ---
async function fetchBinanceData(req, res) {
  try {
    const userId = req.user._id;
    const data = await fetchData(userId);
    return res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: err.message || "Failed to fetch Binance data" });
  }
}

// --- Refresh Binance data ---
async function refreshBinanceData(req, res) {
  try {
    const userId = req.user._id;
    const data = await refresh(userId);
    return res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: err.message || "Failed to refresh Binance data" });
  }
}

module.exports = {
  connectBinance,
  fetchBinanceData,
  refreshBinanceData,
};
