// server/utils/propFirmAPI.js
/**
 * PropFirm MetaTrader API Utility
 * Handles connecting to PropFirm MT5 accounts and fetching live account info
 */

const { spawn } = require("child_process");

const PropConnector = {
  login: async ({ login, password, server }) => {
    return new Promise((resolve, reject) => {
      const path = require("path");
      const py = spawn("python", [
        path.join(__dirname, "mt5_connector.py"),
        login,
        password,
        server,
      ]);

      let output = "";
      py.stdout.on("data", (data) => {
        output += data.toString();
      });
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
      const py = spawn("python", [__dirname + "/mt5_get_summary.py", login]);
      let output = "";
      py.stdout.on("data", (data) => {
        output += data.toString();
      });
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
      const py = spawn("python", [__dirname + "/mt5_get_trades.py", login]);
      let output = "";
      py.stdout.on("data", (data) => {
        output += data.toString();
      });
      py.stderr.on("data", (err) => reject(err.toString()));
      py.on("close", () => {
        try {
          resolve(JSON.parse(output.trim()));
        } catch (e) {
          reject("Invalid JSON from mt5_get_trades.py: " + output);
        }
      });
    });
  },
};

/**
 * Connect to PropFirm MT account
 * @param {Object} param0
 * @param {string} param0.login
 * @param {string} param0.password
 * @param {string} param0.server
 * @returns {Promise<{success: boolean, message?: string, currency?: string}>}
 */
async function connect({ login, password, server }) {
  try {
    if (!login || !password || !server) {
      return { success: false, message: "Login, password, and server are required" };
    }

    console.log(`🌐 Connecting to PropFirm MT account ${login} on server ${server}...`);

    const connected = await PropConnector.login({ login, password, server });

    if (!connected.success) {
      return { success: false, message: connected.message || "Failed to connect MT account" };
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
    console.error("Error in PropFirmAPI.connect:", err);
    return { success: false, message: "Failed to connect to MT account" };
  }
}

/**
 * Fetch live PropFirm account info
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

    const connected = await PropConnector.login({ login, password, server });
    if (!connected.success) {
      return { success: false, message: connected.message || "Failed to connect MT account" };
    }

    const summary = await PropConnector.getAccountSummary(login);
    const trades = await PropConnector.getOpenTrades(login);

    const data = {
      balance: summary.balance,
      equity: summary.equity,
      margin: summary.margin,
      freeMargin: summary.freeMargin,
      marginLevel: summary.marginLevel,
      currency: summary.currency,
      trades: Array.isArray(trades) && trades.length > 0
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
    console.error("Error in PropFirmAPI.fetchAccountInfo:", err);
    return { success: false, message: "Failed to fetch account info" };
  }
}

module.exports = { connect, fetchAccountInfo };
