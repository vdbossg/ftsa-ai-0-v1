// server/services/mttabletrades.service.js

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const MTAccountModel = require("../models/MTAccountModel");


// Get current logged in user
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


// Run Python helper
const runPython = (scriptPath, args) => {
  return new Promise((resolve) => {
    const py = spawn("python", [scriptPath, ...args]);

    let stdout = "";
    let stderr = "";

    py.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    py.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    py.on("close", () => {
      if (stderr) {
        console.warn("⚠️ Python stderr:", stderr.trim());
      }

      try {
        const parsed = JSON.parse(stdout.trim());
        resolve(parsed);
      } catch (err) {
        console.warn("❌ Invalid JSON from Python:", stdout);
        resolve({ success: false });
      }
    });
  });
};


const getAllMTAccountsTrades = async () => {

  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error("No user logged in");
  }

  // Get this user's MT5 account from DB
  const account = await MTAccountModel.findOne({
    userId,
    platform: "MT5"
  });

  if (!account) {
    return [];
  }

  const summaryScript = path.join(__dirname, "../utils/mt5_get_summary.py");
  const tradesScript = path.join(__dirname, "../utils/mt5_get_trades.py");

  // Run summary
  const summaryResult = await runPython(summaryScript, [
    account.login,
    account.password,
    account.server
  ]);

  // Run trades
  const tradesResult = await runPython(tradesScript, [
    account.login,
    account.password,
    account.server
  ]);

  return [
    {
      broker: account.broker,
      login: account.login,
      summary: summaryResult.success
        ? summaryResult
        : { data: {} },
      trades: tradesResult.success
        ? tradesResult.data
        : []
    }
  ];
};


module.exports = {
  getAllMTAccountsTrades
};