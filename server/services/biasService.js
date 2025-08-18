// In-memory storage (ready to move to DB later)
const htfBiasData = {};  // { symbol: { side, score, updatedAt } }

// Store HTF bias
exports.storeHTFBias = async (symbol, side, score) => {
  htfBiasData[symbol] = {
    side,
    score,
    updatedAt: new Date().toISOString()
  };
  console.log(`📦 HTF bias stored: ${symbol} - ${side} (${score})`);
};

// Retrieve HTF bias
exports.getHTFBias = async (symbol) => {
  return htfBiasData[symbol] || { side: null, score: 0 };
};

// Optional: Get all stored biases
exports.getAllHTFBiases = async () => {
  return htfBiasData;
};

// Check if bias meets threshold for trade
exports.isValidBias = async (symbol, expectedSide, minScore = 70) => {
  const data = htfBiasData[symbol];
  if (!data) return false;
  return data.side === expectedSide && data.score >= minScore;
};
