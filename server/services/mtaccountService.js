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
 * Get all stored MT accounts
 */
async function getMTAccount() {
  try {
    const accounts = await MTAccountModel.find({});
    if (!accounts || accounts.length === 0) {
      console.warn("⚠️ No MT accounts found in MongoDB");
      return [];
    }
    return accounts;
  } catch (err) {
    console.error("💥 Error fetching MT accounts:", err);
    return [];
  }
}

/**
 * Delete a specific MT account by login
 */
async function deleteMTAccount(login) {
  try {
    const result = await MTAccountModel.deleteOne({ login });
    if (result.deletedCount > 0) {
      console.log(`🗑️ Deleted MT account ${login}`);
      return { success: true, message: `MT account ${login} deleted successfully` };
    }
    return { success: false, message: `No MT account found with login ${login}` };
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
