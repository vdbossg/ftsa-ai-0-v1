// controllers/propAIJournalController.js
const { fetchPropAIJournal } = require("../services/fetchPropAIJournalService");
const { detectAndStoreClosedTrades } = require("../services/propAIJournalService");

exports.getPropAIJournal = async (req, res) => {
  try {
    // Step 1: Detect and store any newly closed trades, returns stored trades immediately
const newlyClosedTrades = await detectAndStoreClosedTrades();

// Step 2: Fetch filtered journal entries from DB
const filters = {
  dateFrom: req.query.dateFrom || null,
  dateTo: req.query.dateTo || null,
  winLoss: req.query.winLoss || null,
  symbolSearch: req.query.symbolSearch || null,
};
const existingTrades = await fetchPropAIJournal(filters);

// Step 3: Combine newly stored closed trades with existing filtered trades (avoid duplicates)
const tradeTickets = new Set(existingTrades.map(t => t.ticket));
const combinedTrades = [
  ...existingTrades,
  ...newlyClosedTrades.filter(t => !tradeTickets.has(t.ticket))
];


    res.json({ success: true, data: combinedTrades });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch AI journal trades." });
  }
};
