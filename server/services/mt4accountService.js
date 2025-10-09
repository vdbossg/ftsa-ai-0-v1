// server/services/mt4accountService.js
const { spawn } = require("child_process");
const path = require("path");
const MTAccountModel = require("../models/MTAccountModel");

/**
 * Executes a Python script to fetch MT4 account summary.
 */
async function runPythonMT4Summary(login, password, server) {
  const pyPath = path.join(__dirname, "../utils/mt4_get_summary.py");

  return new Promise((resolve) => {
    const py = spawn("python", [pyPath, login, password, server]);

    let stdout = "";
    let stderr = "";

    py.stdout.on("data", (data) => (stdout += data.toString()));
    py.stderr.on("data", (data) => (stderr += data.toString()));

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
 * Connect and store MT4 account in MongoDB.
 */
async function connectMT4Account({ broker, login, password, server, platform, accountType }) {
  try {
    const loginStr = String(login).trim();
    console.log(`🌐 Connecting MT4 account ${loginStr} on ${server}...`);

    // 🐍 Run Python script to validate connection & fetch summary
    const result = await runPythonMT4Summary(loginStr, password, server);
    console.log("🐍 Python result:", result);

    if (!result.success) {
      return { success: false, message: result.message || "Failed to connect MT4 account" };
    }

    // 🧩 Save or update account in MongoDB
    let account = await MTAccountModel.findOne({ login: loginStr, platform: "MT4" });
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
      console.log("🔁 Updated existing MT4 account in DB");
    } else {
      account = await MTAccountModel.create({
        broker,
        login: loginStr,
        password,
        server,
        platform: "MT4",
        accountType,
        currency: result.currency || "USD",
      });
      console.log("💾 Created new MT4 account in DB");
    }

    return {
      success: true,
      message: "MT4 account connected successfully",
      account,
      ...result,
    };
  } catch (err) {
    console.error("💥 Error connecting MT4 account:", err);
    return { success: false, message: err.message || "Unexpected error" };
  }
}

/**
 * Get all stored MT4 accounts.
 */
async function getMT4Account() {
  try {
    const accounts = await MTAccountModel.find({ platform: "MT4" });
    if (!accounts || accounts.length === 0) {
      console.warn("⚠️ No MT4 accounts found in MongoDB");
      return [];
    }
    return accounts;
  } catch (err) {
    console.error("💥 Error fetching MT4 accounts:", err);
    return [];
  }
}

/**
 * Delete a specific MT4 account by login.
 */
async function deleteMT4Account(login) {
  try {
    const result = await MTAccountModel.deleteOne({ login, platform: "MT4" });
    if (result.deletedCount > 0) {
      console.log(`🗑️ Deleted MT4 account ${login}`);
      return { success: true, message: `MT4 account ${login} deleted successfully` };
    }
    return { success: false, message: `No MT4 account found with login ${login}` };
  } catch (err) {
    console.error("💥 Error deleting MT4 account:", err);
    return { success: false, message: "Unexpected error" };
  }
}

module.exports = {
  getMT4Account,
  connectMT4Account,
  deleteMT4Account,
};
