const axios = require("axios");
const path = require("path");
const fs = require("fs");

// Helper to get current logged-in userId from currentWatcherUser.json
const getCurrentUserId = () => {
  const watcherPath = path.join(__dirname, "currentWatcherUser.json"); 
  try {
    const data = fs.readFileSync(watcherPath, "utf8");
    const json = JSON.parse(data);
    return json.userId || null;
  } catch (err) {
    console.error("❌ Failed to read currentWatcherUser.json:", err);
    return null;
  }
};

// API endpoints
const MT5_TRADES_API = "https://ftsa-ai-backend.onrender.com/api/ftsaaicli/mt5trades?userId=";
const PROP_SETTINGS_API = "https://ftsa-ai-backend.onrender.com/api/propsetting";

async function getPropTableTrades() {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      return { success: false, data: [], message: "No logged-in user found" };
    }

    // Fetch live trades for the current user
    const tradesRes = await axios.get(`${MT5_TRADES_API}${userId}`);
    const accountData = tradesRes.data?.data;

    if (!accountData) {
      return { success: false, data: [], message: "No account data found for user" };
    }

    // Fetch prop settings for the same user
    const settingsRes = await axios.get(PROP_SETTINGS_API);
    const allSettings = settingsRes.data?.data || [];
    const userSetting = allSettings.find((s) => s.accountLogin === accountData.login) || {};

    const tradesData = accountData.trades || [];
    const summaryData = accountData.summary || {};

    // Stats calculations
    const initialBalance = userSetting.initialBalance || summaryData.balance || 0;
    const profitLoss = tradesData.reduce((sum, t) => sum + (t.profit || 0), 0);
    const gainDrawdownPercent =
      initialBalance > 0 ? ((summaryData.balance - initialBalance) / initialBalance) * 100 : 0;

    // Chart data
    const chartData = tradesData.map((t) => ({ name: t.symbol, profit: t.profit })) || [];

    const result = {
      broker: accountData.broker || "Unknown",
      login: accountData.login || "Unknown",
      summary: {
        data: {
          balance: summaryData.balance || 0,
          equity: summaryData.equity || 0,
          margin: summaryData.margin || 0,
          freeMargin: summaryData.freeMargin || 0,
        },
      },
      trades: tradesData.map((t) => ({
        ticket: t.ticket || 0,
        symbol: t.symbol || "Unknown",
        type: t.type || "BUY",
        volume: t.volume || 0,
        open_price: t.open_price || 0,
        current_price: t.current_price || 0,
        sl: t.sl || 0,
        tp: t.tp || 0,
        profit: t.profit || 0,
        time: t.time || "",
      })),
      platform: "MT5",
      accountType: "live",
      propSettings: {
        initialBalance: initialBalance,
        profitTarget: ((userSetting.profitTarget || 0) / 100) * initialBalance,
        dailyLossLimit: ((userSetting.dailyDrawdown || 0) / 100) * initialBalance,
        overallLossLimit: ((userSetting.maxDrawdown || 0) / 100) * initialBalance,
      },
      stats: {
        initialBalance,
        profitLossDollar: profitLoss,
        gainDrawdownPercent: parseFloat(gainDrawdownPercent.toFixed(2)),
        profitTargetDollar: ((userSetting.profitTarget || 0) / 100) * initialBalance,
        dailyLossLimitDollar: ((userSetting.dailyDrawdown || 0) / 100) * initialBalance,
        overallLossLimitDollar: ((userSetting.maxDrawdown || 0) / 100) * initialBalance,
        status: userSetting.status || "inactive",
      },
      chartData,
    };

    return { success: true, data: [result] };
  } catch (err) {
    console.error("Error fetching live prop table trades:", err);
    return { success: false, data: [], message: "Failed to fetch prop table trades" };
  }
}

module.exports = { getPropTableTrades };