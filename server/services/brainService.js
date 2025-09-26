// server/services/brainService.js
// Production-grade brain service: real Deriv data → deterministic HTF strength, LTF CHoCH, clean strongest selection.
// No mocks, no randomness. Tunable constants at the top.

require('dotenv').config();
const WebSocket = require("ws");
const chochService = require('./chochService'); // must export storeLTF(pair, side, valid)
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
      "EURUSD","GBPUSD","USDJPY","USDCHF","AUDUSD","NZDUSD","USDCAD",
      "EURGBP","EURJPY","EURCHF","EURAUD","EURNZD",
      "GBPJPY","GBPCHF","GBPAUD","GBPNZD",
      "AUDJPY","AUDNZD","AUDCHF",
      "CADJPY","CADCHF",
      "CHFJPY","NZDJPY","NZDCHF"
    ];


// ---------- TUNABLE CONSTANTS ----------
const DERIV_API_TOKEN = process.env.DERIV_API_TOKEN;
const DERIV_APP_ID = process.env.DERIV_APP_ID || 1089;

// sensitivity: momentumPct / MOMENTUM_SCALE_PCT => 0..1 mapped to 0..100
// Lowering MOMENTUM_SCALE_PCT makes strengths higher for smaller moves.
// Recommended: 1 => 1% momentum -> 100 strength (sensible for HTF 4h momentum)
const MOMENTUM_SCALE_PCT = 1.0;

// LTF CHoCH breakout magnitude required (in percent).
// 0.08 => 0.08% (8 basis points). Raise if too noisy.
const CHOCH_MAG_PCT = 0.06;

// What we consider a "strong" HTF candidate before selecting it as TOP_PAIR
 const STRONG_PAIR_THRESHOLD = 80; // require ≥80 to be selected as daily trade
// more inclusive // user requested >75/80 — set to 80

// Color thresholds (tweak if needed)
const COLOR_GREEN = 80; // ≥ 80 -> 🟩
const COLOR_ORANGE = 60; // ≥ 60 -> 🟧 else 🟥
// -------------------------------------

const candlesStore = {}; // { PAIR: { granularity: [candles...] } }
let derivWS = null;

// -------------------- Utilities --------------------
function clamp(v, a = 0, b = 100) {
  return Math.max(a, Math.min(b, v));
}

/**
 * Convert momentum percent -> 0..100 strength.
 * Uses MOMENTUM_SCALE_PCT: 1% => 100 (by default).
 */
function momentumPctToStrength(momentumPct) {
  const absPct = Math.abs(momentumPct);
  const scaled = (absPct / MOMENTUM_SCALE_PCT) * 100; // e.g. 1% -> 100
  return Math.round(clamp(scaled, 0, 100));
}

/**
 * Robust LTF CHoCH/BOS detector
 * - Works with live candles from candlesStore
 * - HTF trend alignment optional
 * - Detects breakouts, BOS, and valid CHoCH magnitude
 * - Tolerates small moves
 */
function detectLTFChochFromCandles(candles, lookback = 5, magnitudeThresholdPct = CHOCH_MAG_PCT, htfTrend = null) {
  if (!candles || candles.length < lookback + 2) 
    return { side: null, valid: false, magnitudePct: 0 };

  // Take last N candles
  const prevCandles = candles.slice(-lookback - 1, -1);
  const lastCandle = candles[candles.length - 1];
  const lastClose = parseFloat(lastCandle.close);

  // Previous high/low for breakout range
  const prevHigh = Math.max(...prevCandles.map(c => parseFloat(c.high)));
  const prevLow  = Math.min(...prevCandles.map(c => parseFloat(c.low)));

  // Compute breakout percentages
  const breakoutUpPct   = ((lastClose - prevHigh) / prevHigh) * 100;
  const breakoutDownPct = ((prevLow - lastClose) / prevLow) * 100;

  // Check for bullish breakout
  if (lastClose > prevHigh && breakoutUpPct >= magnitudeThresholdPct) {
    if (!htfTrend || htfTrend === "Bullish") {
      return { side: "BUY", valid: true, magnitudePct: breakoutUpPct };
    }
  }

  // Check for bearish breakout
  if (lastClose < prevLow && breakoutDownPct >= magnitudeThresholdPct) {
    if (!htfTrend || htfTrend === "Bearish") {
      return { side: "SELL", valid: true, magnitudePct: breakoutDownPct };
    }
  }

  // Optional: BOS detection (break of structure)
  // If last candle closes outside prior structure but < magnitudeThresholdPct, mark as BOS
  if (lastClose > prevHigh && breakoutUpPct > 0 && breakoutUpPct < magnitudeThresholdPct) {
    if (!htfTrend || htfTrend === "Bullish") {
      return { side: "BUY", valid: false, magnitudePct: breakoutUpPct, type: "BOS" };
    }
  }
  if (lastClose < prevLow && breakoutDownPct > 0 && breakoutDownPct < magnitudeThresholdPct) {
    if (!htfTrend || htfTrend === "Bearish") {
      return { side: "SELL", valid: false, magnitudePct: breakoutDownPct, type: "BOS" };
    }
  }

  // No valid signal
  return { side: null, valid: false, magnitudePct: 0 };
}

