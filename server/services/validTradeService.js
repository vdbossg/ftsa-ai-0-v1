const ValidTrade = require("../models/ValidTrade");

function generateSignalId(signal) {
  return `${signal.symbol}_${signal.type}_${signal.timeframe}_${signal.entry}`;
}

async function saveValidTrade(signal) {
  const signalId = generateSignalId(signal);

  const exists = await ValidTrade.findOne({ signalId });
  if (exists) return null; // 🚫 no duplicates

  const trade = await ValidTrade.create({
    symbol: signal.symbol,
    type: signal.type,
    mode: signal.mode || "market",
    entry: signal.entry,
    sl: signal.sl,
    tp: signal.tp,
    timeframe: signal.timeframe,
    signalId
  });

  return trade;
}

module.exports = {
  saveValidTrade
};
