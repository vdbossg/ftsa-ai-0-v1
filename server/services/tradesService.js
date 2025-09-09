// server/services/tradesService.js
const Trade = require("../models/Trade"); // Mongoose model

/**
 * Fetch all trades from DB
 * Optionally, filter by account or date range
 */
async function getAllTrades(filters = {}) {
  try {
    const query = {};

    if (filters.account) {
      query.account = filters.account;
    }

    if (filters.startDate || filters.endDate) {
      query.timestamp = {};
      if (filters.startDate) query.timestamp.$gte = new Date(filters.startDate);
      if (filters.endDate) query.timestamp.$lte = new Date(filters.endDate);
    }

    const trades = await Trade.find(query).sort({ timestamp: -1 }).lean();
    return trades;
  } catch (err) {
    console.error("Error fetching trades from DB:", err);
    throw err;
  }
}

module.exports = {
  getAllTrades,
};
