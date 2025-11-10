// server/services/TradesPropStore.js
const axios = require("axios");
const PropJournal = require("../models/propAIJournalModel");

/**
 * Fetch live Prop trades from the Prop table endpoint
 */
const fetchLivePropTrades = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/proptabletrades");
    return res.data?.data || [];
  } catch (err) {
    console.error("Failed to fetch Prop trades:", err.message);
    return [];
  }
};

/**
 * Store all closed Prop trades into MongoDB
 */
const storeClosedPropTrades = async () => {
  const liveTrades = await fetchLivePropTrades();
  const savedTrades = [];

  for (const account of liveTrades) {
    const trades = account.trades || [];
    const initialBalance = account.propSettings?.initialBalance || account.summary?.data?.balance || 0;

    for (const trade of trades) {
      // Skip running trades
      if (!trade.current_price || trade.profit == null) continue;

      // Check if trade already exists
      const existing = await PropJournal.findOne({ ticket: trade.ticket });
      if (existing) {
        savedTrades.push(existing.toObject());
        continue;
      }

      // Calculate gain/drawdown %
      const gainDrawdownPercent = initialBalance > 0 ? ((trade.profit || 0) / initialBalance) * 100 : 0;

      // Create journal entry
      const journalEntry = new PropJournal({
        ticket: trade.ticket,
        date: new Date(trade.time),
        broker: account.broker || "Unknown",
        login: account.login || "Unknown",
        accountType: account.accountType || "demo",
        platform: account.platform || "PropFirm",
        pair: trade.symbol,
        profit: trade.profit,
        side: trade.type,
        lotSize: trade.volume,
        entry: trade.open_price,
        tp: trade.tp,
        sl: trade.sl,
        exit: trade.current_price,
        rr: trade.rr || 0,
        pips: trade.pips || 0,
        riskPercent: trade.riskPercent || 0,
        session: trade.session || "-",
        balanceHistory: [initialBalance, initialBalance + (trade.profit || 0)],
        profitTarget: account.propSettings?.profitTarget || 0,
        initialProfit: trade.profit,
        gainDrawdownPercent: parseFloat(gainDrawdownPercent.toFixed(2)),
        aiStrategy: trade.aiStrategy || "-",
        executionNotes: trade.executionNotes || "-",
        conclusions: trade.conclusions || "-",
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
  }

  return savedTrades;
};

module.exports = { storeClosedPropTrades, fetchLivePropTrades };
