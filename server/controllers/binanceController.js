// server/controllers/binanceController.js
const {
  saveUserKeys,
  getUserKeys,
  fetchPublicPrices,
  fetchAccountWithUsd,
} = require("../services/binanceService.js");


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

    // Save user’s Binance keys
    await saveUserKeys(userId, apiKey, apiSecret);

    // Fetch account data immediately to confirm keys work
    const accountData = await fetchAccountWithUsd(apiKey, apiSecret);

    return res.json({ success: true, data: accountData });
  } catch (err) {
    console.error("Error connecting Binance:", err);
    return res
      .status(500)
      .json({ success: false, message: err.message || "Failed to connect Binance" });
  }
}


// --- Get Binance account data ---

async function fetchBinanceData(req, res) {
  try {
    // Always fetch public Binance prices
    const publicData = await fetchPublicPrices();

    // Try to fetch user account data if keys exist
    let accountData = null;
    try {
      const keys = await getUserKeys(req.user._id);
      accountData = await fetchAccountWithUsd(keys.apiKey, keys.apiSecret);
    } catch (err) {
      console.warn("User has no Binance keys or failed to fetch account:", err.message);
    }

    // Return consistent JSON structure
    return res.json({ success: true, data: { public: publicData, account: accountData } });

  } catch (err) {
    console.error("Error fetching Binance data:", err);
    return res
      .status(500)
      .json({ success: false, message: err.message || "Failed to fetch Binance data" });
  }
}


// --- Refresh Binance data ---
async function refreshBinanceData(req, res) {
  try {
    // Always fetch public Binance prices
    const publicData = await fetchPublicPrices();

    // Try to fetch user account data if keys exist
    let accountData = null;
    try {
      const keys = await getUserKeys(req.user._id);
      accountData = await fetchAccountWithUsd(keys.apiKey, keys.apiSecret);
    } catch (err) {
      console.warn("User has no Binance keys or failed to fetch account:", err.message);
    }

    // Return consistent JSON structure
    return res.json({ success: true, data: { public: publicData, account: accountData } });

  } catch (err) {
    console.error("Error refreshing Binance data:", err);
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