// -------------------- AppConfig writer (production-ready) --------------------
function writeAppConfig({ pair, side, balance, strength }) {
  // percentages (can be tuned or made configurable)
  const tpPct = parseFloat(process.env.TP_PCT) || 0.03;       // default 3%
const riskPct = parseFloat(process.env.RISK_PCT) || 0.01;   // default 1%


  // numeric amounts in USD (or account currency)
  const riskAmount = +(balance * riskPct).toFixed(2); // e.g. 1.00
  const tpAmount = +(balance * tpPct).toFixed(2);     // e.g. 3.00

  // absolute equity targets the EA will use to close all positions
  const targetEquity = +(balance + tpAmount).toFixed(2); // e.g. 103.00
  const stopEquity = +(balance - riskAmount).toFixed(2); // e.g. 99.00

  const config = {
    pair,
    buy: side === "BUY",
    sell: side === "SELL",
    riskPercent: riskPct * 100, // e.g., 1% -> 1
    tpPercent: tpPct * 100,     // e.g., 3% -> 3
    riskAmount,      // USD amount corresponding to riskPercent
    tpAmount,        // USD amount corresponding to tpPercent
    targetEquity,    // equity value at which EA closes all positions (TP)
    stopEquity,      // equity value at which EA closes all positions (SL)
    strength: strength || null,
    dailyTrade: new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  };

  // ensure config directory exists and write atomically
  const dirPath = path.join(__dirname, "../../config");
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

  const filePath = path.join(dirPath, "appConfig.json");
  // write to temp and rename to avoid partial writes
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

    // Subscribe to both HTF (4h) and LTF (15m)
    allPairs.forEach(pair => {
      try {
        subscribePair(pair, 900);    // 15m
        subscribePair(pair, 14400);  // 4h
      } catch (e) {
        console.error("❌ subscribePair error:", e && e.message ? e.message : e);
      }
    });
  });

  derivWS.on('message', (msg) => {
    try {
      const data = JSON.parse(msg);

      // Accept messages with candles or history where echo_req is present
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
    console.error("Deriv WS socket error:", err && err.message ? err.message : err);
    try { derivWS.close(); } catch (e) {}
  });
}

