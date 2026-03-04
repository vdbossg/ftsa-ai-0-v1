const { fetchMTTableTrades, fetchPropTableTrades } = require("../services/bypassMTTableTradesService");

// GET /api/bypass/mttabletrades
const getMTTableTrades = async (req, res) => {
  try {
    const data = await fetchMTTableTrades();
    res.json(data);
  } catch (err) {
    console.error("❌ Error fetching MT table trades:", err);
    res.status(500).json({ message: "Failed to fetch MT table trades" });
  }
};

// GET /api/bypass/proptabletrades
const getPropTableTrades = async (req, res) => {
  try {
    const data = await fetchPropTableTrades();
    res.json(data);
  } catch (err) {
    console.error("❌ Error fetching Prop table trades:", err);
    res.status(500).json({ message: "Failed to fetch Prop table trades" });
  }
};

module.exports = { getMTTableTrades, getPropTableTrades };