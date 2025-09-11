// server/services/tradesService.js
// Production-ready trades service
// Provides DB access and optional filtering for all trades

const Trade = require("../models/Trade"); // Mongoose model

/**
 * Fetch all trades from DB
 * Supports optional filtering:
 *   - account: string
 *   - startDate / endDate: ISO date string or Date object
 */
async function getAllTrades(filters = {}) {
  try {
    const query = {};

    // Filter by account if provided
    if (filters.account) {
      query.account = filters.account;
    }

    // Filter by timestamp range if provided
    if (filters.startDate || filters.endDate) {
      query.timestamp = {};
      if (filters.startDate) query.timestamp.$gte = new Date(filters.startDate);
      if (filters.endDate) query.timestamp.$lte = new Date(filters.endDate);
    }

    // Fetch trades sorted by newest first
    const trades = await Trade.find(query).sort({ timestamp: -1 }).lean();

    return trades;
  } catch (err) {
    console.error("❌ Failed to fetch trades from DB:", err);
    throw new Error("TradesService: getAllTrades failed");
  }
}

/**
 * Optional: add a trade
 * Useful for EA or other services to log trades in real-time
 */
async function addTrade({ account, symbol, side, lotSize, price, timestamp = new Date() }) {
  try {
    if (!account || !symbol || !side || !lotSize || !price) {
      throw new Error("Missing required trade fields");
    }

    const trade = new Trade({ account, symbol, side, lotSize, price, timestamp });
    await trade.save();

    console.log(`✅ Trade logged: ${symbol} ${side} ${lotSize} lots @${price}`);
    return trade;
  } catch (err) {
    console.error("❌ Failed to add trade:", err);
    throw new Error("TradesService: addTrade failed");
  }
}

module.exports = {
  getAllTrades,
  addTrade, // now included for consistency with other services
};
