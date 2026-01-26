// server/services/mtaccountService.js
const { spawn } = require("child_process");
const path = require("path");
const MTAccountModel = require("../models/MTAccountModel");

/**
 * Executes a Python script to fetch MT5 account summary.
 */
async function runPythonMT5Summary(login, password, server) {
  const pyPath = path.join(__dirname, "../utils/mt5_get_summary.py");

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
 * Connect and store MT5 account in MongoDB.
 */
async function connectMTAccount({ broker, login, password, server, platform = "MT5", accountType = "demo" }) {
  const loginStr = String(login).trim();

  try {
    console.log(`🌐 Connecting MT5 account ${loginStr} on ${server}...`);

    // Fetch summary via Python
    const result = await runPythonMT5Summary(loginStr, password, server);

    let account = await MTAccountModel.findOne({ login: loginStr, platform: "MT5" });
    if (account) {
      Object.assign(account, {
        broker,
        password,
        server,
        platform,
        accountType,
        currency: result.currency || account.currency || "USD",
        isConnected: result.success || false,
      });
      await account.save();
      console.log("🔁 Updated existing MT5 account in DB");
    } else {
      account = await MTAccountModel.create({
        broker,
        login: loginStr,
        password,
        server,
        platform,
        accountType,
        currency: result.currency || "USD",
        isConnected: result.success || false,
      });
      console.log("💾 Created new MT5 account in DB");
    }

    return {
      success: true,
      message: result.success
        ? "MT5 account connected successfully"
        : "MT5 account saved but connection failed",
      account,
      summary: result.success ? result : {},
    };
  } catch (err) {
    console.error("💥 Error connecting MT5 account:", err);
    return { success: false, message: err.message || "Unexpected error" };
  }
}

/**
 * Get all stored MT5 accounts.
 */
async function getMTAccount() {
  try {
    const accounts = await MTAccountModel.find({ platform: "MT5" });
    return accounts || [];
  } catch (err) {
    console.error("💥 Error fetching MT5 accounts:", err);
    return [];
  }
}

/**
 * Delete a specific MT5 account by login.
 */
async function deleteMTAccount(login) {
  try {
    const result = await MTAccountModel.deleteOne({ login, platform: "MT5" });
    if (result.deletedCount > 0) {
      console.log(`🗑️ Deleted MT5 account ${login}`);
      return { success: true, message: `MT5 account ${login} deleted successfully` };
    }
    return { success: false, message: `No MT5 account found with login ${login}` };
  } catch (err) {
    console.error("💥 Error deleting MT5 account:", err);
    return { success: false, message: "Unexpected error" };
  }
}

module.exports = {
  getMTAccount,
  connectMTAccount,
  deleteMTAccount,
};
