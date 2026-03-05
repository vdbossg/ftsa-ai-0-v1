const { getPropTableTrades } = require("../services/propTradesService");

async function propTableTrades(req, res) {
  try {
    // Fetch live trades + prop settings for current logged-in user
    const data = await getPropTableTrades();

    if (!data.success) {
      return res.status(400).json({
        success: false,
        message: data.message || "Failed to fetch prop table trades",
      });
    }

    // Return the combined data
    res.json(data);
  } catch (err) {
    console.error("❌ Error fetching prop table trades:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = { propTableTrades };