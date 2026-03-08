//FTSA_AI_0.v1\server\services\mttabletrades.service.js
const axios = require("axios");

/**
 * Fetch raw MT accounts from backend
 */
const fetchMTAccountsRaw = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/mtaccounts");
    if (!res.data || !res.data.accounts) return [];
    return res.data.accounts; // array of { account, summary, trades }
  } catch (err) {
    console.error("Error fetching MT accounts:", err.message || err);
    return [];
  }
};

/**
 * Transform MT accounts to frontend expected format
 */
const getAllMTAccountsTrades = async () => {
  const rawAccounts = await fetchMTAccountsRaw();

  return rawAccounts.map(item => {
    const accountData = item.account || {};
    const summaryData = item.summary?.data || {};
    const tradesData = Array.isArray(item.trades?.data)
      ? item.trades.data
      : [];

    return {
      broker: accountData.broker || "",
      login: accountData.login || "",
      summary: {
        data: {
          balance: summaryData.balance || 0,
          equity: summaryData.equity || 0,
          margin: summaryData.margin || 0,
          freeMargin: summaryData.freeMargin || 0
        }
      },
      trades: tradesData.map(trade => ({
        symbol: trade.symbol || "",
        ticket: trade.ticket || 0,
        time: trade.time || "",
        type: trade.type || "",
        volume: trade.volume || 0,
        open_price: trade.open_price || 0,
        current_price: trade.current_price || 0,
        sl: trade.sl || 0,
        tp: trade.tp || 0,
        profit: trade.profit || 0
      }))
    };
  });
};

module.exports = {
  getAllMTAccountsTrades
};
