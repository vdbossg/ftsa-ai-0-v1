const { getPropTableTrades } = require("../services/propTradesService");

async function propTableTrades(req, res) {
  try {
    const data = await getPropTableTrades();
    res.json(data);
  } catch (err) {
    console.error("Error fetching prop table trades:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = { propTableTrades };
