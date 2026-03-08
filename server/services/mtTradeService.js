const axios = require('axios');
const ClosedTradeController = require('../controllers/mtTradeController');

class MTTradeService {
  constructor() {
    this.endpoint = 'http://localhost:5000/api/mttabletrades';
    this.activeTrades = new Map();
  }

  async pollTrades() {
    try {
      const response = await axios.get(this.endpoint);
      const accounts = response.data || [];

      const currentTickets = new Set();

      for (const account of accounts) {
        for (const trade of account.trades || []) {
          currentTickets.add(trade.ticket);
          this.activeTrades.set(trade.ticket, { ...trade, account });
        }
      }

      // Detect closed trades
      for (const [ticket, tradeObj] of this.activeTrades.entries()) {
        const { account, ...trade } = tradeObj;
        if (!currentTickets.has(ticket)) {

         // ✅ Correct SL/TP detection
let closed_reason = 'Manual exit';
const price = trade.close_price ?? trade.current_price;

// Only check SL/TP if they are set and not zero
if (trade.sl && trade.sl !== 0 && trade.tp && trade.tp !== 0) {
  if (trade.type === 'BUY') {
    if (price <= trade.sl) closed_reason = 'SL hit';
    else if (price >= trade.tp) closed_reason = 'TP hit';
  } else if (trade.type === 'SELL') {
    if (price >= trade.sl) closed_reason = 'SL hit';
    else if (price <= trade.tp) closed_reason = 'TP hit';
  }
} else if (trade.sl && trade.sl !== 0) {
  if ((trade.type === 'BUY' && price <= trade.sl) ||
      (trade.type === 'SELL' && price >= trade.sl)) closed_reason = 'SL hit';
} else if (trade.tp && trade.tp !== 0) {
  if ((trade.type === 'BUY' && price >= trade.tp) ||
      (trade.type === 'SELL' && price <= trade.tp)) closed_reason = 'TP hit';
}


          const closedTrade = {
            ...trade,
            broker: trade.broker || account?.broker || "Unknown",
            login: trade.login || account?.login || "Unknown",
            summary: account?.summary || {},
            closed_time: new Date(),
            closed_reason,
            status: 'closed'
          };

          await ClosedTradeController.saveClosedTrade(closedTrade);
          this.activeTrades.delete(ticket);
        }
      }
    } catch (err) {
      console.error('Error polling MT trades:', err.message);
    }
  }

  async closeAllActiveTrades() {
    try {
      for (const [ticket, trade] of this.activeTrades.entries()) {

        // ✅ Correct SL/TP detection
let closed_reason = 'Manual exit';
const price = trade.close_price ?? trade.current_price;

// Only check SL/TP if they are set and not zero
if (trade.sl && trade.sl !== 0 && trade.tp && trade.tp !== 0) {
  if (trade.type === 'BUY') {
    if (price <= trade.sl) closed_reason = 'SL hit';
    else if (price >= trade.tp) closed_reason = 'TP hit';
  } else if (trade.type === 'SELL') {
    if (price >= trade.sl) closed_reason = 'SL hit';
    else if (price <= trade.tp) closed_reason = 'TP hit';
  }
} else if (trade.sl && trade.sl !== 0) {
  if ((trade.type === 'BUY' && price <= trade.sl) ||
      (trade.type === 'SELL' && price >= trade.sl)) closed_reason = 'SL hit';
} else if (trade.tp && trade.tp !== 0) {
  if ((trade.type === 'BUY' && price >= trade.tp) ||
      (trade.type === 'SELL' && price <= trade.tp)) closed_reason = 'TP hit';
}


        const closedTrade = {
          ...trade,
          broker: trade.broker || "Unknown",
          login: trade.login || "Unknown",
          summary: trade.summary || {},
          closed_time: new Date(),
          closed_reason,
          status: 'closed'
        };

        await ClosedTradeController.saveClosedTrade(closedTrade);
        this.activeTrades.delete(ticket);
      }

      console.log('✅ All MT active trades closed.');
    } catch (err) {
      console.error('Error closing MT active trades:', err.message);
    }
  }

  startPolling(intervalMs = 5000) {
    this.pollTrades();
    setInterval(() => this.pollTrades(), intervalMs);
  }
}

module.exports = new MTTradeService();
