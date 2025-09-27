// server/services/binanceService.js
const Binance = require("node-binance-api");
const crypto = require("crypto");
const dotenv = require("dotenv");
const BinanceAccount = require("../models/BinanceAccount.js");

dotenv.config();

// --- Encryption setup ---
const ALGO = "aes-256-gcm";
const KEY = Buffer.from(process.env.BINANCE_ENCRYPTION_KEY, "base64");
if (KEY.length !== 32) throw new Error("BINANCE_ENCRYPTION_KEY must be base64 of 32 bytes");

// --- Encrypt / Decrypt ---
function encrypt(text) {
  const iv = crypto.randomBytes(12); // 96-bit recommended for GCM
  const cipher = crypto.createCipheriv(ALGO, KEY, iv, { authTagLength: 16 });
  const encrypted = Buffer.concat([cipher.update(String(text), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

function decrypt(base64) {
  const data = Buffer.from(base64, "base64");
  const iv = data.slice(0, 12);
  const tag = data.slice(12, 28);
  const encrypted = data.slice(28);
  const decipher = crypto.createDecipheriv(ALGO, KEY, iv, { authTagLength: 16 });
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

// --- Create Binance client ---
const createClient = (apiKey, apiSecret) => {
  if (apiKey && apiSecret) return new Binance().options({ APIKEY: apiKey, APISECRET: apiSecret });
  return new Binance(); // public client
};

// --- Save user Binance keys to MongoDB ---
async function saveUserKeys(userId, apiKey, apiSecret) {
  const apiKeyEncrypted = encrypt(apiKey);
  const apiSecretEncrypted = encrypt(apiSecret);

  const existing = await BinanceAccount.findOne({ userId });
  if (existing) {
    existing.apiKeyEncrypted = apiKeyEncrypted;
    existing.apiSecretEncrypted = apiSecretEncrypted;
    await existing.save();
    return existing;
  }

  const account = new BinanceAccount({ userId, apiKeyEncrypted, apiSecretEncrypted });
  await account.save();
  return account;
}

// --- Get user Binance keys from MongoDB ---
async function getUserKeys(userId) {
  const account = await BinanceAccount.findOne({ userId });
  if (!account) return null;
  return {
    apiKey: account.apiKeyEncrypted,
    apiSecret: account.apiSecretEncrypted,
  };
}

// --- Fetch public prices ---
async function fetchPublicPrices() {
  const binance = createClient();
  const prices = await binance.prices();
  const holdings = Object.keys(prices)
    .filter((s) => s.endsWith("USDT"))
    .map((s) => ({ symbol: s, coin: s.replace("USDT", ""), usdPrice: parseFloat(prices[s]) }));
  return { prices, holdings };
}

// --- Fetch account balances in USD ---
async function fetchAccountWithUsd(apiKeyEncrypted, apiSecretEncrypted) {
  try {
    const binance = createClient(decrypt(apiKeyEncrypted), decrypt(apiSecretEncrypted));
    const accountInfo = await binance.accountInfo();
    const prices = await binance.prices();

    const balances = (accountInfo.balances || [])
      .map((b) => {
        const free = parseFloat(b.free || "0");
        const locked = parseFloat(b.locked || "0");
        const amount = free + locked;
        if (amount <= 0) return null;

        let usdValue = 0;
        if (b.asset === "USDT") usdValue = amount;
        else if (prices[b.asset + "USDT"]) usdValue = amount * parseFloat(prices[b.asset + "USDT"]);
        else if (prices[b.asset + "BUSD"]) usdValue = amount * parseFloat(prices[b.asset + "BUSD"]);

        return { coin: b.asset, free, locked, amount, usdValue };
      })
      .filter(Boolean);

    const totalUsd = balances.reduce((s, x) => s + (x.usdValue || 0), 0);
    balances.forEach((b) => {
      b.portfolioPct = totalUsd ? ((b.usdValue / totalUsd) * 100).toFixed(2) : "0.00";
    });

    // Simple wallet breakdown example (can be enhanced)
    const wallets = {
      spots: balances.reduce((s, b) => s + b.usdValue, 0),
      funding: 0,
      futures: 0,
    };

    return {
      email: accountInfo.email || "N/A",
      totalBalance: totalUsd,
      availableBalance: accountInfo.balances.reduce((s, b) => s + parseFloat(b.free || 0), 0),
      dailyPnl: 0, // TODO: fetch from Binance futures if needed
      weeklyPnl: 0,
      holdings: balances,
      wallets,
    };
  } catch (err) {
    console.error("Error fetching account:", err);
    throw new Error("Failed to fetch Binance account");
  }
}

// --- Main fetch function ---
async function fetchData(userId) {
  if (!userId) throw new Error("UserId is required");

  const keys = await getUserKeys(userId);
  if (!keys) throw new Error("No Binance keys saved for this user");

  const publicPrices = await fetchPublicPrices();
  const account = await fetchAccountWithUsd(keys.apiKey, keys.apiSecret);
  return { public: publicPrices, account };
}

// --- Refresh (alias) ---
async function refresh(userId) {
  return fetchData(userId);
}

module.exports = {
  encrypt,
  decrypt,
  saveUserKeys,
  getUserKeys,
  fetchPublicPrices,
  fetchAccountWithUsd,
  fetchData,
  refresh,
};
