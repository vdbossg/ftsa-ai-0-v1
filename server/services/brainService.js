// server/services/brainService.js
// Production-grade brain service: real Deriv data → deterministic HTF strength, clean strongest selection.
// No mocks, no randomness. Tunable constants at the top.

require('dotenv').config();
const WebSocket = require("ws");
const fs = require("fs");
const path = require("path");
const DailySelection = require("../models/DailySelection");
const EquitySnapshot = require("../models/EquitySnapshot");

// -------------------- AppConfig loader --------------------
function loadAppConfig() {
  try {
    const filePath = path.join(__dirname, "../../config/appConfig.json");
    if (!fs.existsSync(filePath)) return null;
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("❌ Failed to load appConfig.json:", err.message);
    return null;
  }
}

let wss; // set from server.js via setWebSocketServer
const configPairs = loadAppConfig()?.pairs;
const allPairs = Array.isArray(configPairs) && configPairs.length > 0 
  ? configPairs
  : [
  // ===== MAJOR FOREX PAIRS =====
  "EURUSD","GBPUSD","USDJPY","USDCHF","AUDUSD","NZDUSD","USDCAD",

  // ===== MINOR (CROSS) FOREX PAIRS =====
  "EURGBP","EURJPY","EURCHF","EURAUD","EURCAD","EURNZD",
  "GBPJPY","GBPCHF","GBPAUD","GBPCAD","GBPNZD",
  "AUDJPY","AUDNZD","AUDCHF","AUDCAD",
  "CADJPY","CADCHF",
  "CHFJPY",

  "NZDJPY","NZDCHF","NZDCAD",

  // ===== INDICES =====
   "OTC_NDX",
    "OTC_DJI",   // Nasdaq 100


  // ===== METALS =====
  "XAUUSD",    // Gold

  // ===== CRYPTO =====
  "cryBTCUSD",
  "cryETHUSD"
];


// ---------- TUNABLE CONSTANTS ----------
const DERIV_API_TOKEN = process.env.DERIV_API_TOKEN;
const DERIV_APP_ID = process.env.DERIV_APP_ID || 1089;
const MOMENTUM_SCALE_PCT = 1.0; // 1% momentum -> 100 strength
const STRONG_PAIR_THRESHOLD = 80; // require ≥80 to be selected as daily trade
const COLOR_GREEN = 80; // ≥ 80 -> 🟩
const COLOR_ORANGE = 60; // ≥ 60 -> 🟧 else 🟥
// -------------------------------------

const candlesStore = {}; // { PAIR: { granularity: [candles...] } }
let derivWS = null;

// -------------------- Utilities --------------------
function clamp(v, a = 0, b = 100) {
  return Math.max(a, Math.min(b, v));
}
function formatDerivSymbol(pair) {
  // 6-letter forex pairs like EURUSD, GBPJPY etc.
  const forexRegex = /^[A-Z]{6}$/;

  if (forexRegex.test(pair)) {
    return "frx" + pair;  // Only forex gets frx
  }

  // Indices, crypto, metals, oil
  return pair;
}
/**
 * Convert momentum percent -> 0..100 strength.
 */
function momentumPctToStrength(momentumPct) {
  const absPct = Math.abs(momentumPct);
  const scaled = (absPct / MOMENTUM_SCALE_PCT) * 100; 
  return Math.round(clamp(scaled, 0, 100));
}

// -------------------- AppConfig writer (production-ready) --------------------
function writeAppConfig({ pair, side, balance, strength }) {
  const tpPct = parseFloat(process.env.TP_PCT) || 0.03; 
  const riskPct = parseFloat(process.env.RISK_PCT) || 0.01;

  const riskAmount = +(balance * riskPct).toFixed(2); 
  const tpAmount = +(balance * tpPct).toFixed(2);     

  const targetEquity = +(balance + tpAmount).toFixed(2); 
  const stopEquity = +(balance - riskAmount).toFixed(2); 

  const config = {
    pair,
    buy: side === "BUY",
    sell: side === "SELL",
    riskPercent: riskPct * 100,
    tpPercent: tpPct * 100,
    riskAmount,
    tpAmount,
    targetEquity,
    stopEquity,
    strength: strength || null,
    dailyTrade: new Date().toISOString().slice(0, 10)
  };

  const dirPath = path.join(__dirname, "../../config");
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

  const filePath = path.join(dirPath, "appConfig.json");
  const tmpPath = filePath + ".tmp";
  fs.writeFileSync(tmpPath, JSON.stringify(config, null, 2));
  fs.renameSync(tmpPath, filePath);

  console.log("📝 appConfig.json updated:", config);
}

