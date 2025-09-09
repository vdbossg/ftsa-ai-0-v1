// server/services/strengthService.js

// ✅ All major & minor Forex pairs
const ALL_PAIRS = [
  "EURUSD","GBPUSD","USDJPY","USDCHF","AUDUSD","NZDUSD","USDCAD",
  "EURGBP","EURJPY","EURCHF","EURAUD","EURNZD",
  "GBPJPY","GBPCHF","GBPAUD","GBPNZD",
  "AUDJPY","AUDNZD","AUDCAD","AUDCHF",
  "NZDJPY","NZDCHF","NZDCAD",
  "CADJPY","CADCHF",
  "CHFJPY"
];

// In-memory strengths
let pairStrengths = ALL_PAIRS.map(symbol => ({
  symbol,
  percent: Math.floor(Math.random() * 100) // initial dummy %, can be updated later
}));

const getColorByPercent = (percent) => {
  if (percent >= 70) return "🟩"; // Strong
  if (percent >= 40) return "🟧"; // Medium
  return "🟥"; // Weak
};

// ✅ Return ranked pairs with color
exports.getRankedPairs = async () => {
  const ranked = [...pairStrengths].sort((a, b) => b.percent - a.percent);
  return ranked.map(p => ({ ...p, color: getColorByPercent(p.percent) }));
};

// ✅ Return all symbols
exports.getAllSymbols = async () => ALL_PAIRS;

// ✅ Update single pair strength
exports.updatePairStrength = async (symbol, percent) => {
  const idx = pairStrengths.findIndex(p => p.symbol === symbol);
  if (idx >= 0) {
    pairStrengths[idx].percent = percent;
  } else {
    pairStrengths.push({ symbol, percent });
  }
};

// ✅ Get strongest pair
exports.getStrongestPair = async () => {
  if (!pairStrengths.length) return null;
  const top = [...pairStrengths].sort((a, b) => b.percent - a.percent)[0];
  return { ...top, color: getColorByPercent(top.percent) };
};

// ✅ Push live strength to WS clients (server.js will call this)
exports.pushLiveStrength = async (broadcastFn) => {
  const ranked = await exports.getRankedPairs();
  if (broadcastFn) broadcastFn("marketStrength", ranked);
};
