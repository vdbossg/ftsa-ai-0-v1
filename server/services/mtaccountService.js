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

    py.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    py.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    py.on("close", (code) => {
      if (stderr) console.error("⚠️ Python stderr:", stderr);
      if (code !== 0) console.error("⚠️ Python exited with code:", code);

      try {
        const parsed = JSON.parse(stdout.trim());
        resolve(parsed);
      } catch (err) {
        console.error("❌ Failed to parse Python JSON:", stdout);
        resolve({ success: false, message: "Invalid JSON from Python" });
      }
    });
  });
}

/**
 * Connect and store MT account in MongoDB.
 */
async function connectMTAccount({ broker, login, password, server, platform, accountType }) {
  try {
    const loginStr = String(login).trim();
    console.log(`🌐 Connecting MT5 account ${loginStr} on ${server}...`);

    // 🐍 Run Python script to validate connection & fetch summary
    const result = await runPythonMT5Summary(loginStr, password, server);
    console.log("🐍 Python result:", result);

    if (!result.success) {
      return { success: false, message: result.message || "Failed to connect MT account" };
    }

    // 🧩 Ensure the account is stored in MongoDB
    let account = await MTAccountModel.findOne({ login: loginStr });
    if (account) {
      Object.assign(account, {
        broker,
        password,
        server,
        platform,
        accountType,
        currency: result.currency || account.currency,
      });
      await account.save();
      console.log("🔁 Updated existing MT account in DB");
    } else {
      account = await MTAccountModel.create({
        broker,
        login: loginStr,
        password,
        server,
        platform,
        accountType,
        currency: result.currency || "USD",
      });
      console.log("💾 Created new MT account in DB");
    }

    return {
      success: true,
      message: "MT account connected successfully",
      account,
      ...result, // Includes balance, equity, etc.
    };
  } catch (err) {
    console.error("💥 Error connecting MT account:", err);
    return { success: false, message: err.message || "Unexpected error" };
  }
}

/**
 * Get the first stored MT account
 */
async function getMTAccount() {
  try {
    const account = await MTAccountModel.findOne({});
    if (!account) {
      console.warn("⚠️ No MT account found in MongoDB");
      return null;
    }
    return account;
  } catch (err) {
    console.error("💥 Error fetching MT account:", err);
    return null;
  }
}

/**
 * Delete all MT accounts
 */
async function deleteMTAccount() {
  try {
    const result = await MTAccountModel.deleteMany({});
    if (result.deletedCount > 0) {
      console.log(`🗑️ Deleted ${result.deletedCount} MT accounts`);
      return { success: true, message: "MT account deleted successfully" };
    }
    return { success: false, message: "No MT account to delete" };
  } catch (err) {
    console.error("💥 Error deleting MT account:", err);
    return { success: false, message: "Unexpected error" };
  }
}

module.exports = {
  getMTAccount,
  connectMTAccount,
  deleteMTAccount,
};
