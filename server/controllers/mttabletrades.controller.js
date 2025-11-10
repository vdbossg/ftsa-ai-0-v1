const MTService = require("../services/mttabletrades.service");

const fetchMTTableTrades = async (req, res) => {
  try {
    const accounts = await MTService.getAllMTAccountsTrades();
    
    res.json(accounts);
  } catch (err) {
    console.error("Error fetching MT table trades:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  fetchMTTableTrades
};
