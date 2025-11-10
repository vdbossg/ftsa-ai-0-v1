// server/services/TradesMtStore.js
const axios = require("axios");
const MTJournal = require("../models/mtAIJournalModel");

/**
 * Fetch live MT trades from the MT table endpoint
 */
const fetchLiveMTTrades = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/mttabletrades");
    return res.data || [];
  } catch (err) {
    console.error("Failed to fetch MT trades:", err.message);
    return [];
  }
};

/**
 * Store all closed MT trades into MongoDB
 */
const storeClosedMTTrades = async () => {
  const liveAccounts = await fetchLiveMTTrades();
  const savedTrades = [];

  for (const account of liveAccounts) {
    const trades = account.trades || [];
    const initialBalance = account.summary?.data?.balance || 0;

    for (const trade of trades) {
      // Only include closed trades (has current_price and profit)
      if (!trade.current_price || trade.profit == null) continue;

      // Skip if already exists
      const existing = await MTJournal.findOne({ ticket: trade.ticket });
      if (existing) {
        savedTrades.push(existing.toObject());
        continue;
      }

      // Create journal entry
      const journalEntry = new MTJournal({
        date: new Date(trade.time),
        broker: account.broker || "Unknown",
        login: account.login || "Unknown",
        ticket: trade.ticket,
        pair: trade.symbol || "-",
        profit: trade.profit,
        side: trade.type || "-",
        lotSize: trade.volume || 0,
        entry: trade.open_price || 0,
        tp: trade.tp || 0,
        sl: trade.sl || 0,
        exit: trade.current_price || 0,
        rr: trade.rr || 0,
        pips: trade.pips || 0,
        riskPercent: trade.riskPercent || 0,
        session: trade.session || "-",
        aiStrategy: trade.aiStrategy || "-",
        executionNotes: trade.executionNotes || "-",
        conclusions: trade.conclusions || "-",
        balanceHistory: [initialBalance, initialBalance + (trade.profit || 0)],
      });

      try {
        await journalEntry.save();
        savedTrades.push(journalEntry.toObject());
        console.log(`Stored closed MT trade: ${trade.ticket}`);
      } catch (err) {
        console.error(`Failed to store MT trade ${trade.ticket}:`, err.message);
      }
    }
  }

  return savedTrades;
};

module.exports = { storeClosedMTTrades, fetchLiveMTTrades };
