const { getMTJournal, refreshMTJournal, detectAndStoreClosedMTTrades } = require("../services/mtAIJournalService");

// Get MT trades (with optional filters from query params)
const fetchMTJournalController = async (req, res) => {
  try {
    const { dateFrom, dateTo, winLoss, symbolSearch } = req.query;

    // Detect closed trades, store them, and fetch them immediately
    const trades = await detectAndStoreClosedMTTrades();

    // Optional: apply frontend filters manually if needed
    let filtered = trades;
    if (dateFrom) filtered = filtered.filter(t => new Date(t.date) >= new Date(dateFrom));
    if (dateTo) filtered = filtered.filter(t => new Date(t.date) <= new Date(dateTo));
    if (winLoss === "win") filtered = filtered.filter(t => t.profit >= 0);
    if (winLoss === "loss") filtered = filtered.filter(t => t.profit < 0);
    if (symbolSearch) filtered = filtered.filter(t => t.pair.toLowerCase().includes(symbolSearch.toLowerCase()));

    res.json({ success: true, data: filtered });
  } catch (err) {
    console.error("Error fetching MT Journal:", err.message);
    res.status(500).json({ error: "Failed to fetch MT Journal" });
  }
};

module.exports = { fetchMTJournalController };
