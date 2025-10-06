// /controllers/mtaccountController.js
const {
  getMTAccount: fetchMTAccount,
  connectMTAccount,
  deleteMTAccount,
} = require("../services/mtaccountService.js");

/**
 * GET /api/mtaccounts
 */
async function getMTAccount(req, res) {
  try {
    const account = await fetchMTAccount();
    res.json({ data: account }); // frontend expects `data`
  } catch (err) {
    console.error("Error in getMTAccount controller:", err);
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
      return res.status(400).json({ success: false, message: "Login, password, and server are required." });
    }

    const result = await connectMTAccount({ broker, login, password, server, platform, accountType });

    res.json({
      success: result.success,
      message: result.message,
      account: result.account || null, // include full account object
      currency: result.account?.currency || null,
    });
  } catch (err) {
    console.error("Error in connectMT controller:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * DELETE /api/mtaccounts
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
