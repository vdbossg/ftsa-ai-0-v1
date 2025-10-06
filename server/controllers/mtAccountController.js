const {
  getMTAccount: fetchMTAccount,
  connectMTAccount,
  deleteMTAccount,
} = require("../services/mtaccountService.js");

/**
 * GET /api/mtaccount
 */
async function getMTAccount(req, res) {
  try {
    const account = await fetchMTAccount();
    res.json({ account });
  } catch (err) {
    console.error("Error in getMTAccount controller:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/mtaccount/connect
 */
async function connectMT(req, res) {
  try {
    const { broker, login, password, server, platform, accountType } = req.body;
    if (!login || !password || !server) {
      return res.status(400).json({ success: false, message: "Login, password, and server are required." });
    }

    const result = await connectMTAccount({ broker, login, password, server, platform, accountType });

    // Flatten currency for frontend
    res.json({
      success: result.success,
      message: result.message,
      currency: result.account?.currency || null,
    });
  } catch (err) {
    console.error("Error in connectMT controller:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * DELETE /api/mtaccount/delete
 */
async function deleteMT(req, res) {
  try {
    const result = await deleteMTAccount();
    res.json(result);
  } catch (err) {
    console.error("Error in deleteMT controller:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getMTAccount, connectMT, deleteMT };
