const SymbolTopdownStrength = require('../models/modelsTopdownStrength');
const { candlesStore } = require('./brainService'); // candlesStore only
const WebSocket = require('ws');

const TIMEFRAMES = { "1D": 86400, "4H": 14400, "1H": 3600, "30M": 1800 };
let wssServer = null;

function setWebSocketServer(ws) { wssServer = ws; }

function momentumPctToStrength(momentum) {
  const absMomentum = Math.min(Math.abs(momentum), 100);
  return Math.round(absMomentum);
}

async function updateSymbolTopdown(symbol) {
  const tfBiases = {};

for (const [tfName, gran] of Object.entries(TIMEFRAMES)) {

  const candles = candlesStore[symbol]?.[gran];

  console.log(`Checking ${symbol} ${tfName}`);
  console.log("Candles length:", candles?.length);

  if (!candles || candles.length < 7) {
    console.log(`❌ Not enough candles for ${symbol} ${tfName}`);
    continue;
  }

  const lastIdx = candles.length - 1;
    const closeNow = parseFloat(candles[lastIdx].close);
    const closeAgo = parseFloat(candles[lastIdx - 6].close);
    const momentumPct = ((closeNow - closeAgo) / closeAgo) * 100;
    const strength = momentumPctToStrength(momentumPct);
    const bias = momentumPct > 0 ? "BULL" : "BEAR";

    tfBiases[tfName] = { bias, strength };
  }

  // Fill missing timeframes with NEUTRAL/0
  for (const tf of Object.keys(TIMEFRAMES)) {
    if (!tfBiases[tf]) tfBiases[tf] = { bias: "NEUTRAL", strength: 0 };
  }


// Majority-based multiTFBias
const votes = Object.values(tfBiases).map(t => t.bias);
const bullCount = votes.filter(b => b === "BULL").length;
const bearCount = votes.filter(b => b === "BEAR").length;

let multiTFBias;
if (bullCount > 2) multiTFBias = "🟩BULL";
else if (bearCount > 2) multiTFBias = "🟥BEAR";
else multiTFBias = "🟧NEUTRAL";



  // ✅ Upsert into MongoDB
  await SymbolTopdownStrength.findOneAndUpdate(
    { symbol },
    { symbol, timeframes: tfBiases, multiTFBias, lastUpdated: new Date() },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // ✅ Broadcast via WS
  if (wssServer) {
    const allData = await SymbolTopdownStrength.find();
    wssServer.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: "TOPDOWN_STRENGTH", payload: allData }));
      }
    });
  }
}

async function updateAllTopdownSymbols(allSymbols) {
  for (const symbol of allSymbols) {
    try { await updateSymbolTopdown(symbol); }
    catch (err) { console.error(`Failed to update ${symbol}:`, err.message); }
  }
}

module.exports = { updateSymbolTopdown, updateAllTopdownSymbols, setWebSocketServer };