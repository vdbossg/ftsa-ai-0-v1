// server/services/brainService.js
require('dotenv').config(); // Load .env
const axios = require("axios");
const WebSocket = require("ws");

let wss; // Set from server.js
const allPairs = [
  "EURUSD","GBPUSD","USDJPY","USDCHF","AUDUSD","NZDUSD","USDCAD",
  "EURGBP","EURJPY","EURCHF","EURAUD","EURNZD",
  "GBPJPY","GBPCHF","GBPAUD","GBPNZD",
  "AUDJPY","AUDNZD","AUDCHF",
  "CADJPY","CADCHF",
  "CHFJPY","NZDJPY","NZDCHF"
];

const DERIV_API_TOKEN = process.env.DERIV_API_TOKEN;
const DERIV_APP_ID = process.env.DERIV_APP_ID || 1089;

// Set WebSocket server
function setWebSocketServer(server) {
  wss = server;
}

// Broadcast to all connected WS clients
function broadcastBrainData(type, payload) {
  if (!wss) return;
  wss.clients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      client.send(JSON.stringify({ type, payload }));
    }
  });
}

// Fetch candles from Deriv via REST API
async function fetchDerivCandles(symbol, granularity, count = 50) {
  const granMap = { "15m": 900, "4h": 14400 }; // seconds
  const interval = granMap[granularity];
  if (!interval) throw new Error("Unsupported granularity");

  const url = "https://api.deriv.com/binary/v1";
  try {
    const res = await axios.post(url, {
      authorize: DERIV_API_TOKEN,
      ticks_history: symbol,
      style: "candles",
      granularity: interval,
      count: count
    });

    if (res.data && res.data.history && res.data.history.candles) {
      return res.data.history.candles;
    }
    return null;
  } catch (err) {
    console.error(`Failed fetching candles for ${symbol}:`, err.message);
    return null;
  }
}

// Fetch HTF (4H) trend: "BULL" or "BEAR"
async function fetchHTFDirection(pair) {
  const symbol = "frx" + pair;
  const candles = await fetchDerivCandles(symbol, "4h", 50);
  if (!candles || candles.length < 2) return null;

  const lastClose = parseFloat(candles[candles.length - 1].close);
  const prevClose = parseFloat(candles[candles.length - 2].close);

  return lastClose > prevClose ? "BULL" : "BEAR";
}

// Fetch LTF (15m) CHoCH
async function fetchLTFChoch(pair) {
  const symbol = "frx" + pair;
  const candles = await fetchDerivCandles(symbol, "15m", 20);
  if (!candles || candles.length < 3) return { valid: false };

  const highs = candles.map(c => parseFloat(c.high));
  const lows = candles.map(c => parseFloat(c.low));
  const prevHigh = Math.max(...highs.slice(0, highs.length - 2));
  const prevLow = Math.min(...lows.slice(0, lows.length - 2));
  const lastClose = parseFloat(candles[candles.length - 1].close);

  if (lastClose > prevHigh) return { side: "BUY", valid: true };
  if (lastClose < prevLow) return { side: "SELL", valid: true };
  return { side: null, valid: false };
}

// Determine the top pair based on strength
function determineTopPair(marketStrength) {
  return marketStrength.reduce((top, p) => (p.strength > (top?.strength || 0) ? p : top), null)?.pair;
}

// Main Brain Update: fetch, filter, broadcast
async function updateBrainData() {
  const marketStrength = [];
  const chochData = {};

  for (const pair of allPairs) {
    try {
      const htf = await fetchHTFDirection(pair);
      if (!htf) continue;

      const ltf = await fetchLTFChoch(pair);
      if (!ltf.valid) continue;

      // Logical strength calculation
      let strength = 50;
      if (htf === "BULL" && ltf.side === "BUY") strength = 80;
      else if (htf === "BEAR" && ltf.side === "SELL") strength = 80;
      else if (htf === "BULL" || ltf.side === "BUY") strength = 60;
      else if (htf === "BEAR" || ltf.side === "SELL") strength = 40;
      else strength = 30;

      marketStrength.push({
        pair,
        strength,
        trend: htf === "BULL" ? "Bullish" : "Bearish",
        color: strength >= 70 ? "🟩" : strength >= 40 ? "🟧" : "🟥"
      });

      chochData[pair] = ltf;
    } catch (err) {
      console.error(`Failed to fetch data for ${pair}:`, err.message);
    }
  }

  const topPair = determineTopPair(marketStrength);

  // Broadcast to frontend
  broadcastBrainData("MARKET_STRENGTH", marketStrength);
  broadcastBrainData("CHOCH_DATA", chochData);
  broadcastBrainData("TOP_PAIR", topPair);

  return { marketStrength, chochData, topPair };
}

// Start continuous Brain loop
async function startBrainLoop(intervalMs = 5000) {
  setInterval(async () => {
    try {
      await updateBrainData();
    } catch (err) {
      console.error("Brain loop error:", err);
    }
  }, intervalMs);
}

module.exports = { setWebSocketServer, updateBrainData, startBrainLoop };
