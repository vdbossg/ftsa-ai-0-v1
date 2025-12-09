// server/services/TradesPropStore.js
const axios = require("axios");
const PropJournal = require("../models/propAIJournalModel");

const fetchClosedPropTrades = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/closed-prop-trades");
    return res.data?.data || [];
  } catch (err) {
    console.error("Failed to fetch closed Prop trades:", err.message);
    return [];
  }
};

const storeClosedPropTrades = async () => {
  const closedTrades = await fetchClosedPropTrades();
  const savedTrades = [];

  for (const trade of closedTrades) {
    const initialBalance = trade.propSettings?.initialBalance || trade.summary?.data?.balance || 0;

    // Skip if trade already exists
    const existing = await PropJournal.findOne({ ticket: trade.ticket });
    if (existing) {
      savedTrades.push(existing.toObject());
      continue;
    }

    const gainDrawdownPercent = initialBalance > 0 ? ((trade.profit || 0) / initialBalance) * 100 : 0;

    // --- Calculate RRR, pips, and riskPercent ---
const tradeSL = trade.sl || 0;
const tradeTP = trade.tp || 0;
const tradeEntry = trade.open_price || 0;

// pips calculation (absolute movement from entry to exit)
const pips = trade.type?.toUpperCase() === "BUY"
  ? (trade.current_price - tradeEntry) * 10_000
  : (tradeEntry - trade.current_price) * 10_000;

// RRR = TP pips / SL pips
const rr = tradeSL !== 0 ? Math.abs((tradeTP - tradeEntry) / (tradeEntry - tradeSL)) : 0;

// Risk % = loss relative to initial balance
const riskPercent = initialBalance > 0 && tradeSL !== 0
  ? (Math.abs(tradeEntry - tradeSL) * trade.volume * 100_000 / initialBalance) * 100
  : 0;

const journalEntry = new PropJournal({
  ticket: trade.ticket,
  date: new Date(trade.time),
  broker: trade.broker || "Unknown",
  login: trade.login || "Unknown",
  accountType: trade.accountType || "demo",
  platform: trade.platform || "PropFirm",
  pair: trade.symbol,
  profit: trade.profit,
  side: trade.type,
  lotSize: trade.volume,
  entry: tradeEntry,
  tp: tradeTP,
  sl: tradeSL,
  exit: trade.current_price,
  rr: parseFloat(rr.toFixed(2)),
  pips: parseFloat(pips.toFixed(2)),
  riskPercent: parseFloat(riskPercent.toFixed(2)),
  session: trade.session || "-",
  balanceHistory: [initialBalance, initialBalance + (trade.profit || 0)],
  profitTarget: trade.propSettings?.profitTarget || 0,
  initialProfit: trade.profit,
  gainDrawdownPercent: parseFloat(gainDrawdownPercent.toFixed(2)),
  aiStrategy: trade.aiStrategy || "-",
  executionNotes: trade.executionNotes || "-",
  conclusions: trade.conclusions || "-",
  chartData: trade.chartData || [],
  status: "closed",
});


    try {
      await journalEntry.save();
      savedTrades.push(journalEntry.toObject());
      console.log(`Stored closed Prop trade: ${trade.ticket}`);
    } catch (err) {
      console.error(`Failed to store Prop trade ${trade.ticket}:`, err.message);
    }
  }

  return savedTrades;
};

module.exports = { storeClosedPropTrades, fetchClosedPropTrades };
