const ProxyToken = require("../models/proxyTokenModel");

class ProxyTokenService {
  // Save or update the latest token for a user
  static async saveOrUpdateToken(user, token) {
    const { _id: userId, email, firstName } = user;
    const now = new Date();

    const updated = await ProxyToken.findOneAndUpdate(
      { userId },
      { token, email, firstName, updatedAt: now },
      { upsert: true, new: true }
    );

    console.log(`✅ ProxyToken saved/updated for user ${email}`);
    return updated;
  }

  /**
   * Get latest token
   * - If userId is provided, fetch that user's token
   * - If no userId, fetch the most recently saved token in the database (latest login)
   */
  static async getLatestToken(userId = null) {
    if (userId) {
      return await ProxyToken.findOne({ userId });
    } else {
      // Return the most recently updated token
      return await ProxyToken.findOne().sort({ updatedAt: -1 });
    }
  }
}

module.exports = ProxyTokenService;
