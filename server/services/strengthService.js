// server/services/strengthService.js
// ✅ Calculates and ranks forex pair strengths

// Example thresholds — adjust as needed
const getColorByPercent = (percent) => {
  if (percent >= 70) return "🟩"; // Strong
  if (percent >= 40) return "🟧"; // Medium
  return "🟥"; // Weak
};

// In-memory store for now (can move to DB later)
let pairStrengths = [
  { symbol: "GBPUSD", percent: 15 },
  { symbol: "CHFJPY", percent: 62 },
  { symbol: "NZDUSD", percent: 86 },
];

// ✅ Get ranked pairs with colors
exports.getRankedPairs = async () => {
  const ranked = [...pairStrengths].sort((a, b) => b.percent - a.percent);
  return ranked.map(p => ({
    ...p,
    color: getColorByPercent(p.percent)
  }));
};
// ✅ Get all symbols currently tracked
exports.getAllSymbols = async () => {
  return pairStrengths.map(p => p.symbol);
};


// ✅ Update strength values (from TradingView webhook)
exports.updatePairStrength = async (symbol, percent) => {
  const idx = pairStrengths.findIndex(p => p.symbol === symbol);
  if (idx >= 0) {
    pairStrengths[idx].percent = percent;
  } else {
    pairStrengths.push({ symbol, percent });
  }
};

// ✅ Get strongest pair at the moment
exports.getStrongestPair = async () => {
  if (pairStrengths.length === 0) return null;
  const ranked = [...pairStrengths].sort((a, b) => b.percent - a.percent);
  const top = ranked[0];
  return { ...top, color: getColorByPercent(top.percent) };
};
