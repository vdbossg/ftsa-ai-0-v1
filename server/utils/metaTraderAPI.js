// server/utils/metaTraderAPI.js
/**
 * MetaTrader API Utility
 * Handles connecting to MT4/MT5 accounts and fetching live account info
 */

 const { spawn } = require("child_process");
const MTConnector = {
  login: async ({ login, password, server }) => {
  return new Promise((resolve, reject) => {
    const py = spawn("python3", ["server/utils/mt5_connector.py", login, password, server]);
    let output = "";
    py.stdout.on("data", (data) => { output += data.toString(); });
    py.stderr.on("data", (err) => reject(err.toString()));
    py.on("close", () => {
      try {
        resolve(JSON.parse(output.trim()));
      } catch (e) {
        reject("Invalid JSON from mt5_connector.py: " + output);
      }
    });
  });
},

  getAccountSummary: async (login) => {
  return new Promise((resolve, reject) => {
    const py = spawn("python3", ["server/utils/mt5_get_summary.py", login]);
    let output = "";
    py.stdout.on("data", (data) => { output += data.toString(); });
    py.stderr.on("data", (err) => reject(err.toString()));
    py.on("close", () => {
      try {
        resolve(JSON.parse(output.trim()));
      } catch (e) {
        reject("Invalid JSON from mt5_get_summary.py: " + output);
      }
    });
  });
},
  getOpenTrades: async (login) => {
  return new Promise((resolve, reject) => {
    const py = spawn("python3", ["server/utils/mt5_get_trades.py", login]);
    let output = "";
    py.stdout.on("data", (data) => { output += data.toString(); });
    py.stderr.on("data", (err) => reject(err.toString()));
    py.on("close", () => {
      try {
        resolve(JSON.parse(output.trim()));
      } catch (e) {
        reject("Invalid JSON from mt5_get_trades.py: " + output);
      }
    });
  });
  }
};

// <- Replace this with your real MT4/MT5 library or wrapper for Node/Python bridge

/**
 * Connect to MT account
 * @param {Object} param0
 * @param {string} param0.login - MT account login
 * @param {string} param0.password - MT account password
 * @param {string} param0.server - MT server
 * @returns {Promise<{success: boolean, message?: string, currency?: string}>}
 */
async function connect({ login, password, server }) {
  try {
    if (!login || !password || !server) {
      return { success: false, message: "Login, password, and server are required" };
    }

    console.log(`🌐 Connecting to MT account ${login} on server ${server}...`);

    // Replace with real MT login call
    const connected = await MTConnector.login({ login, password, server });

    if (!connected.success) {
      return { success: false, message: connected.message || "Failed to connect MT account" };
    }

    return { success: true, currency: connected.currency };
  } catch (err) {
    console.error("Error in MetaTraderAPI.connect:", err);
    return { success: false, message: "Failed to connect to MT account" };
  }
}

/**
 * Fetch live account info
 * @param {Object} param0
 * @param {string} param0.login
 * @param {string} param0.password
 * @param {string} param0.server
 * @returns {Promise<{success: boolean, data: Object, message?: string}>}
 */
async function fetchAccountInfo({ login, password, server }) {
  try {
    if (!login || !password || !server) {
      return { success: false, message: "Login, password, and server are required" };
    }

    // Connect first
    const connected = await MTConnector.login({ login, password, server });
if (!connected.success) {
  return { success: false, message: connected.message || "Failed to connect MT account" };
}

// Fetch live account summary
const summary = await MTConnector.getAccountSummary(login);

// Fetch live open trades
const trades = await MTConnector.getOpenTrades(login);

const data = {
  balance: summary.balance,
  equity: summary.equity,
  margin: summary.margin,
  freeMargin: summary.freeMargin,
  marginLevel: summary.marginLevel,
  currency: summary.currency,
  trades: Array.isArray(trades) && trades.length > 0
    ? trades.map(t => ({
        symbol: t.symbol,
        ticket: t.ticket,
        type: t.type,
        volume: t.volume,
        entryPrice: t.entry_price,
        sl: t.sl,
        tp: t.tp,
        price: t.price,
        profit: t.profit,
        time: t.time
    }))
    : [],
};

return { success: true, data };

  } catch (err) {
    console.error("Error in MetaTraderAPI.fetchAccountInfo:", err);
    return { success: false, message: "Failed to fetch account info" };
  }
}

module.exports = { connect, fetchAccountInfo };
