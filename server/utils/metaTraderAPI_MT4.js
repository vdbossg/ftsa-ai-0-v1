const { spawn } = require("child_process");
const path = require("path");
const MT4Account = require("../models/MT4Account"); // MongoDB model

const MT4Connector = {
  runPythonScript: (script, args) =>
    new Promise((resolve, reject) => {
      const py = spawn("python", [path.join(__dirname, script), ...args]);
      let output = "";

      py.stdout.on("data", (data) => (output += data.toString()));
      py.stderr.on("data", (err) => console.error("Python error:", err.toString()));
      py.on("close", () => {
        try {
          resolve(JSON.parse(output.trim()));
        } catch (e) {
          reject("Invalid JSON from " + script + ": " + output);
        }
      });
    }),

  login: async ({ login, password, server }) => {
    return MT4Connector.runPythonScript("mt4_connector.py", [login, password, server]);
  },

  getAccountSummary: async ({ login, password, server }) => {
    return MT4Connector.runPythonScript("mt4_get_summary.py", [login, password, server]);
  },

  getOpenTrades: async ({ login, password, server }) => {
    return MT4Connector.runPythonScript("mt4_get_trades.py", [login, password, server]);
  },
};

// Connect & store/update account in MongoDB
async function connect({ login, password, server, broker = "unknown", currency = "USD", accountType = "demo" }) {
  try {
    if (!login || !password || !server) return { success: false, message: "Missing credentials" };

    const connected = await MT4Connector.login({ login, password, server });

    if (!connected.success) return { success: false, message: connected.message };

    // Save/update in MongoDB
    const account = await MT4Account.findOneAndUpdate(
      { login },
      {
        broker,
        login,
        password,
        server,
        platform: "MT4",
        accountType,
        currency: connected.currency || currency,
        isConnected: true,
        lastConnection: new Date(),
      },
      { upsert: true, new: true }
    );

    return { success: true, data: account };
  } catch (err) {
    console.error("Error in MT4 connect:", err);
    return { success: false, message: "Failed to connect to MT4 account" };
  }
}

// Fetch full account info + trades, and persist summary
async function fetchAccountInfo({ login, password, server }) {
  try {
    if (!login || !password || !server) return { success: false, message: "Missing credentials" };

    const [summary, trades] = await Promise.all([
      MT4Connector.getAccountSummary({ login, password, server }),
      MT4Connector.getOpenTrades({ login, password, server }),
    ]);

    if (!summary.success) return { success: false, message: summary.message };
    if (!trades.success) return { success: false, message: trades.message };

    // Persist latest account summary in MongoDB
    await MT4Account.findOneAndUpdate(
      { login },
      {
        balance: summary.balance,
        equity: summary.equity,
        margin: summary.margin,
        freeMargin: summary.freeMargin,
        marginLevel: summary.marginLevel,
        lastConnection: new Date(),
      }
    );

    return {
      success: true,
      data: {
        summary,
        trades: trades.data || [],
      },
    };
  } catch (err) {
    console.error("Error in MT4 fetchAccountInfo:", err);
    return { success: false, message: "Failed to fetch MT4 account info" };
  }
}

module.exports = { connect, fetchAccountInfo };
