require('dotenv').config();
const WebSocket = require("ws");
const chochService = require('./chochService');

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

const candlesStore = {}; // latest candles per pair
let derivWS;

// ---------------------------
// WebSocket connection to Deriv
// ---------------------------
function connectDerivWS() {
  derivWS = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${DERIV_APP_ID}`);

  derivWS.on('open', () => {
    console.log("💡 Connected to Deriv WS");
    derivWS.send(JSON.stringify({ authorize: DERIV_API_TOKEN }));

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
    setTimeout(connectDerivWS, 5000);
  });

  derivWS.on('error', (err) => {
    console.error("Deriv WS error:", err.message);
    derivWS.close();
  });
}

function subscribePair(pair, granularity) {
  derivWS.send(JSON.stringify({
    ticks_history: "frx" + pair,
    end: "latest",
    count: 100,
    granularity,
    style: "candles",
    echo_req: { ticks_history: "frx" + pair, granularity }
  }));
}

// ---------------------------
// Brain WebSocket helpers
// ---------------------------
function setWebSocketServer(server) {
  wss = server;
}

function broadcastBrainData(type, payload) {
  if (!wss) return;
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify({ type, payload }));
    }
  });
}

// ---------------------------
// HTF trend and LTF CHoCH
// ---------------------------
async function fetchHTFDirection(pair) {
  const candles = candlesStore[pair]?.[14400]; // 4h
  if (!candles || candles.length < 2) return null;

  const lastClose = parseFloat(candles[candles.length - 1].close);
  const prevClose = parseFloat(candles[candles.length - 2].close);

  return lastClose > prevClose ? "BULL" : "BEAR";
}
async function fetchLTFChoch(pair) {
  const candles = candlesStore[pair]?.[900]; // 15m
  if (!candles || candles.length < 2) return { side: null, valid: false };

  const highs = candles.map(c => parseFloat(c.high));
  const lows = candles.map(c => parseFloat(c.low));

  // Compare only with previous candle
  const prevHigh = highs[candles.length - 2];
  const prevLow = lows[candles.length - 2];
  const lastClose = parseFloat(candles[candles.length - 1].close);

  // Normal breakout
  if (lastClose > prevHigh) return { side: "BUY", valid: true };
  if (lastClose < prevLow) return { side: "SELL", valid: true };

  // Fallback: use HTF trend if no breakout
  const htf = await fetchHTFDirection(pair);
  if (htf === "BULL") return { side: "BUY", valid: false };
  if (htf === "BEAR") return { side: "SELL", valid: false };

  // Only null if HTF is unavailable
  return { side: null, valid: false };
}



// ---------------------------
// Determine top pair
// ---------------------------
function determineTopPair(marketStrength) {
  if (!marketStrength.length) return null;
  return marketStrength.reduce((top, p) => (p.strength > (top?.strength || 0) ? p : top), null)?.pair;
}

// ---------------------------
// Main brain update
// ---------------------------
async function updateBrainData() {
  const marketStrength = [];
  const chochData = {};

  for (const pair of allPairs) {
    try {
      const htf = await fetchHTFDirection(pair);
      if (!htf) continue;

      const ltf = await fetchLTFChoch(pair);

      // Compute strength
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

      if (ltf.valid) await chochService.storeLTF(pair, ltf.side, ltf.valid);

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

// ---------------------------
// Start continuous brain loop
// ---------------------------
async function startBrainLoop(intervalMs = 5000) {
  try {
    await updateBrainData();
  } catch (err) {
    console.error("Brain initial update error:", err);
  }

  setInterval(async () => {
    try {
      await updateBrainData();
    } catch (err) {
      console.error("Brain loop error:", err);
    }
  }, intervalMs);
}

// ---------------------------
// Start everything
// ---------------------------
connectDerivWS();   // Connect WS first
startBrainLoop(5000); // Start brain loop

module.exports = { setWebSocketServer, updateBrainData, startBrainLoop };
