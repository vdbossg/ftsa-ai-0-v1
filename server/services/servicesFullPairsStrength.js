// services/servicesFullPairsStrength.js
require('dotenv').config();
const MetaApi = require('metaapi.cloud-sdk').default;
const FullPairsStrengthModel = require('../models/modelsFullPairsStrength');

const MT5_TOKEN = process.env.MT5_API_TOKEN;

// initialize MetaApi client once
const metaApiClient = new MetaApi(MT5_TOKEN);

// Symbols list
const SYMBOLS = [
  "EURUSD","GBPUSD","USDJPY","USDCHF","AUDUSD","NZDUSD","USDCAD",
  "EURGBP","EURJPY","EURCHF","EURAUD","EURCAD","EURNZD",
  "GBPJPY","GBPCHF","GBPAUD","GBPCAD","GBPNZD",
  "AUDJPY","AUDNZD","AUDCHF","AUDCAD",
  "CADJPY","CADCHF","CHFJPY","NZDJPY","NZDCHF","NZDCAD",
  "US30","NAS100","SPX500","GER40","UK100","FRA40","JP225","AUS200","HK50",
  "XAUUSD","XAGUSD","XPTUSD","XPDUSD",
  "USOIL","UKOIL",
  "BTCUSD","ETHUSD","LTCUSD","XRPUSD","ADAUSD","BNBUSD","SOLUSD","DOGEUSD"
];

// Fetch candles from MetaApi Market Data (no MT5 account required)
async function fetchCandles(symbol, timeframeSeconds = 14400, count = 50) {
  try {
    const marketData = metaApiClient.marketDataApi;
    const candles = await marketData.getCandles(symbol, timeframeSeconds, count);
    return candles;
  } catch (err) {
    console.error(`❌ Failed to fetch ${symbol} market data:`, err.message);
    return [];
  }
}

// Compute momentum
function computeMomentum(candles) {
  if (!candles || candles.length < 2) return 0;
  const lastClose = candles[candles.length - 1].close;
  const prevClose = candles[candles.length - 2].close;
  return ((lastClose - prevClose) / prevClose) * 100;
}

// Generate signal
function strengthSignal(strength) {
  if (strength >= 75) return "🟩";
  if (strength >= 31) return "🟧";
  return "🟥";
}

// Update Full Pairs Strength
async function updateFullPairsStrength() {
  const marketStrength = [];

  for (let symbol of SYMBOLS) {
    try {
      const htfCandles = await fetchCandles(symbol, 14400, 7); // 4H only
      if (!htfCandles.length) continue;

      const htfMomentum = computeMomentum(htfCandles);
      const strength = Math.min(Math.abs(htfMomentum) * 50, 100);
      const bias = strength > 50 ? "Bullish" : "Bearish";

      const lastClose = htfCandles[htfCandles.length - 1].close;
      const previousClose = htfCandles[htfCandles.length - 2].close;

      marketStrength.push({
        symbol,
        strength: Math.round(strength),
        bias,
        signal: strengthSignal(strength),
        htfMomentumPct: parseFloat(htfMomentum.toFixed(2)),
        lastClose,
        previousClose
      });
    } catch (err) {
      console.error(`❌ Failed to process ${symbol}:`, err.message);
    }
  }

  FullPairsStrengthModel.update(marketStrength);
  return FullPairsStrengthModel.getJSON();
}

// Optional loop every 5s
async function startLoop(intervalMs = 5000) {
  await updateFullPairsStrength();
  setInterval(updateFullPairsStrength, intervalMs);
}

module.exports = {
  updateFullPairsStrength,
  startLoop
};