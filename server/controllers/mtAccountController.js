// server/controllers/mtAccountController.js
const MTConnector = require('../services/mtConnector');
const MTAccount = require('../models/MTAccount'); // your DB schema

const mtAccountController = {
  /**
   * Login / connect to MT account
   */
  async login(req, res) {
    const { accountId, password, server } = req.body;

    if (!accountId || !password || !server) {
      return res.status(400).json({ success: false, error: 'Missing accountId, password, or server' });
    }

    try {
      // Call service to connect
      const result = await MTConnector.connect(accountId, password, server);

      if (!result.success) {
        return res.status(500).json({ success: false, error: result.error });
      }

      // Optionally, save account to DB if new
      // await MTAccount.findOneAndUpdate(
      //   { accountId },
      //   { accountId, password, server },
      //   { upsert: true, new: true }
      // );

      return res.json(result);
    } catch (error) {
      return res.status(500).json({ success: false, error: 'MT login failed' });
    }
  },

  /**
   * Fetch all MT accounts from DB
   */
  async getAccounts(req, res) {
    try {
      const accounts = await MTAccount.find({});
      return res.json(accounts);
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Failed to fetch MT accounts' });
    }
  },

  /**
   * Delete an MT account by accountId
   */
  async deleteAccount(req, res) {
    const { accountId } = req.params;

    if (!accountId) {
      return res.status(400).json({ success: false, error: 'Missing accountId' });
    }

    try {
      await MTAccount.findOneAndDelete({ accountId: accountId });
      return res.json({ success: true, message: 'Account deleted' });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Failed to delete MT account' });
    }
  },
  /**
 * Save or update an MT account
 */
async saveAccount(req, res) {
  const { accountId, password, server } = req.body;
  if (!accountId || !password || !server) {
    return res.status(400).json({ success: false, error: 'Missing accountId, password, or server' });
  }

  try {
    const account = await MTAccount.findOneAndUpdate(
      { accountId },
      { accountId, password, server },
      { upsert: true, new: true }
    );
    return res.json({ success: true, account });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to save account' });
  }
}

};

module.exports = mtAccountController;
