// server/utils/metaTraderAPI.js
/**
 * MetaTrader API Utility
 * Uses FTSA backend API instead of Python scripts
 */

const axios = require("axios");
const path = require("path");
const fs = require("fs");

const MT_API_URL =
  "https://ftsa-ai-backend.onrender.com/api/ftsaaicli/mt5trades";

// Helper to get current logged-in userId from currentWatcherUser.json
const getCurrentUserId = () => {
  const watcherPath = path.join(__dirname, "currentWatcherUser.json");

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
 * Connect to MT account
 * (Now checks if MT data exists via API)
 */
async function connect({ login, password, server }) {
  try {
    const userId = getCurrentUserId();

    if (!userId) {
      return { success: false, message: "No active watcher user" };
    }

    console.log(`🌐 Checking MT account via API for user ${userId}`);

    const res = await axios.get(MT_API_URL, {
      params: { userId }
    });

    if (!res.data.success) {
      return {
        success: false,
        message: res.data.message || "Failed to connect MT account"
      };
    }

    const mt = res.data.data;

    return {
      success: true,
      currency: "USD", // API does not provide yet
      login: mt.login,
      balance: mt.summary?.balance || 0,
      equity: mt.summary?.equity || 0,
      margin: mt.summary?.margin || 0,
      freeMargin: mt.summary?.freeMargin || 0,
      marginLevel: 0
    };

  } catch (err) {
    console.error("Error in MetaTraderAPI.connect:", err.message);
    return { success: false, message: "Failed to connect to MT account" };
  }
}

/**
 * Fetch live account info
 */
async function fetchAccountInfo({ login, password, server }) {
  try {
    const userId = getCurrentUserId();

    if (!userId) {
      return { success: false, message: "No active watcher user" };
    }

    const res = await axios.get(MT_API_URL, {
      params: { userId }
    });

    if (!res.data.success) {
      return {
        success: false,
        message: res.data.message || "Failed to fetch account info"
      };
    }

    const mt = res.data.data;

    const data = {
      balance: mt.summary?.balance || 0,
      equity: mt.summary?.equity || 0,
      margin: mt.summary?.margin || 0,
      freeMargin: mt.summary?.freeMargin || 0,
      marginLevel: 0,
      currency: "USD",

      trades: Array.isArray(mt.trades) && mt.trades.length > 0
        ? mt.trades.map((t) => ({
            symbol: t.symbol,
            ticket: t.ticket,
            type: t.type,
            volume: t.volume,
            entryPrice: t.open_price,
            sl: t.sl,
            tp: t.tp,
            price: t.current_price,
            profit: t.profit,
            time: t.time
          }))
        : []
    };

    return { success: true, data };

  } catch (err) {
    console.error("Error in MetaTraderAPI.fetchAccountInfo:", err.message);
    return { success: false, message: "Failed to fetch account info" };
  }
}

module.exports = { connect, fetchAccountInfo };