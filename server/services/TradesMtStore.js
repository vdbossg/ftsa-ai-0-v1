// server/services/TradesMtStore.js
const axios = require("axios");
const MTJournal = require("../models/mtAIJournalModel");

const fetchClosedMTTrades = async () => {
  try {
    const res = await axios.get("https://ftsa-ai-backend.onrender.com/api/closed-mt-trades");
    return res.data?.data || [];
  } catch (err) {
    console.error("Failed to fetch closed MT trades:", err.message);
    return [];
  }
};

const storeClosedMTTrades = async () => {
  const closedTrades = await fetchClosedMTTrades();
  const savedTrades = [];

  for (const trade of closedTrades) {
    const initialBalance = trade.summary?.data?.balance || 0;

    const existing = await MTJournal.findOne({ ticket: trade.ticket });
    if (existing) {
      savedTrades.push(existing.toObject());
      continue;
    }

    // --- Calculate RRR, pips, and riskPercent ---
const tradeSL = trade.sl || 0;
const tradeTP = trade.tp || 0;
const tradeEntry = trade.open_price || 0;

// pips calculation (absolute movement from entry to exit in points)
const pips = trade.type?.toUpperCase() === "BUY"
  ? (trade.current_price - tradeEntry) * 10_000
  : (tradeEntry - trade.current_price) * 10_000;

// RRR = TP pips / SL pips
const rr = tradeSL !== 0 ? Math.abs((tradeTP - tradeEntry) / (tradeEntry - tradeSL)) : 0;

// Risk % = loss relative to initial balance
const riskPercent = initialBalance > 0 && tradeSL !== 0
  ? (Math.abs(tradeEntry - tradeSL) * trade.volume * 100_000 / initialBalance) * 100
  : 0;

const journalEntry = new MTJournal({
  date: new Date(trade.time),
  broker: trade.broker || "Unknown",
  login: trade.login || "Unknown",
  ticket: trade.ticket,
  pair: trade.symbol || "-",
  profit: trade.profit,
  side: trade.type || "-",
  lotSize: trade.volume || 0,
  entry: tradeEntry,
  tp: tradeTP,
  sl: tradeSL,
  exit: trade.current_price || 0,
  rr: parseFloat(rr.toFixed(2)),
  pips: parseFloat(pips.toFixed(2)),
  riskPercent: parseFloat(riskPercent.toFixed(2)),
  session: trade.session || "-",
  aiStrategy: trade.aiStrategy || "-",
  executionNotes: trade.executionNotes || "-",
  conclusions: trade.conclusions || "-",
  balanceHistory: [initialBalance, initialBalance + (trade.profit || 0)],
  status: "closed",
});

    try {
      await journalEntry.save();
      savedTrades.push(journalEntry.toObject());
      console.log(`Stored closed MT trade: ${trade.ticket}`);
    } catch (err) {
      console.error(`Failed to store MT trade ${trade.ticket}:`, err.message);
    }
  }

  return savedTrades;
};

module.exports = { storeClosedMTTrades, fetchClosedMTTrades };
