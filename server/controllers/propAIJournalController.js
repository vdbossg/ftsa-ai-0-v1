// server/controllers/propAIJournalController.js
const { storeClosedPropTrades } = require("../services/TradesPropStore");

/**
 * Returns all closed Prop trades for journal page
 * Optionally, you can filter by query params like dateFrom, dateTo, winLoss, symbolSearch
 */
const getPropAIJournal = async (req, res) => {
  try {
    // Step 1: Store any new closed trades from live Prop endpoint
    const newlyClosedTrades = await storeClosedPropTrades();

    // Step 2: Fetch all closed trades from DB
    const PropJournal = require("../models/propAIJournalModel");
    let query = {};

    const { dateFrom, dateTo, winLoss, symbolSearch } = req.query;
    if (dateFrom) query.date = { $gte: new Date(dateFrom) };
    if (dateTo) query.date = { ...query.date, $lte: new Date(dateTo) };
    if (winLoss === "win") query.profit = { $gte: 0 };
    if (winLoss === "loss") query.profit = { $lt: 0 };
    if (symbolSearch) query.pair = { $regex: symbolSearch, $options: "i" };

    const existingTrades = await PropJournal.find(query).sort({ date: -1 });

    // Combine newly stored trades with existing filtered trades (avoid duplicates)
    const tradeTickets = new Set(existingTrades.map(t => t.ticket));
    const combinedTrades = [
      ...existingTrades,
      ...newlyClosedTrades.filter(t => !tradeTickets.has(t.ticket))
    ];

    res.json({ success: true, data: combinedTrades });
  } catch (err) {
    console.error("Prop AI Journal error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch Prop AI journal trades." });
  }
};

module.exports = { getPropAIJournal };
