// server/utils/metaTraderAPI_MT4.js
/**
 * MetaTrader 4 API Utility
 * Handles connecting to MT4 accounts and fetching live account info
 * Mirrors the MT5 version but calls mt4_* Python scripts instead.
 */

const { spawn } = require("child_process");
const path = require("path");

const MT4Connector = {
  login: async ({ login, password, server }) => {
    return new Promise((resolve, reject) => {
      const py = spawn("python", [path.join(__dirname, "mt4_connector.py"), login, password, server]);
      let output = "";
      py.stdout.on("data", (data) => {
        output += data.toString();
      });
      py.stderr.on("data", (err) => reject(err.toString()));
      py.on("close", () => {
        try {
          resolve(JSON.parse(output.trim()));
        } catch (e) {
          reject("Invalid JSON from mt4_connector.py: " + output);
        }
      });
    });
  },

  getAccountSummary: async (login) => {
    return new Promise((resolve, reject) => {
      const py = spawn("python", [path.join(__dirname, "mt4_get_summary.py"), login]);
      let output = "";
      py.stdout.on("data", (data) => {
        output += data.toString();
      });
      py.stderr.on("data", (err) => reject(err.toString()));
      py.on("close", () => {
        try {
          resolve(JSON.parse(output.trim()));
        } catch (e) {
          reject("Invalid JSON from mt4_get_summary.py: " + output);
        }
      });
    });
  },

  getOpenTrades: async (login) => {
    return new Promise((resolve, reject) => {
      const py = spawn("python", [path.join(__dirname, "mt4_get_trades.py"), login]);
      let output = "";
      py.stdout.on("data", (data) => {
        output += data.toString();
      });
      py.stderr.on("data", (err) => reject(err.toString()));
      py.on("close", () => {
        try {
          resolve(JSON.parse(output.trim()));
        } catch (e) {
          reject("Invalid JSON from mt4_get_trades.py: " + output);
        }
      });
    });
  },
};

/**
 * Connect to MT4 account
 */
async function connect({ login, password, server }) {
  try {
    if (!login || !password || !server) {
      return { success: false, message: "Login, password, and server are required" };
    }

    console.log(`🌐 Connecting to MT4 account ${login} on server ${server}...`);

    const connected = await MT4Connector.login({ login, password, server });

    if (!connected.success) {
      return { success: false, message: connected.message || "Failed to connect MT4 account" };
    }

    return {
      success: true,
      currency: connected.currency,
      login: connected.login,
      balance: connected.balance,
      equity: connected.equity,
      margin: connected.margin,
      freeMargin: connected.freeMargin,
      marginLevel: connected.marginLevel,
    };
  } catch (err) {
    console.error("Error in MetaTraderAPI_MT4.connect:", err);
    return { success: false, message: "Failed to connect to MT4 account" };
  }
}

/**
 * Fetch live MT4 account info
 */
async function fetchAccountInfo({ login, password, server }) {
  try {
    if (!login || !password || !server) {
      return { success: false, message: "Login, password, and server are required" };
    }

    const connected = await MT4Connector.login({ login, password, server });
    if (!connected.success) {
      return { success: false, message: connected.message || "Failed to connect MT4 account" };
    }

    const summary = await MT4Connector.getAccountSummary(login);
    const trades = await MT4Connector.getOpenTrades(login);

    const data = {
      balance: summary.balance,
      equity: summary.equity,
      margin: summary.margin,
      freeMargin: summary.freeMargin,
      marginLevel: summary.marginLevel,
      currency: summary.currency,
      trades: Array.isArray(trades)
        ? trades.map((t) => ({
            symbol: t.symbol,
            ticket: t.ticket,
            type: t.type,
            volume: t.volume,
            entryPrice: t.entry_price,
            sl: t.sl,
            tp: t.tp,
            price: t.price,
            profit: t.profit,
            time: t.time,
          }))
        : [],
    };

    return { success: true, data };
  } catch (err) {
    console.error("Error in MetaTraderAPI_MT4.fetchAccountInfo:", err);
    return { success: false, message: "Failed to fetch MT4 account info" };
  }
}

module.exports = { connect, fetchAccountInfo };
