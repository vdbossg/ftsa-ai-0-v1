// server/controllers/mtaccountController.js
const fs = require("fs"); // <-- Add this
const path = require("path");
const { spawn } = require("child_process");
const {
  getMTAccount: fetchMTAccount,
  connectMTAccount,
  deleteMTAccount,
} = require("../services/mtaccountService.js");
// Helper to get current logged-in userId from currentWatcherUser.json
const getCurrentUserId = () => {
  const watcherPath = path.join(__dirname, "../services/currentWatcherUser.json");
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
    const userId = getCurrentUserId();
if (!userId) {
  return res.status(400).json({ success: false, message: "No user is currently logged in" });
}

// fetch only accounts belonging to this user
const accounts = await fetchMTAccount(); 
// MTAccountService already filters by userId
    if (!accounts || accounts.length === 0) {
      return res.status(404).json({ success: false, message: "MT accounts not found" });
    }

    const results = [];

    for (const acc of accounts) {
      let summary = {};
      let trades = [];


      
      if (acc.login && acc.password && acc.server) {
        try {
          summary = await runPython("mt5_get_summary.py", [acc.login, acc.password, acc.server]);
        } catch (e) {
          console.warn(`⚠️ Could not fetch summary for ${acc.login}:`, e.message);
        }

        try {
          trades = await runPython("mt5_get_trades.py", [acc.login, acc.password, acc.server]);
        } catch (e) {
          console.warn(`⚠️ Could not fetch trades for ${acc.login}:`, e.message);
        }
      } else {
        console.warn(`⚠️ MT account ${acc.login || "unknown"} has missing login/password/server, skipping Python calls`);
      }

      results.push({
  account: {
    ...acc.toObject(),  // <-- converts Mongoose doc to plain JS object
    isConnected: true
  },
  summary,
  trades
});


    }

    res.json({ success: true, accounts: results });
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
        const userId = getCurrentUserId();
    if (!userId) {
      return res.status(400).json({ success: false, message: "No user is currently logged in" });
    }

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
        const userId = getCurrentUserId();
    if (!userId) {
      return res.status(400).json({ success: false, message: "No user is currently logged in" });
    }

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