// -------------------- Deriv WS --------------------
function connectDerivWS() {
  derivWS = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${DERIV_APP_ID}`);

  derivWS.on('open', () => {
    console.log("💡 Connected to Deriv WS");
    if (DERIV_API_TOKEN) derivWS.send(JSON.stringify({ authorize: DERIV_API_TOKEN }));

    allPairs.forEach(pair => {
      try {
        subscribePair(pair, 900);    
        subscribePair(pair, 14400);  
      } catch (e) {
        console.error("❌ subscribePair error:", e?.message || e);
      }
    });
  });

  derivWS.on('message', (msg) => {
    try {
      const data = JSON.parse(msg);

      if ((data.msg_type === "candles" || data.msg_type === "history") && data.echo_req) {
        const ticksHistory = data.echo_req.ticks_history || data.echo_req.subscribe || data.echo_req.ticks || null;
        let symbol = null;
        if (typeof ticksHistory === "string" && ticksHistory.toLowerCase().startsWith("frx")) {
          symbol = ticksHistory.replace(/^frx/i, "");
        } else if (data.echo_req.pair) {
          symbol = String(data.echo_req.pair).replace(/^frx/i, "");
        }

        const gran = data.echo_req.granularity || data.echo_req.gran || null;
        if (symbol && gran) {
          if (!candlesStore[symbol]) candlesStore[symbol] = {};
          if (data.candles && Array.isArray(data.candles)) {
            candlesStore[symbol][gran] = data.candles;
            console.log(`📊 Stored ${symbol} | ${gran}s | ${data.candles.length} candles`);
          } else if (data.history?.candles && Array.isArray(data.history.candles)) {
            candlesStore[symbol][gran] = data.history.candles;
            console.log(`📊 Stored (history) ${symbol} | ${gran}s | ${data.history.candles.length} candles`);
          }
        }
      }

      if (data.error) {
        console.error("❌ Deriv WS error:", data.error.message || data.error);
      }
    } catch (err) {
      console.error("❌ Failed to parse Deriv WS message:", err.message);
    }
  });

  derivWS.on('close', () => {
    console.log("⚠️ Deriv WS closed. Reconnecting in 5s...");
    setTimeout(connectDerivWS, 5000);
  });

  derivWS.on('error', (err) => {
    console.error("Deriv WS socket error:", err?.message || err);
    try { derivWS.close(); } catch (e) {}
  });
}

function subscribePair(pair, granularity) {
  const symbol = formatDerivSymbol(pair);

  const payload = {
    ticks_history: symbol,
    end: "latest",
    count: 100,
    granularity,
    style: "candles",
    subscribe: 1
  };

  derivWS.send(JSON.stringify(payload));
}

// -------------------- WS -> frontend helpers --------------------
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

// -------------------- Core brain logic --------------------
function determineTopPairFromList(marketStrengthList) {
  if (!marketStrengthList || marketStrengthList.length === 0) return null;
  return marketStrengthList.reduce((top, p) => (p.strength > (top?.strength || 0) ? p : top), null)?.symbol || null;
}

async function updateBrainData() {
  const marketStrength = [];

  for (const pair of allPairs) {
    try {
      // ---------------- HTF (4h) ----------------
      const htfCandles = candlesStore[pair]?.[14400];
      let htfDirection = null;
      let htfStrength = 0;

      if (htfCandles && htfCandles.length >= 7) {
        const lastIdx = htfCandles.length - 1;
        const closeNow = parseFloat(htfCandles[lastIdx].close);
        const closeAgo = parseFloat(htfCandles[lastIdx - 6].close); 
        const momentumPct = ((closeNow - closeAgo) / closeAgo) * 100;
        htfDirection = momentumPct > 0 ? "BULL" : "BEAR";
        htfStrength = momentumPctToStrength(momentumPct); 
      }

      // ---------------- Combine strengths ----------------
      let combinedStrength = 30; 
      if (htfDirection) {
        const base = 50 + (htfStrength * 0.6); 
        combinedStrength = Math.round(clamp(base, 0, 100));
      }

      const trendText = htfDirection === "BULL" ? "Bullish" : htfDirection === "BEAR" ? "Bearish" : "Unknown";
      const color = combinedStrength >= COLOR_GREEN ? "🟩" :
                    combinedStrength >= COLOR_ORANGE ? "🟧" : "🟥";

      marketStrength.push({
        symbol: pair,
        strength: combinedStrength,
        bias: trendText,
        signal: color
      });

    } catch (err) {
      console.error(`Failed to process ${pair}:`, err?.message || err);
    }
  }

  // ---------------- Sort & select top pair ----------------
  marketStrength.sort((a, b) => b.strength - a.strength);
  const cleanPair = marketStrength.find(p => p.strength >= STRONG_PAIR_THRESHOLD)?.symbol || null;

  // ---------------- Broadcast ----------------
  broadcastBrainData("MARKET_STRENGTH", marketStrength);
  broadcastBrainData("TOP_PAIR", cleanPair);

  // ---------------- Daily selection & config update ----------------
  try {
    await handleDailySelection(cleanPair);
  } catch (err) {
    console.error("❌ handleDailySelection error:", err?.message || err);
  }

  return { marketStrength, topPair: cleanPair };
}

// -------------------- Daily strongest selection (production) --------------------
async function handleDailySelection(topPair) {
  if (!topPair) return;

  const today = new Date().toISOString().slice(0, 10);

  const existing = await DailySelection.findOne({ date: today });
  if (existing) return;

  const snapshot = await EquitySnapshot.findOne().sort({ createdAt: -1 });
  if (!snapshot || typeof snapshot.balance !== "number") {
    console.error("❌ handleDailySelection: no valid EquitySnapshot available");
    return;
  }

  const balance = typeof snapshot.equity === "number" 
    ? snapshot.equity 
    : Number(snapshot.balance);

  // Default side = BUY if unknown; adjust later with TradingView signals
  const side = "BUY"; 
  const strength = null;

  const selection = new DailySelection({
    date: today,
    pair: topPair,
    side,
    strength,
    balanceAtSelection: balance,
    createdAt: new Date()
  });
  await selection.save();

  try {
    writeAppConfig({ pair: topPair, side, balance, strength });
  } catch (err) {
    console.error("❌ writeAppConfig failed:", err?.message || err);
  }

  console.log(`✅ Daily selection saved & config written: ${topPair} ${side} (equity/balance ${balance})`);
}

// -------------------- Continuous loop --------------------
async function startBrainLoop(intervalMs = 5000) {
  try {
    await updateBrainData();
  } catch (err) {
    console.error("Brain initial update error:", err?.message || err);
  }

  setInterval(async () => {
    try {
      await updateBrainData();
    } catch (err) {
      console.error("Brain loop error:", err?.message || err);
    }
  }, intervalMs);
}

// Get the top strongest pair meeting realistic criteria
async function getStrongestPair(minStrength = 80) {
  const { marketStrength } = await updateBrainData(); 

  const strongPairs = marketStrength.filter(p => p.strength >= minStrength);

  if (strongPairs.length === 0) return null;

  strongPairs.sort((a, b) => b.strength - a.strength);
  return {
    symbol: strongPairs[0].symbol,
    strength: strongPairs[0].strength,
    bias: strongPairs[0].bias,
    signal: strongPairs[0].signal
  };
}

// Initialize connection & loop immediately
connectDerivWS();
startBrainLoop(5000);

module.exports = {
  setWebSocketServer,
  updateBrainData,
  startBrainLoop,
  getStrongestPair,
  candlesStore
};
