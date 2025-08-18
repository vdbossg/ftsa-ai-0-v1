exports.calculateStrength = async () => {
  // TODO: Connect to TradingView or other API
  // For now, return mock sorted symbols
  return [
    { symbol: 'GBPUSD', percent: 15, color: 'red' },
    { symbol: 'CHFJPY', percent: 62, color: 'orange' },
    { symbol: 'NZDUSD', percent: 86, color: 'green' }
  ];
};

exports.makeTradeDecision = async () => {
  // TODO: Real logic combining HTF + LTF + CHoCH
  return { action: 'SELL', symbol: 'NZDUSD', confidence: 95 };
};
