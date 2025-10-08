// server/controllers/mtaccountController.js
const path = require("path");
const { spawn } = require("child_process");
const {
  getMTAccount: fetchMTAccount,
  connectMTAccount,
  deleteMTAccount,
} = require("../services/mtaccountService.js");

/**
 * Helper to run Python scripts (returns parsed JSON)
 * - Doesn't fail for harmless stderr logs
 * - Only rejects if the JSON output indicates failure
 */
async function runPython(scriptName, args = []) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, "..", "utils", scriptName);
    const py = spawn("python", [scriptPath, ...args]);

    let data = "";
    let errData = "";

    py.stdout.on("data", (chunk) => (data += chunk.toString()));
    py.stderr.on("data", (chunk) => (errData += chunk.toString()));

    py.on("close", (code) => {
      // Log warnings (not critical)
      if (errData && errData.trim().length > 0) {
        console.warn(`⚠️ Python stderr (${scriptName}):`, errData.trim());
      }

      // Parse the JSON result safely
      let parsed;
      try {
        parsed = JSON.parse(data.trim());
      } catch (err) {
        console.error(`❌ Failed to parse Python output (${scriptName}):`, data);
        return reject(new Error("Invalid JSON from Python"));
      }

      // Treat JSON success as the real success flag
      if (!parsed.success) {
        return reject(new Error(parsed.message || "Python script returned failure"));
      }

      resolve(parsed);
    });
  });
}

/**
 * GET /api/mtaccounts
 */
async function getMTAccount(req, res) {
  try {
    const account = await fetchMTAccount();
    if (!account) {
      return res.status(404).json({ success: false, message: "MT account not found" });
    }

    // ✅ Fetch live summary and trades from MT5
    const summary = await runPython("mt5_get_summary.py", [account.login, account.password, account.server]);
    let trades = [];
    try {
      trades = await runPython("mt5_get_trades.py", [account.login, account.password, account.server]);
    } catch (e) {
      console.warn("⚠️ Could not fetch trades:", e.message);
    }

    res.json({
      success: true,
      account,
      summary,
      trades,
    });
  } catch (err) {
    console.error("❌ Error in getMTAccount controller:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/mtaccounts/connect
 */
async function connectMT(req, res) {
  try {
    const { broker, login, password, server, platform, accountType } = req.body;

    if (!login || !password || !server) {
      return res
        .status(400)
        .json({ success: false, message: "Login, password, and server are required." });
    }

    console.log(`🌐 Connecting MT5 account ${login} on ${server}...`);

    // ✅ Step 1: Connect and save to DB
    const result = await connectMTAccount({
      broker,
      login,
      password,
      server,
      platform,
      accountType,
    });

    if (!result.success) return res.json(result);

    // ✅ Step 2: Fetch live MT5 summary
    const summary = await runPython("mt5_get_summary.py", [login, password, server]);
    let trades = [];
    try {
      trades = await runPython("mt5_get_trades.py", [login, password, server]);
    } catch (e) {
      console.warn("⚠️ Could not fetch trades:", e.message);
    }

    // ✅ Combine all data for frontend
    res.json({
      success: true,
      message: "MT5 account connected successfully",
      account: result.account,
      summary,
      trades,
    });
  } catch (err) {
    console.error("❌ Error in connectMT controller:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * DELETE /api/mtaccounts/:login
 */
async function deleteMT(req, res) {
  try {
    // Try getting login from either body or URL param
    const login = req.body?.login || req.params?.login;

    if (!login) {
      return res.status(400).json({ success: false, message: "Missing login for deletion" });
    }

    const result = await deleteMTAccount(login);
    res.json(result);
  } catch (err) {
    console.error("❌ Error in deleteMT controller:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}


module.exports = { getMTAccount, connectMT, deleteMT };