function subscribePair(pair, granularity) {
  // Request history + streaming updates
  // Do NOT send echo_req in request (server will echo it back)
  const payload = {
    ticks_history: "frx" + pair,
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

/**
 * updateBrainData:
 * - computes HTF momentum strength for each pair (4h)
 * - computes LTF CHoCH (15m) and persists CHoCH events
 * - builds combined strength, assigns color, sorts
 * - selects clean strongest pair only if strength >= STRONG_PAIR_THRESHOLD
 */
async function updateBrainData() {
  const marketStrength = [];
  const chochData = {};

  for (const pair of allPairs) {
    try {
      // ---------------- HTF (4h) ----------------
      const htfCandles = candlesStore[pair]?.[14400];
      let htfDirection = null;
      let htfStrength = 0;

      if (htfCandles && htfCandles.length >= 7) {
        const lastIdx = htfCandles.length - 1;
        const closeNow = parseFloat(htfCandles[lastIdx].close);
        const closeAgo = parseFloat(htfCandles[lastIdx - 6].close); // ~24h ago
        const momentumPct = ((closeNow - closeAgo) / closeAgo) * 100;
        htfDirection = momentumPct > 0 ? "BULL" : "BEAR";
        htfStrength = momentumPctToStrength(momentumPct); // 0-100
      }

      // ---------------- LTF CHoCH (15m) ----------------
      const ltfCandles = candlesStore[pair]?.[900];
      const ltf = detectLTFChochFromCandles(ltfCandles, 5, CHOCH_MAG_PCT, htfDirection === "BULL" ? "Bullish" : htfDirection === "BEAR" ? "Bearish" : null);
      // Ensure every pair is represented 1:1
      chochData[pair] = {
  side: ltf?.valid ? ltf.side : null,  // null if invalid
  valid: ltf?.valid || false,
  magnitudePct: ltf?.magnitudePct || 0
};





      // ---------------- Combine strengths ----------------
      let combinedStrength = 30; // fallback
      if (htfDirection) {
        const base = 50 + (htfStrength * 0.6); // maps HTF 0–100 → 50–110
        const ltfBonus = ltf.valid && ((htfDirection === "BULL" && ltf.side === "BUY") || (htfDirection === "BEAR" && ltf.side === "SELL")) ? 20 : 0;
        combinedStrength = Math.round(clamp(base + ltfBonus, 0, 100));
      } else if (ltf.valid) {
        combinedStrength = 55; // only LTF valid
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


      // ---------------- Persist CHoCH ----------------
      if (ltf.valid) {
        try {
          await chochService.storeLTF(pair, ltf.side, ltf.valid, ltf.magnitudePct);
          console.log(`📦 LTF CHoCH stored: ${pair} - ${ltf.side} - valid=${ltf.valid}`);
        } catch (e) {
          console.error("❌ Failed to persist CHoCH:", e && e.message ? e.message : e);
        }
      }
    } catch (err) {
      console.error(`Failed to process ${pair}:`, err && err.message ? err.message : err);
    }
  }

  // ---------------- Sort & select top pair ----------------
  marketStrength.sort((a, b) => b.strength - a.strength);

  let cleanPair = null;
  for (const p of marketStrength) {
    const ltf = chochData[p.symbol];

if (
  ltf &&
  ltf.valid &&
  ((p.bias === "Bullish" && ltf.side === "BUY") || (p.bias === "Bearish" && ltf.side === "SELL")) &&
  p.strength >= STRONG_PAIR_THRESHOLD
) {
  cleanPair = p.symbol;
  break;
}

  }

  // ---------------- Broadcast ----------------

// Ensure all pairs are present and side is null if invalid
const chochFull = allPairs.map(p => {
  const ltf = chochData[p] || {};
  return {
    symbol: p,
    side: ltf.valid ? ltf.side : null, // null if invalid
    valid: ltf.valid || false
  };
});

broadcastBrainData("MARKET_STRENGTH", marketStrength);
broadcastBrainData("CHOCH_DATA", chochFull); // <-- use chochFull
broadcastBrainData("TOP_PAIR", cleanPair);


    // ---------------- Daily selection & config update ----------------
  try {
    await handleDailySelection(cleanPair, chochData);
  } catch (err) {
    console.error("❌ handleDailySelection error:", err && err.message ? err.message : err);
  }


  return { marketStrength, chochData, topPair: cleanPair };
}
// -------------------- Daily strongest selection (production) --------------------
async function handleDailySelection(topPair, chochData) {
  if (!topPair) return;

  const today = new Date().toISOString().slice(0, 10);

  // 1) Have we already picked a daily trade?
  const existing = await DailySelection.findOne({ date: today });
  if (existing) {
    // already selected for today — nothing to do
    return;
  }

  // 2) must have CHoCH and be valid
  const choch = chochData[topPair];
  if (!choch || !choch.valid) return;

  // 3) get latest account snapshot
  // EquitySnapshot model expected to have { balance, equity, margin, createdAt } (adjust if different)
  const snapshot = await EquitySnapshot.findOne().sort({ createdAt: -1 });
  if (!snapshot || typeof snapshot.balance !== "number") {
    console.error("❌ handleDailySelection: no valid EquitySnapshot available");
    return;
  }

  // Prefer equity (floating PnL), fallback to balance
const balance = typeof snapshot.equity === "number" 
  ? snapshot.equity 
  : Number(snapshot.balance);

  const strength = chochData[topPair]?.magnitudePct ? Math.round(chochData[topPair].magnitudePct) : null;

  // 4) persist DailySelection record
  const selection = new DailySelection({
    date: today,
    pair: topPair,
    side: choch.side,         // "BUY" or "SELL"
    strength: strength || null,
    balanceAtSelection: balance,
    createdAt: new Date()
  });
  await selection.save();

  // 5) Write config/appConfig.json for EA (includes numeric USD amounts)
  try {
    writeAppConfig({ pair: topPair, side: choch.side, balance, strength });
  } catch (err) {
    console.error("❌ writeAppConfig failed:", err && err.message ? err.message : err);
  }
console.log(`✅ Daily selection saved & config written: ${topPair} ${choch.side} (equity/balance ${balance})`);

}

// -------------------- Continuous loop --------------------
async function startBrainLoop(intervalMs = 5000) {
  try {
    await updateBrainData();
  } catch (err) {
    console.error("Brain initial update error:", err && err.message ? err.message : err);
  }

  setInterval(async () => {
    try {
      await updateBrainData();
    } catch (err) {
      console.error("Brain loop error:", err && err.message ? err.message : err);
    }
  }, intervalMs);
}
// Get the top strongest pair meeting realistic criteria
async function getStrongestPair(minStrength = 80) {
  const { marketStrength, chochData } = await updateBrainData(); // refresh data

  // Filter only strong pairs (≥ minStrength) and aligned LTF CHoCH
  const strongPairs = marketStrength.filter(p => {
    const choch = chochData[p.symbol];
if (!choch || !choch.valid) return false;
const aligned = (p.bias === "Bullish" && choch.side === "BUY") ||
                (p.bias === "Bearish" && choch.side === "SELL");

return p.strength >= minStrength && aligned && (choch.magnitudePct || 0) >= CHOCH_MAG_PCT;


  });

  if (strongPairs.length === 0) return null;

  // Pick the strongest one
  strongPairs.sort((a, b) => b.strength - a.strength);
  return {
  symbol: strongPairs[0].symbol,
  strength: strongPairs[0].strength,
  bias: strongPairs[0].bias,
  signal: strongPairs[0].signal
};
 // { pair, strength, trend, color }
}



// Initialize connection & loop immediately
connectDerivWS();
startBrainLoop(5000);

module.exports = {
  setWebSocketServer,
  updateBrainData,
  startBrainLoop,
  getStrongestPair,
  candlesStore,
  detectLTFChochFromCandles
};


