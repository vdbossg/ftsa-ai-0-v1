// server/utils/metaTraderAPI.js
/**
 * MetaTrader API Utility
 * Handles connecting to MT4/MT5 accounts and fetching live account info
 */

 const { spawn } = require("child_process");
 const fs = require("fs");
const os = require("os");

const openMT5 = () => {
  return new Promise((resolve, reject) => {
    const desktopPath = path.join(os.homedir(), "Desktop");
    const possiblePaths = [
      path.join(desktopPath, "MetaTrader 5", "terminal64.exe"), // Desktop installation
      "C:\\Program Files\\MetaTrader 5\\terminal64.exe",         // Standard Program Files
      "C:\\Program Files (x86)\\MetaTrader 5\\terminal64.exe"   // 32-bit fallback
    ];

    const mt5Path = possiblePaths.find(p => fs.existsSync(p));

    if (!mt5Path) {
      return reject("MT5 terminal not found on Desktop or Program Files.");
    }

    // Check if MT5 is already running
    const isWin = os.platform() === "win32";
    if (isWin) {
      const tasklist = spawn("tasklist");
      let output = "";
      tasklist.stdout.on("data", data => output += data.toString());
      tasklist.on("close", () => {
        if (output.toLowerCase().includes("terminal64.exe")) {
          console.log("✅ MT5 already running");
          return resolve(true);
        }

        // Launch MT5 if not running
        const py = spawn(mt5Path, [], { detached: true, stdio: "ignore" });
        py.unref();
        console.log(`🚀 MT5 launched from: ${mt5Path}`);
        setTimeout(() => resolve(true), 4000); // wait for MT5 to start
      });
    } else {
      reject("MT5 auto-launch is only supported on Windows.");
    }
  });
};
const MTConnector = {
  login: async ({ login, password, server }) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Auto-launch MT5 first
      await openMT5();

      const path = require("path");
      const py = spawn("python", [
        path.join(__dirname, "mt5_connector.py"),
        login,
        password,
        server
      ]);

      let output = "";
      py.stdout.on("data", (data) => { output += data.toString(); });
      py.stderr.on("data", (err) => reject(err.toString()));

      py.on("close", () => {
        try {
          const res = JSON.parse(output.trim());
          resolve(res);
        } catch (e) {
          reject("Invalid JSON from mt5_connector.py: " + output);
        }
      });
    } catch (err) {
      reject("Failed to launch MT5: " + err);
    }
  });
},

getAccountSummary: async ({ login, password, server }) => {
  const res = await MTConnector.login({ login, password, server });
  if (!res.success) throw new Error(res.message || "Failed to connect");
  const path = require("path");
  return new Promise((resolve, reject) => {
    const py = spawn("python", [path.join(__dirname, "mt5_get_summary.py"), login, password, server]);
    let output = "";
    py.stdout.on("data", (data) => { output += data.toString(); });
    py.stderr.on("data", (err) => reject(err.toString()));
    py.on("close", () => {
      try { resolve(JSON.parse(output.trim())); }
      catch (e) { reject("Invalid JSON from mt5_get_summary.py: " + output); }
    });
  });
},
 getOpenTrades: async ({ login, password, server }) => {
  const res = await MTConnector.login({ login, password, server });
  if (!res.success) throw new Error(res.message || "Failed to connect");
  const path = require("path");
  return new Promise((resolve, reject) => {
    const py = spawn("python", [path.join(__dirname, "mt5_get_trades.py"), login, password, server]);
    let output = "";
    py.stdout.on("data", (data) => { output += data.toString(); });
    py.stderr.on("data", (err) => reject(err.toString()));
    py.on("close", () => {
      try { resolve(JSON.parse(output.trim())); }
      catch (e) { reject("Invalid JSON from mt5_get_trades.py: " + output); }
    });
  });
},
}

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

    const connected = await MTConnector.login({ login, password, server });

    // If Python failed
    if (!connected.success) {
      return { success: false, message: connected.message || "Failed to connect MT account" };
    }

    // Return all relevant info
    return {
      success: true,
      currency: connected.currency,
      login: connected.login,
      balance: connected.balance,
      equity: connected.equity,
      margin: connected.margin,
      freeMargin: connected.freeMargin,
      marginLevel: connected.marginLevel
    };

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
const summary = await MTConnector.getAccountSummary({ login, password, server });

// Fetch live open trades
const trades = await MTConnector.getOpenTrades({ login, password, server });

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
