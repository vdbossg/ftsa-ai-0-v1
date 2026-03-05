// FTSA_AI_0.v1\server\services\mttabletrades.service.js
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const MTAccountModel = require("../models/mtAccount"); // Your Mongoose model

// Helper: get current logged-in userId from currentWatcherUser.json
const getCurrentUserId = () => {
  const watcherPath = path.join(__dirname, "currentWatcherUser.json"); // adjust if needed
  try {
    const data = fs.readFileSync(watcherPath, "utf8");
    const json = JSON.parse(data);
    return json.userId || null;
  } catch (err) {
    console.error("❌ Failed to read currentWatcherUser.json:", err);
    return null;
  }
};

// Fetch MT5 trades for a specific userId
const fetchMT5TradesByUser = async (userId) => {
  if (!userId) return null;
  try {
    const res = await axios.get(
      `https://ftsa-ai-backend.onrender.com/api/ftsaaicli/mt5trades?userId=${userId}`
    );
    return res.data?.data || null;
  } catch (err) {
    console.error(`❌ Failed to fetch MT5 trades for user ${userId}:`, err.message || err);
    return null;
  }
};

// Normalize MT account data to frontend format
const normalizeMTAccount = (raw) => {
  if (!raw) return null;
  return {
    broker: raw.broker || "",
    login: raw.login || 0,
    summary: {
      data: {
        balance: raw.summary?.balance || 0,
        equity: raw.summary?.equity || 0,
        margin: raw.summary?.margin || 0,
        freeMargin: raw.summary?.freeMargin || 0,
      },
    },
    trades: Array.isArray(raw.trades)
      ? raw.trades.map((trade) => ({
          symbol: trade.symbol || "",
          ticket: trade.ticket || 0,
          time: trade.time ? new Date(trade.time) : new Date(),
          type: trade.type || "",
          volume: trade.volume || 0,
          open_price: trade.open_price || 0,
          current_price: trade.current_price || 0,
          sl: trade.sl || 0,
          tp: trade.tp || 0,
          profit: trade.profit || 0,
        }))
      : [],
  };
};

// Fetch the current logged-in user's MT5 account (optionally save to MongoDB)
const getCurrentUserMT5Account = async (saveToDB = false) => {
  const userId = getCurrentUserId();
  if (!userId) {
    console.error("❌ No current watcher user found.");
    return null;
  }

  const rawAccount = await fetchMT5TradesByUser(userId);
  const account = normalizeMTAccount(rawAccount);

  if (saveToDB && account) {
    try {
      await MTAccountModel.findOneAndUpdate({ login: account.login }, account, {
        upsert: true,
        new: true,
      });
      console.log(`✅ MT5 account for user ${userId} saved/updated in DB.`);
    } catch (err) {
      console.error("❌ Failed to save MT5 account to DB:", err.message || err);
    }
  }

  return account;
};

module.exports = {
  getCurrentUserId,
  fetchMT5TradesByUser,
  getCurrentUserMT5Account,
};