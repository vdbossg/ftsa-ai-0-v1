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

    // Save keys
    await saveUserKeys(userId, apiKey, apiSecret);

    // Validate keys immediately
    const accountData = await fetchAccountWithUsd(apiKey, apiSecret);
    console.log("✅ Connected Binance account data:", accountData);

    // Ensure normalized object
    // Ensure normalized object
const normalized = normalizeAccount(accountData);

// ✅ Fetch fresh public data to return full structure
const publicData = await fetchPublicPrices();
const normalizedPublic = normalizePublic(publicData);

// ✅ Standardize response shape with /api/binance
return res.json({
  success: true,
  data: {
    public: normalizedPublic,
    account: normalized,
  },
});

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
    let publicData = await fetchPublicPrices();
    let accountData = null;

    try {
      const keys = await getUserKeys(req.user._id);
      accountData = await fetchAccountWithUsd(keys.apiKey, keys.apiSecret);
    } catch (err) {
      console.warn("⚠️ No Binance keys or failed to fetch account:", err.message);
    }

    // Normalize both sections
    const normalizedPublic = normalizePublic(publicData);
    const normalizedAccount = normalizeAccount(accountData);

    const response = { public: normalizedPublic, account: normalizedAccount };
    console.log("📊 Returning Binance data:", {
      hasPublic: !!normalizedPublic,
      hasAccount: !!normalizedAccount,
      publicKeys: Object.keys(normalizedPublic || {}),
      accountKeys: Object.keys(normalizedAccount || {}),
    });

    return res.json({ success: true, data: response });
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
    let publicData = await fetchPublicPrices();
    let accountData = null;

    try {
      const keys = await getUserKeys(req.user._id);
      accountData = await fetchAccountWithUsd(keys.apiKey, keys.apiSecret);
    } catch (err) {
      console.warn("⚠️ User has no Binance keys or failed to fetch account:", err.message);
    }

    const normalizedPublic = normalizePublic(publicData);
    const normalizedAccount = normalizeAccount(accountData);

    console.log("📊 Returning refreshed Binance data:", {
      hasPublic: !!normalizedPublic,
      hasAccount: !!normalizedAccount,
    });

    return res.json({
      success: true,
      data: { public: normalizedPublic, account: normalizedAccount },
    });
  } catch (err) {
    console.error("Error refreshing Binance data:", err);
    return res
      .status(500)
      .json({ success: false, message: err.message || "Failed to refresh Binance data" });
  }
}

// --- Helpers for consistent structure ---
function normalizePublic(data) {
  if (!data || typeof data !== "object") {
    return { prices: {}, holdings: [] };
  }
  return {
    prices: data.prices || {},
    holdings: data.holdings || [],
  };
}


function normalizeAccount(data) {
  if (!data || typeof data !== "object") {
    return {
      email: "N/A",
      totalBalance: 0,
      availableBalance: 0,
      dailyPnl: 0,
      weeklyPnl: 0,
      holdings: [],
      wallets: { spots: 0, funding: 0, futures: 0 },
    };
  }
  return {
    email: data.email || "N/A",
    totalBalance: data.totalBalance || 0,
    availableBalance: data.availableBalance || 0,
    dailyPnl: data.dailyPnl || 0,
    weeklyPnl: data.weeklyPnl || 0,
    holdings: Array.isArray(data.holdings) ? data.holdings : [],
    wallets: data.wallets || { spots: 0, funding: 0, futures: 0 },
  };
}


module.exports = {
  connectBinance,
  fetchBinanceData,
  refreshBinanceData,
};
