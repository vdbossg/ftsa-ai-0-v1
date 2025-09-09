// server/services/brainService.js
require('dotenv').config();
const WebSocket = require("ws");

let wss; // WebSocket server from server.js
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

// WebSocket connection to Deriv
const derivWS = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${DERIV_APP_ID}`);

const candlesStore = {}; // store latest candles per pair

derivWS.on('open', () => {
  console.log("💡 Connected to Deriv WS");
  derivWS.send(JSON.stringify({ authorize: DERIV_API_TOKEN }));

  // Subscribe all pairs to 15m and 4h candles
  allPairs.forEach(pair => {
    subscribePair(pair, 900);    // 15m candles
    subscribePair(pair, 14400);  // 4h candles
  });
});

derivWS.on('message', (msg) => {
  const data = JSON.parse(msg);
  if (data.msg_type === "history") {
    const symbol = data.echo_req.ticks_history.replace("frx", "");
    const gran = data.echo_req.granularity;
    if (!candlesStore[symbol]) candlesStore[symbol] = {};
    candlesStore[symbol][gran] = data.history.candles;
  }
});

derivWS.on('close', () => {
  console.log("⚠️ Deriv WS closed. Reconnecting in 5s...");
  setTimeout(() => connectDerivWS(), 5000);
});

function subscribePair(pair, granularity) {
  derivWS.send(JSON.stringify({
    ticks_history: "frx" + pair,
    end: "latest",
    count: 100,
    granularity: granularity,
    style: "candles",
    echo_req: { ticks_history: "frx" + pair, granularity }
  }));
}

// Set WebSocket server
function setWebSocketServer(server) {
  wss = server;
}

// Broadcast to all connected WS clients
function broadcastBrainData(type, payload) {
  if (!wss) return;
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify({ type, payload }));
    }
  });
}

// HTF (4H) trend
async function fetchHTFDirection(pair) {
  const candles = candlesStore[pair]?.[14400]; // 4h candles
  if (!candles || candles.length < 2) return null;

  const lastClose = parseFloat(candles[candles.length - 1].close);
  const prevClose = parseFloat(candles[candles.length - 2].close);

  return lastClose > prevClose ? "BULL" : "BEAR";
}

// LTF (15m) CHoCH
async function fetchLTFChoch(pair) {
  const candles = candlesStore[pair]?.[900]; // 15m candles
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

// Determine top pair
function determineTopPair(marketStrength) {
  return marketStrength.reduce((top, p) => (p.strength > (top?.strength || 0) ? p : top), null)?.pair;
}

// Main brain update
async function updateBrainData() {
  const marketStrength = [];
  const chochData = {};

  for (const pair of allPairs) {
    try {
      const htf = await fetchHTFDirection(pair);
      if (!htf) continue;

      const ltf = await fetchLTFChoch(pair);
      if (!ltf.valid) continue;

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
      console.error(`Failed to process ${pair}:`, err.message);
    }
  }

  const topPair = determineTopPair(marketStrength);

  broadcastBrainData("MARKET_STRENGTH", marketStrength);
  broadcastBrainData("CHOCH_DATA", chochData);
  broadcastBrainData("TOP_PAIR", topPair);

  return { marketStrength, chochData, topPair };
}

// Start continuous brain loop
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
