const MTJournalService = require("./Service");

exports.getMTJournal = async (req, res) => {
  try {
    const data = await MTJournalService.fetchMTJournal(req.query);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch MT AI journal" });
  }
};
