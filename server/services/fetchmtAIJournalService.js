// server/services/fetchmtAIJournalService.js
const axios = require("axios");

// Fetch MT trades from the external API and normalize for frontend
const fetchExternalMTTrades = async () => {
  try {
    const response = await axios.get("http://localhost:5000/api/mttabletrades");
    const apiData = response.data;

    // Flatten and normalize API data to match frontend
    const normalizedTrades = [];

    apiData.forEach(account => {
      const broker = account.broker;
      const login = account.login;
      const balanceHistory = account.summary?.data?.balance ? [account.summary.data.balance] : [];

      account.trades.forEach(trade => {
  // Only include closed trades
  if (!trade.exit || trade.status !== "closed") return; // skip open trades

  normalizedTrades.push({
    date: trade.time ? new Date(trade.time) : new Date(),
    broker,
    login,
    ticket: trade.ticket || Math.floor(Math.random() * 1000000),
    pair: trade.symbol || "-",
    profit: trade.profit || 0,
    accountType: "mt",
    side: trade.type || "-",
    lotSize: trade.volume || 0,
    entry: trade.open_price || 0,
    tp: trade.tp || 0,
    sl: trade.sl || 0,
    exit: trade.current_price || 0,
    rr: 0,
    pips: 0,
    riskPercent: 0,
    session: "-",
    aiStrategy: "-",
    executionNotes: "-",
    conclusions: "-",
    balanceHistory: balanceHistory,
  });
});
})
    return normalizedTrades;
  } catch (err) {
    console.error("Error fetching MT trades:", err.message);
    return [];
  }
};

module.exports = { fetchExternalMTTrades };
