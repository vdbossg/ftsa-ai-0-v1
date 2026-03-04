const axios = require('axios');
const ClosedTradeController = require('../controllers/propTradeController');

class PropTradeService {
  constructor() {
    this.endpoint = 'https://ftsa-ai-backend.onrender.com/api/proptabletrades';
    this.activeTrades = new Map(); // key = ticket
  }

  
  async pollTrades() {
    try {
      const response = await axios.get(this.endpoint);
      const accounts = response.data.data || [];

      const currentTickets = new Set();

      for (const account of accounts) {
        for (const trade of account.trades || []) {
          currentTickets.add(trade.ticket);
          // store account reference with trade
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

if (trade.sl && trade.tp) {
  if (trade.type === 'BUY') {
    if (trade.sl !== 0 && price <= trade.sl) closed_reason = 'SL hit';
    else if (trade.tp !== 0 && price >= trade.tp) closed_reason = 'TP hit';
  } else if (trade.type === 'SELL') {
    if (trade.sl !== 0 && price >= trade.sl) closed_reason = 'SL hit';
    else if (trade.tp !== 0 && price <= trade.tp) closed_reason = 'TP hit';
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
            trades: [trade], // ✅ only this trade
            closed_time: new Date(),
            closed_reason,
            status: 'closed'
          };

          await ClosedTradeController.saveClosedTrade(closedTrade);
          this.activeTrades.delete(ticket);
        }
      }
    } catch (err) {
      console.error('Error polling Prop trades:', err.message);
    }
  }

  async closeAllActiveTrades() {
    try {
      for (const [ticket, trade] of this.activeTrades.entries()) {

        /// ✅ Correct SL/TP detection
let closed_reason = 'Manual exit';
const price = trade.close_price ?? trade.current_price;

if (trade.sl && trade.tp) {
  if (trade.type === 'BUY') {
    if (trade.sl !== 0 && price <= trade.sl) closed_reason = 'SL hit';
    else if (trade.tp !== 0 && price >= trade.tp) closed_reason = 'TP hit';
  } else if (trade.type === 'SELL') {
    if (trade.sl !== 0 && price >= trade.sl) closed_reason = 'SL hit';
    else if (trade.tp !== 0 && price <= trade.tp) closed_reason = 'TP hit';
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
          trades: [trade],
          closed_time: new Date(),
          closed_reason,
          status: 'closed'
        };

        await ClosedTradeController.saveClosedTrade(closedTrade);
        this.activeTrades.delete(ticket);
      }

      console.log('✅ All Prop active trades closed.');
    } catch (err) {
      console.error('Error closing Prop active trades:', err.message);
    }
  }

  startPolling(intervalMs = 5000) {
    this.pollTrades();
    setInterval(() => this.pollTrades(), intervalMs);
  }
}

module.exports = new PropTradeService();
