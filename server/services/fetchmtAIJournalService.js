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
        normalizedTrades.push({
          date: trade.time ? new Date(trade.time) : new Date(),
          broker,
          login,
          ticket: trade.ticket || Math.floor(Math.random() * 1000000), // fallback ticket
          pair: trade.symbol || "-",
          profit: trade.profit || 0,
          accountType: "mt",
          side: trade.type || "-",
          lotSize: trade.volume || 0,
          entry: trade.open_price || 0,
          tp: trade.tp || 0,
          sl: trade.sl || 0,
          exit: trade.current_price || 0,
          rr: 0, // not provided by API
          pips: 0, // optional, could calculate later
          riskPercent: 0, // optional
          session: "-", // optional
          aiStrategy: "-", // optional
          executionNotes: "-", // optional
          conclusions: "-", // optional
          balanceHistory,
        });
      });
    });

    return normalizedTrades;
  } catch (err) {
    console.error("Error fetching MT trades:", err.message);
    return [];
  }
};

module.exports = { fetchExternalMTTrades };
