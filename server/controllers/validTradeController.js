const ValidTrade = require("../models/ValidTrade");

async function getValidTrade(req, res) {
  try {
    const trade = await ValidTrade
      .findOne()
      .sort({ createdAt: -1 })
      .select("_id symbol type mode entry sl tp timeframe");

    if (!trade) return res.json(null);

    res.json({
      id: trade._id,
      symbol: trade.symbol,
      type: trade.type,
      mode: trade.mode,
      entry: trade.entry,
      sl: trade.sl,
      tp: trade.tp,
      timeframe: trade.timeframe
    });
  } catch (err) {
    res.status(500).json(null);
  }
}

module.exports = {
  getValidTrade
};
