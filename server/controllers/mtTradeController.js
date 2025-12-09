const MTTrade = require('../models/MTTrade');

class MTTradeController {
  static async saveClosedTrade(tradeData) {
    try {
      const trade = new MTTrade(tradeData);
      await trade.save();
      console.log(`MT closed trade saved: ticket ${tradeData.ticket}`);
    } catch (err) {
      console.error('Error saving MT closed trade:', err.message);
    }
  }
}

module.exports = MTTradeController;
