//server\services\proxyTokenService.js
const ProxyToken = require("../models/proxyTokenModel");

class ProxyTokenService {
  // Save or update the latest token for a user
  static async saveOrUpdateToken(user, token) {
  const mongoose = require("mongoose");        // ensure ObjectId
  const { _id, email, firstName } = user;
  const userId = mongoose.Types.ObjectId(_id); // convert to ObjectId
  const now = new Date();

  try {
    const updated = await ProxyToken.findOneAndUpdate(
      { userId },
      { token, email, firstName, updatedAt: now },
      { upsert: true, new: true, setDefaultsOnInsert: true } // add safety
    );

    console.log(`✅ ProxyToken saved/updated for user ${email}`);
    return updated;
  } catch (err) {
    console.error(`❌ Failed to save ProxyToken for ${email}:`, err);
    throw err; // ensure caller sees the error
  }
}


  /**
   * Get latest token
   * - If userId is provided, fetch that user's token
   * - If no userId, fetch the most recently saved token in the database (latest login)
   */
  static async getLatestToken(userId = null) {
  try {
    if (userId) {
      return await ProxyToken.findOne({ userId });
    } else {
      return await ProxyToken.findOne().sort({ updatedAt: -1 });
    }
  } catch (err) {
    console.error("❌ Failed to fetch latest token:", err);
    throw err;
  }
}

}

module.exports = ProxyTokenService;
