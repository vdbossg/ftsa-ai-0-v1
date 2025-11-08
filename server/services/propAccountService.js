// server/services/propAccountService.js
const { spawn } = require("child_process");
const path = require("path");
const PropAccountModel = require("../models/PropAccount");


/**
 * Executes the PropFirm Python script to fetch MT5 account summary.
 */
async function runPythonPropMT5Summary(login, password, server) {
  const pyPath = path.join(__dirname, "../utils/prop_mt5_get_summary.py"); // <--- updated

  return new Promise((resolve) => {
    const py = spawn("python", [pyPath, login, password, server]);

    let stdout = "";
    let stderr = "";

    py.stdout.on("data", (data) => (stdout += data.toString()));
    py.stderr.on("data", (data) => (stderr += data.toString()));

    py.on("close", (code) => {
      if (stderr) console.warn("⚠️ Python stderr:", stderr.trim());
      if (code !== 0) console.warn("⚠️ Python exited with code:", code);

      try {
        const parsed = JSON.parse(stdout.trim());
        resolve(parsed);
      } catch (err) {
        console.warn("❌ Failed to parse Python JSON:", stdout.trim());
        resolve({ success: false, message: "Invalid JSON from Python" });
      }
    });
  });
}
/**
 * Executes the PropFirm Python script to fetch open trades for MT5 account.
 */
async function runPythonPropMT5Trades(login, password, server) {
  const pyPath = path.join(__dirname, "../utils/prop_mt5_get_trades.py");

  return new Promise((resolve) => {
    const py = spawn("python", [pyPath, login, password, server]);

    let stdout = "";
    let stderr = "";

    py.stdout.on("data", (data) => (stdout += data.toString()));
    py.stderr.on("data", (data) => (stderr += data.toString()));

    py.on("close", (code) => {
      if (stderr) console.warn("⚠️ Python stderr:", stderr.trim());
      if (code !== 0) console.warn("⚠️ Python exited with code:", code);

      try {
        const parsed = JSON.parse(stdout.trim());
        resolve(parsed);
      } catch (err) {
        console.warn("❌ Failed to parse Python JSON:", stdout.trim());
        resolve({ success: false, data: [] });
      }
    });
  });
}

/**
 * Connect and store Prop MT5 account in MongoDB.
 */
async function connectPropAccount({ broker, login, password, server, platform = "MT5", accountType = "demo" }) {
  const loginStr = String(login).trim();

  try {
    console.log(`🌐 Connecting Prop MT5 account ${loginStr} on ${server}...`);

    const result = await runPythonPropMT5Summary(loginStr, password, server); // <--- updated

    // 1️⃣ Disconnect all other accounts first
await PropAccountModel.updateMany(
  { platform: "MT5", login: { $ne: loginStr } },
  { $set: { isConnected: false } }
);

// 2️⃣ Find or create the current account
let account = await PropAccountModel.findOne({ login: loginStr, platform: "MT5" });
if (account) {
  Object.assign(account, {
  broker: broker?.trim() || "Unknown Broker",
  password,
  server: server?.trim() || "Unknown Server",
  platform,
  accountType,
  currency: result.data?.currency || account.currency || "USD",
  isConnected: result.success || false,
});

  await account.save();
  console.log("🔁 Updated existing Prop MT5 account in DB");
} else {
 account = await PropAccountModel.create({
  broker: broker?.trim() || "Unknown Broker",
  login: loginStr,
  password,
  server: server?.trim() || "Unknown Server",
  platform,
  accountType,
  currency: result.data?.currency || "USD",
  isConnected: result.success || false,
});

  console.log("💾 Created new Prop MT5 account in DB");
}


    return {
      success: true,
      message: result.success
        ? "Prop MT5 account connected successfully"
        : "Prop MT5 account saved but connection failed",
      account,
      summary: result.success ? result.data : {},
    };
  } catch (err) {
    console.error("💥 Error connecting Prop MT5 account:", err);
    return { success: false, message: err.message || "Unexpected error" };
  }
}

/**
 * Get all stored Prop MT5 accounts.
 */
async function getPropAccount() {
  try {
    const accounts = await PropAccountModel.find({ platform: "MT5" }).lean();

    const accountsWithTrades = await Promise.all(
      accounts.map(async (a) => {
        let trades = { success: true, data: [] };

        try {
          // Fetch trades from Python script
          trades = await runPythonPropMT5Trades(a.login, a.password, a.server);
        } catch (err) {
          console.warn(`⚠️ Failed to fetch trades for ${a.login}:`, err);
        }

        return {
          ...a,
          broker: a.broker?.trim() || "Unknown Broker",
          server: a.server?.trim() || "Unknown Server",
          trades,
        };
      })
    );

    return accountsWithTrades;
  } catch (err) {
    console.error("💥 Error fetching Prop MT5 accounts:", err);
    return [];
  }
}



/**
 * Delete a specific Prop MT5 account by login.
 */
async function deletePropAccount(login) {
  try {
    const result = await PropAccountModel.deleteOne({ login, platform: "MT5" });
    if (result.deletedCount > 0) {
      console.log(`🗑️ Deleted Prop MT5 account ${login}`);
      return { success: true, message: `Prop MT5 account ${login} deleted successfully` };
    }
    return { success: false, message: `No Prop MT5 account found with login ${login}` };
  } catch (err) {
    console.error("💥 Error deleting Prop MT5 account:", err);
    return { success: false, message: "Unexpected error" };
  }
}

module.exports = {
  getPropAccount,
  connectPropAccount,
  deletePropAccount,
};
