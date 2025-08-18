// server/services/chochService.js

// In-memory storage for now (can replace with DB later)
const ltfChochData = {};  // { symbol: { side, valid, updatedAt } }

// ✅ Store Lower Timeframe CHoCH data
exports.storeLTF = async (symbol, side, valid) => {
  ltfChochData[symbol] = {
    side,
    valid,
    updatedAt: new Date().toISOString()
  };
  console.log(`📦 LTF CHoCH stored: ${symbol} - ${side} - valid=${valid}`);
};

// ✅ Retrieve Lower Timeframe CHoCH data
exports.getLTF = async (symbol) => {
  return ltfChochData[symbol] || { side: null, valid: false };
};

// ✅ Optional: Retrieve all stored CHoCH data
exports.getAll = async () => {
  return ltfChochData;
};
// ✅ Get current CHoCH direction for all symbols
exports.getDirection = async () => {
  const result = {};
  for (const symbol in ltfChochData) {
    result[symbol] = {
      side: ltfChochData[symbol].side,
      valid: ltfChochData[symbol].valid,
      updatedAt: ltfChochData[symbol].updatedAt
    };
  }
  return result;
};


// ✅ Determine valid CHoCH signal for a trade
exports.isValidTradeSignal = async (symbol, expectedSide) => {
  const data = ltfChochData[symbol];
  if (!data) return false;
  return data.valid && data.side === expectedSide;
};
