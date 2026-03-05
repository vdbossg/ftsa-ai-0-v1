// FTSA_AI_0.v1\server\controllers\mttabletrades.controller.js
const MTService = require("../services/mttabletrades.service");

/**
 * Fetch MT5 trades for the currently logged-in user
 */
const fetchMTTableTrades = async (req, res) => {
  try {
    // Get current user's MT5 account (live)
    const account = await MTService.getCurrentUserMT5Account();

    if (!account) {
      return res.status(404).json({ success: false, error: "No MT5 account found for current user" });
    }

    // Return normalized account
    res.json({ success: true, data: account });
  } catch (err) {
    console.error("Error fetching MT table trades:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  fetchMTTableTrades,
};