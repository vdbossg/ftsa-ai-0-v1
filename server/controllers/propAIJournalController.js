// controllers/propAIJournalController.js
const { fetchPropAIJournal } = require("../services/fetchPropAIJournalService");
const { detectAndStoreClosedTrades } = require("../services/propAIJournalService");

exports.getPropAIJournal = async (req, res) => {
  try {
    // Detect any newly closed trades
    await detectAndStoreClosedTrades();

    // Fetch filtered journal entries
    const filters = {
      dateFrom: req.query.dateFrom || null,
      dateTo: req.query.dateTo || null,
      winLoss: req.query.winLoss || null,
      symbolSearch: req.query.symbolSearch || null,
    };

    const trades = await fetchPropAIJournal(filters);

    res.json({ success: true, data: trades });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch AI journal trades." });
  }
};
