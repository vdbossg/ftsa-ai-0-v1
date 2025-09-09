// server/controllers/tradesController.js
const tradesService = require("../services/tradesService");

/**
 * GET /api/trades
 * Optional query params: account, startDate, endDate
 */
const getTrades = async (req, res) => {
  try {
    const { account, startDate, endDate } = req.query;

    const trades = await tradesService.getAllTrades({ account, startDate, endDate });

    res.json({ success: true, data: trades });
  } catch (err) {
    console.error("Error fetching trades:", err);
    res.status(500).json({ success: false, error: "Failed to fetch trades" });
  }
};

module.exports = { getTrades };
