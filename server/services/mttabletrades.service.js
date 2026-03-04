// server/services/mttabletrades.service.js
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const MTAccountModel = require("../models/MTAccountModel"); // Assuming MongoDB model for MT Account

// Helper to get current logged-in userId from currentWatcherUser.json
const getCurrentUserId = () => {
  const watcherPath = path.join(__dirname, "currentWatcherUser.json");
  try {
    const data = fs.readFileSync(watcherPath, "utf8");
    const json = JSON.parse(data);
    return json.userId || null;
  } catch (err) {
    console.error("❌ Failed to read currentWatcherUser.json:", err);
    return null;
  }
};

/**
 * Run a Python script with the provided arguments
 * @param {string} scriptPath - Path to the Python script
 * @param {array} args - Arguments to pass to the Python script
 * @returns {Promise<Object>} - Returns the parsed JSON data from the Python script output
 */
const runPythonScript = (scriptPath, args) => {
  return new Promise((resolve, reject) => {
    const py = spawn("python", [scriptPath, ...args]);
    let stdout = "";
    let stderr = "";

    py.stdout.on("data", (data) => stdout += data.toString());
    py.stderr.on("data", (data) => stderr += data.toString());

    py.on("close", (code) => {
      if (stderr) {
        console.error("⚠️ Python stderr:", stderr.trim());
      }
      if (code !== 0) {
        console.error("⚠️ Python process exited with code", code);
        reject(stderr || "Python script error");
      }

      try {
        const parsed = JSON.parse(stdout.trim());
        resolve(parsed);
      } catch (err) {
        console.error("❌ Failed to parse Python output:", stdout.trim());
        reject("Failed to parse Python output");
      }
    });
  });
};

/**
 * Fetch raw MT accounts from the backend (or MongoDB)
 * @returns {Promise<Object[]>} - Returns a list of accounts
 */
const fetchMTAccountsFromDB = async () => {
  const userId = getCurrentUserId();
  if (!userId) {
    console.error("❌ No user is currently logged in");
    return [];
  }

  const account = await MTAccountModel.findOne({ userId });
  if (!account) {
    console.error(`❌ No account found for userId: ${userId}`);
    return [];
  }

  return account;
};

/**
 * Transform MT accounts to frontend expected format, using data from MongoDB and Python
 * @returns {Promise<Object[]>} - Returns transformed data
 */
const getAllMTAccountsTrades = async () => {
  const account = await fetchMTAccountsFromDB();

  if (!account || !account.login || !account.password || !account.server) {
    return [];  // Ensure we have all necessary data
  }

  const { login, password, server } = account;
  const summaryScriptPath = path.join(__dirname, "../utils/mt5_get_summary.py");
  const tradesScriptPath = path.join(__dirname, "../utils/mt5_get_trades.py");

  try {
    // Fetch summary and trades data by running Python scripts
    const summaryResult = await runPythonScript(summaryScriptPath, [login, password, server]);
    const tradesResult = await runPythonScript(tradesScriptPath, [login, password, server]);

    return [
      {
        broker: account.broker || "Unknown",
        login: account.login || "",
        summary: summaryResult.success ? summaryResult.data : {},
        trades: tradesResult.success ? tradesResult.data : [],
      },
    ];
  } catch (err) {
    console.error("❌ Error fetching data from Python scripts:", err);
    return [];
  }
};

module.exports = {
  getAllMTAccountsTrades,
};