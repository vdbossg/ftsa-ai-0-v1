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

  // Get latest token for a specific userId
  static async getLatestToken(userId) {
    return await ProxyToken.findOne({ userId });
  }
}

module.exports = ProxyTokenService;
