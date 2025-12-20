const ValidTradeData = require("../models/ValidTradeData");
const axios = require("axios");

async function buildValidTradeData() {
  // 1. get valid trade
  const validTradeRes = await axios.get(
    "http://localhost:5000/api/validtrade"
  );
  const validTrade = validTradeRes.data?.data;

  if (!validTrade) return null;

  // 2. get RMS settings
  const rmsRes = await axios.get("http://localhost:5000/api/rms");
  const rms = rmsRes.data?.data;

  if (!rms) return null;

  // 3. get account balance (from HomePage logic backend)
  const balanceRes = await axios.get(
    "http://localhost:5000/api/account/balance"
  );
  const initialBalance = balanceRes.data?.balance;

  if (initialBalance == null) return null;

  // 4. prevent duplicate trade
  const exists = await ValidTradeData.findOne({
    tradeId: validTrade.id
  });

  if (exists) return exists;

  // 5. ensure ONLY ONE latest record
  await ValidTradeData.deleteMany({});

  const saved = await ValidTradeData.create({
    tradeId: validTrade.id,

    symbol: validTrade.symbol,
    type: validTrade.type,
    mode: validTrade.mode,

    entry: validTrade.entry,
    sl: validTrade.sl,
    tp: validTrade.tp,

    timeframe: validTrade.timeframe,

    maxTrades: rms.maxTrades,
    risk: rms.risk,
    dailyMaxLoss: rms.dailyMaxLoss,
    tpTargets: rms.tpTargets,

    initialBalance
  });

  return saved;
}

module.exports = { buildValidTradeData };
