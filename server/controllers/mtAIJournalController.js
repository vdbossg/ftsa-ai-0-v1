// server/controllers/mtAIJournalController.js
const { storeClosedMTTrades } = require("../services/TradesMtStore");

/**
 * Returns all closed MT trades for journal page
 * Optionally filter by query params: dateFrom, dateTo, winLoss, symbolSearch
 */
const getMTJournalController = async (req, res) => {
  try {
    // Step 1: Store any new closed trades from live MT endpoint
    const newlyClosedTrades = await storeClosedMTTrades();

    // Step 2: Fetch all closed MT trades from DB
    const MTJournal = require("../models/mtAIJournalModel");
    let query = {};

    const { dateFrom, dateTo, winLoss, symbolSearch } = req.query;
    if (dateFrom) query.date = { $gte: new Date(dateFrom) };
    if (dateTo) query.date = { ...query.date, $lte: new Date(dateTo) };
    if (winLoss === "win") query.profit = { $gte: 0 };
    if (winLoss === "loss") query.profit = { $lt: 0 };
    if (symbolSearch) query.pair = { $regex: symbolSearch, $options: "i" };

    const existingTrades = await MTJournal.find(query).sort({ date: -1 });

    // Combine newly stored trades with existing filtered trades (avoid duplicates)
    const tradeTickets = new Set(existingTrades.map(t => t.ticket));
    const combinedTrades = [
      ...existingTrades,
      ...newlyClosedTrades.filter(t => !tradeTickets.has(t.ticket))
    ];

    res.json({ success: true, data: combinedTrades });
  } catch (err) {
    console.error("MT AI Journal error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch MT AI journal trades." });
  }
};

module.exports = { getMTJournalController };
