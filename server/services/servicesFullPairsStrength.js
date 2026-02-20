// services/servicesFullPairsStrength.js
// Load dotenv safely from project root
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Debug: confirm the Node backend key is loaded
console.log('Loaded TD_API_KEY for Node:', process.env.TD_API_KEY);

if (!process.env.TD_API_KEY) {
  console.error('❌ TD_API_KEY is missing! Check your .env file');
  process.exit(1); // stops execution to prevent Twelve Data crash
}

// 3️⃣ Load dependencies
const twelvedata = require('twelvedata');
const FullPairsStrengthModel = require('../models/modelsFullPairsStrength');

const twelvedata = require('twelvedata');
const td = twelvedata({ apiKey: process.env.TD_API_KEY });
console.log('✅ Twelve Data client initialized with Node key');

// 5️⃣ Log success
console.log('✅ Twelve Data client initialized with API key');

// Symbols list (Twelve Data format)
const SYMBOLS = [
  "EUR/USD","GBP/USD","USD/JPY","USD/CHF","AUD/USD","NZD/USD","USD/CAD",
  "EUR/GBP","EUR/JPY","EUR/CHF","EUR/AUD","EUR/CAD","EUR/NZD",
  "GBP/JPY","GBP/CHF","GBP/AUD","GBP/CAD","GBP/NZD",
  "AUD/JPY","AUD/NZD","AUD/CHF","AUD/CAD",
  "CAD/JPY","CAD/CHF","CHF/JPY","NZD/JPY","NZD/CHF","NZD/CAD",
  "US30","NAS100","SPX500","GER40","UK100","FRA40","JP225","AUS200","HK50",
  "XAU/USD","XAG/USD","XPT/USD","XPD/USD",
  "USOIL","UKOIL",
  "BTC/USD","ETH/USD","LTC/USD","XRP/USD","ADA/USD","BNB/USD","SOL/USD","DOGE/USD"
];

// Fetch candles from Twelve Data
async function fetchCandles(symbol, interval = "4h", count = 50) {
  try {
    const ts = td.timeSeries({
      symbol,
      interval,       // "1min", "5min", "1h", "4h", "1day", etc.
      outputsize: count,
      timezone: "Etc/UTC"
    });
    const data = await ts.asBars();

    // Convert to candle format
    return data.map(c => ({
      close: parseFloat(c.close),
      open: parseFloat(c.open),
      high: parseFloat(c.high),
      low: parseFloat(c.low),
      datetime: c.datetime
    }));
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

// Update Full Pairs Strength (parallel fetch)
async function updateFullPairsStrength() {
  try {
    const candlesPromises = SYMBOLS.map(symbol => fetchCandles(symbol, "4h", 7));
    const candlesResults = await Promise.all(candlesPromises);

    const marketStrength = SYMBOLS.map((symbol, idx) => {
      const htfCandles = candlesResults[idx];
      if (!htfCandles.length) return null;

      const htfMomentum = computeMomentum(htfCandles);
      const strength = Math.min(Math.abs(htfMomentum) * 50, 100);
      const bias = strength > 50 ? "Bullish" : "Bearish";

      const lastClose = htfCandles[htfCandles.length - 1].close;
      const previousClose = htfCandles[htfCandles.length - 2].close;

      return {
        symbol,
        strength: Math.round(strength),
        bias,
        signal: strengthSignal(strength),
        htfMomentumPct: parseFloat(htfMomentum.toFixed(2)),
        lastClose,
        previousClose
      };
    }).filter(Boolean);

    FullPairsStrengthModel.update(marketStrength);
    return FullPairsStrengthModel.getJSON();
  } catch (err) {
    console.error('❌ Failed to update full pairs strength:', err.message);
    return [];
  }
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