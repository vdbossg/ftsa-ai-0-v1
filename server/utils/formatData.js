// server/utils/formatData.js

// Helper to format USD values
function formatUSD(value) {
  return Number(value || 0).toFixed(2);
}

// Helper to calculate portfolio %
function calcPortfolioPct(value, total) {
  return total > 0 ? ((value / total) * 100).toFixed(2) : "0.00";
}

module.exports = {
  formatUSD,
  calcPortfolioPct,
};
