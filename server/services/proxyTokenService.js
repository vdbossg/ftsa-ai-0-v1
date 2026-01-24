// server/services/proxyTokenService.js
const mongoose = require("mongoose");
const ProxyToken = require("../models/proxyTokenModel");

class ProxyTokenService {
  /**
   * Save or update the latest token for a specific user
   * @param {Object} user - Mongoose User document
   * @param {String} token - JWT token string
   * @returns {Promise<Object>} saved token document
   */
  static async saveOrUpdateToken(user, token) {
    const { _id, email, firstName } = user;
    const userId = mongoose.Types.ObjectId(_id);
    const now = new Date();

    try {
      const updated = await ProxyToken.findOneAndUpdate(
        { userId },
        { token, email, firstName, updatedAt: now },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true, // ensures defaults are set on insert
        }
      );

      console.log(`✅ ProxyToken saved/updated for user ${email}`);
      return updated;
    } catch (err) {
      console.error(`❌ Failed to save ProxyToken for ${email}:`, err);
      throw err; // ensures the login process sees the failure
    }
  }

  /**
   * Get latest token
   * @param {String} [userId] - Optional userId to fetch token for a specific user
   * @returns {Promise<Object|null>} token document or null
   */
  static async getLatestToken(userId = null) {
    try {
      if (userId) {
        return await ProxyToken.findOne({ userId });
      } else {
        // If no userId, return the most recently updated token (latest login)
        return await ProxyToken.findOne().sort({ updatedAt: -1 });
      }
    } catch (err) {
      console.error("❌ Failed to fetch latest token:", err);
      throw err;
    }
  }
}

module.exports = ProxyTokenService;
