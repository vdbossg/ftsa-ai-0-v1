const PropTrade = require('../models/PropTrade');

class PropTradeController {
  static async saveClosedTrade(tradeData) {
    try {
      // Explicitly pick all fields to match frontend JSON structure
      const {
        ticket,
        broker,
        login,
        summary = {},
        trades = [],
        symbol,
        type,
        volume,
        open_price,
        current_price,
        sl,
        tp,
        profit,
        time,
        closed_time,
        closed_reason,
        status = 'closed',
        chartData = []
      } = tradeData;

      const trade = new PropTrade({
        ticket,
        broker,
        login,
        summary,
        trades,
        symbol,
        type,
        volume,
        open_price,
        current_price,
        sl,
        tp,
        profit,
        time,
        closed_time,
        closed_reason,
        status,
        chartData
      });

      await trade.save();

      console.log(`Prop closed trade saved: ticket ${ticket}`);
    } catch (err) {
      console.error('Error saving Prop closed trade:', err.message);
    }
  }
}

module.exports = PropTradeController;
