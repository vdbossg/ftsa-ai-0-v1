const { runMT5Exe } = require("../utils/bypassMTTableTradesUtils");
const MTAccountModel = require("../models/MTAccountModel");
const PropAccountModel = require("../models/PropAccount");
const fs = require("fs");
const path = require("path");

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

// Fetch MT accounts for the logged-in user
const getUserMTAccounts = async () => {
  const userId = getCurrentUserId();
  if (!userId) return [];
  return await MTAccountModel.find({ userId }).lean();
};

// Fetch Prop accounts for the logged-in user
const getUserPropAccounts = async () => {
  const userId = getCurrentUserId();
  if (!userId) return [];
  return await PropAccountModel.find({ userId }).lean();
};

// Fetch live MT5 account info (summary + trades)
const fetchMTTableTrades = async () => {
  const accounts = await getUserMTAccounts();

  const results = await Promise.all(
    accounts.map(async (acc) => {
      try {
        const summary = await runMT5Exe("mt5_get_summary.exe", [acc.login, acc.password, acc.server]);
        const trades = await runMT5Exe("mt5_get_trades.exe", [acc.login, acc.password, acc.server]);

        return {
          broker: acc.broker || "",
          login: acc.login,
          summary: { data: summary },
          trades: Array.isArray(trades) ? trades : [],
        };
      } catch (err) {
        console.error("❌ Failed to fetch MT account:", acc.login, err);
        return {
          broker: acc.broker || "",
          login: acc.login,
          summary: { data: {} },
          trades: [],
        };
      }
    })
  );

  return results;
};

// Fetch live PropFirm account info (summary + trades)
const fetchPropTableTrades = async () => {
  const accounts = await getUserPropAccounts();

  const results = await Promise.all(
    accounts.map(async (acc) => {
      try {
        const summary = await runMT5Exe("prop_mt5_get_summary.exe", [acc.login, acc.password, acc.server]);
        const trades = await runMT5Exe("prop_mt5_get_trades.exe", [acc.login, acc.password, acc.server]);

        return {
          broker: acc.broker || "",
          login: acc.login,
          summary: { data: summary },
          trades: Array.isArray(trades) ? trades : [],
        };
      } catch (err) {
        console.error("❌ Failed to fetch PropFirm account:", acc.login, err);
        return {
          broker: acc.broker || "",
          login: acc.login,
          summary: { data: {} },
          trades: [],
        };
      }
    })
  );

  return results;
};

module.exports = { fetchMTTableTrades, fetchPropTableTrades };