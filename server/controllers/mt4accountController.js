// server/controllers/mt4accountController.js
const path = require("path");
const { spawn } = require("child_process");
const {
  getMT4Account: fetchMT4Account,
  connectMT4Account,
  deleteMT4Account,
} = require("../services/mt4accountService.js");

/**
 * Helper to run Python scripts (returns parsed JSON)
 */
async function runPython(scriptName, args = []) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, "..", "utils", scriptName);
    const py = spawn("python", [scriptPath, ...args]);

    let data = "";
    let errData = "";

    py.stdout.on("data", (chunk) => (data += chunk.toString()));
    py.stderr.on("data", (chunk) => (errData += chunk.toString()));

    py.on("close", () => {
      if (errData && errData.trim().length > 0) {
        console.warn(`⚠️ Python stderr (${scriptName}):`, errData.trim());
      }

      let parsed;
      try {
        parsed = JSON.parse(data.trim());
      } catch (err) {
        console.error(`❌ Failed to parse Python output (${scriptName}):`, data);
        return reject(new Error("Invalid JSON from Python"));
      }

      if (!parsed.success) {
        return reject(new Error(parsed.message || "Python script returned failure"));
      }

      resolve(parsed);
    });
  });
}

/**
 * GET /api/mt4accounts
 */
async function getMT4Account(req, res) {
  try {
    const account = await fetchMT4Account();
    if (!account) {
      return res.status(404).json({ success: false, message: "MT4 account not found" });
    }

    // ✅ Fetch live summary and trades from MT4
    const summary = await runPython("mt4_get_summary.py", [account.login, account.password, account.server]);
    let trades = [];
    try {
      trades = await runPython("mt4_get_trades.py", [account.login, account.password, account.server]);
    } catch (e) {
      console.warn("⚠️ Could not fetch MT4 trades:", e.message);
    }

    res.json({
      success: true,
      account,
      summary,
      trades,
    });
  } catch (err) {
    console.error("❌ Error in getMT4Account controller:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/mt4accounts/connect
 */
async function connectMT4(req, res) {
  try {
    const { broker, login, password, server, platform, accountType } = req.body;

    if (!login || !password || !server) {
      return res.status(400).json({
        success: false,
        message: "Login, password, and server are required.",
      });
    }

    console.log(`🌐 Connecting MT4 account ${login} on ${server}...`);

    // ✅ Step 1: Connect and save to DB
    const result = await connectMT4Account({
      broker,
      login,
      password,
      server,
      platform,
      accountType,
    });

    if (!result.success) return res.json(result);

    // ✅ Step 2: Fetch live MT4 summary
    const summary = await runPython("mt4_get_summary.py", [login, password, server]);
    let trades = [];
    try {
      trades = await runPython("mt4_get_trades.py", [login, password, server]);
    } catch (e) {
      console.warn("⚠️ Could not fetch MT4 trades:", e.message);
    }

    res.json({
      success: true,
      message: "MT4 account connected successfully",
      account: result.account,
      summary,
      trades,
    });
  } catch (err) {
    console.error("❌ Error in connectMT4 controller:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * DELETE /api/mt4accounts/:login
 */
async function deleteMT4(req, res) {
  try {
    const login = req.body?.login || req.params?.login;

    if (!login) {
      return res.status(400).json({ success: false, message: "Missing login for deletion" });
    }

    const result = await deleteMT4Account(login);
    res.json(result);
  } catch (err) {
    console.error("❌ Error in deleteMT4 controller:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getMT4Account, connectMT4, deleteMT4 };
