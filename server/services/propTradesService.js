const axios = require("axios");
const { PropSettings } = require("../models/PropTradesAccount");

// Replace with your API URLs
const PROP_ACCOUNTS_API = "http://localhost:5000/api/propaccounts";
const PROP_SETTINGS_API = "http://localhost:5000/api/propsetting";

async function getPropTableTrades() {
  try {
    // Fetch live accounts from API
    const accountsRes = await axios.get(PROP_ACCOUNTS_API);
    const accounts = accountsRes.data.accounts || [];

    // Fetch prop settings
    const settingsRes = await axios.get(PROP_SETTINGS_API);
    const settings = settingsRes.data.data || [];

    const result = accounts.map((accObj) => {
      const account = accObj.account || {};
      const summaryData = accObj.summary?.data || {};
      const tradesData = account.trades?.data || [];

      const propSetting = settings.find((s) => s.accountLogin === account.login) || {};

      // Stats calculations
      const initialBalance = propSetting.initialBalance || summaryData.balance || 0;
      const profitLoss = tradesData.reduce((sum, t) => sum + (t.profit || 0), 0);
      const gainDrawdownPercent =
        initialBalance > 0 ? ((summaryData.balance - initialBalance) / initialBalance) * 100 : 0;

      // Chart data
      const chartData = tradesData.map((t) => ({ name: t.symbol, profit: t.profit })) || [];

      return {
        broker: account.broker || "Unknown",
        login: account.login || "Unknown",
        
        summary: {
         data: {
         balance: summaryData.balance || 0,
         equity: summaryData.equity || 0,
         margin: summaryData.margin || 0,
         freeMargin: summaryData.freeMargin || 0,
        }
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
        platform: account.platform || "PropFirm",
        accountType: account.accountType || "demo",
        propSettings: {
  initialBalance: initialBalance,
  profitTarget: ((propSetting.profitTarget || 0) / 100) * initialBalance,
  dailyLossLimit: ((propSetting.dailyDrawdown || 0) / 100) * initialBalance,
  overallLossLimit: ((propSetting.maxDrawdown || 0) / 100) * initialBalance,
        },
        stats: {
          initialBalance,
          profitLossDollar: profitLoss,
          gainDrawdownPercent: parseFloat(gainDrawdownPercent.toFixed(2)),
          profitTargetDollar: ((propSetting.profitTarget || 0) / 100) * initialBalance,
          dailyLossLimitDollar: ((propSetting.dailyDrawdown || 0) / 100) * initialBalance,
          overallLossLimitDollar: ((propSetting.maxDrawdown || 0) / 100) * initialBalance,
          status: propSetting.status || "inactive",
        },
        chartData,
      };
    });

    return { success: true, data: result };
  } catch (err) {
    console.error("Error fetching live prop table trades:", err);
    return { success: false, data: [], message: "Failed to fetch prop table trades" };
  }
}

module.exports = { getPropTableTrades };

