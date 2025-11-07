// server/controllers/propAccountController.js
const path = require("path");
const { spawn } = require("child_process");
const {
  getPropAccount: fetchPropAccount,
  connectPropAccount: connectPropAccountService,
  deletePropAccount: deletePropAccountService,
} = require("../services/propAccountService.js");

/**
 * Optional helper if you want Python summaries for PropFirm accounts
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
      if (errData && errData.trim()) console.warn(`⚠️ Python stderr (${scriptName}):`, errData.trim());

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
 * GET /api/propaccounts
 */
async function getPropAccount(req, res) {
  try {
    const accounts = await fetchPropAccount(); // fetch all Prop accounts

    if (!accounts || accounts.length === 0) {
      return res.json({ success: true, data: [] }); // return empty array for frontend

    }

    // Optional: fetch summaries if needed
    const results = [];
    for (const acc of accounts) {
      let summary = {};
      try {
        if (acc.login && acc.password && acc.server) {
          summary = await runPython("mt5_get_summary.py", [acc.login, acc.password, acc.server]);
        }
      } catch (e) {
        console.warn(`⚠️ Could not fetch summary for ${acc.login}:`, e.message);
      }

      results.push({
        account: acc,
        summary,
      });
    }

    res.json({ success: true, accounts: results });

  } catch (err) {
    console.error("❌ Error in getPropAccount controller:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/propaccounts/connect
 */
async function connectPropAccount(req, res) {
  try {
    const { broker, login, password, server, platform, accountType } = req.body;

    if (!login || !password || !server) {
      return res.status(400).json({ success: false, message: "Login, password, and server are required." });
    }

    // Connect and save to DB
    const result = await connectPropAccountService({
      broker,
      login,
      password,
      server,
      platform,
      accountType,
    });

    if (!result.success) return res.json(result);

    // Optional: fetch summary from Python
    let summary = {};
    try {
      summary = await runPython("mt5_get_summary.py", [login, password, server]);
    } catch (e) {
      console.warn("⚠️ Could not fetch summary:", e.message);
    }

    res.json({
      success: true,
      message: "Prop account connected successfully",
      account: result.account,
      summary,
    });
  } catch (err) {
    console.error("❌ Error in connectPropAccount controller:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * DELETE /api/propaccounts/:login
 */
async function deletePropAccount(req, res) {
  try {
    const login = req.body?.login || req.params?.login;
    if (!login) return res.status(400).json({ success: false, message: "Missing login for deletion" });

    const result = await deletePropAccountService(login);
    res.json(result);
  } catch (err) {
    console.error("❌ Error in deletePropAccount controller:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getPropAccount, connectPropAccount, deletePropAccount };
