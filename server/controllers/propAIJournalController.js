const PropJournalService = require("../services/propAIJournalService"); // corrected

exports.getPropJournal = async (req, res) => {
  try {
    const data = await PropJournalService.fetchPropJournal(req.query);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch prop AI journal" });
  }
};
