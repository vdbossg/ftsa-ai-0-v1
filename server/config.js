// server/config.js
module.exports = {
  port: process.env.PORT || 3000,
  // Add secrets, API keys here as needed
  binanceApiKey: process.env.BINANCE_API_KEY || '',
  binanceSecretKey: process.env.BINANCE_SECRET_KEY || '',
};
