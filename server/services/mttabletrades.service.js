const axios = require("axios");

const fetchMTAccountsRaw = async () => {
  const res = await axios.get("http://localhost:5000/api/mtaccounts");
  return res.data; // raw MT accounts array
};

const getAllMTAccountsTrades = async () => {
  const rawAccounts = await fetchMTAccountsRaw();

  // Transform to frontend expected format
  return rawAccounts.map(account => ({
    broker: account.broker,
    login: account.login,
    summary: {
      data: {
        balance: account.balance || 0,
        equity: account.equity || 0,
        margin: account.margin || 0,
        freeMargin: account.freeMargin || 0
      }
    },
    trades: (account.trades || []).map(trade => ({
      symbol: trade.symbol,
      ticket: trade.ticket,
      time: trade.time,
      type: trade.type,
      volume: trade.volume,
      open_price: trade.open_price,
      current_price: trade.current_price,
      sl: trade.sl,
      tp: trade.tp,
      profit: trade.profit
    }))
  }));
};

module.exports = {
  getAllMTAccountsTrades
};
