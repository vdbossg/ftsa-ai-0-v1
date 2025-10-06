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
  const client = new Binance();

  const options = { useServerTime: true };
  if (apiKey && apiSecret) {
    options.APIKEY = apiKey;
    options.APISECRET = apiSecret;
  }

  client.options(options);
  return client;
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
  if (!account) throw new Error("No Binance keys saved for this user");
  if (!account.apiKeyEncrypted || !account.apiSecretEncrypted) {
    throw new Error("Incomplete Binance keys for this user");
  }
  return {
  apiKey: decrypt(account.apiKeyEncrypted),
  apiSecret: decrypt(account.apiSecretEncrypted),
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
async function fetchAccountWithUsd(apiKey, apiSecret) {
  try {
    const binance = createClient(apiKey, apiSecret);

    // --- Fetch spot balances ---
    const balancesRaw = await binance.balance(); // ✅ supported

    // --- Fetch market prices safely ---
    let prices = {};
    try {
      prices = await binance.prices();
    } catch (err) {
      console.warn("Could not fetch market prices, proceeding with empty prices");
    }

    // --- Calculate spot balances in USD ---
    const balances = Object.keys(balancesRaw)
      .map((asset) => {
        const free = parseFloat(balancesRaw[asset].available || "0");
        const locked = parseFloat(balancesRaw[asset].onOrder || "0");
        const amount = free + locked;
        if (amount <= 0) return null;

        let usdValue = 0;
        if (asset === "USDT") usdValue = amount;
        else if (prices[asset + "USDT"]) usdValue = amount * parseFloat(prices[asset + "USDT"]);
        else if (prices[asset + "BUSD"]) usdValue = amount * parseFloat(prices[asset + "BUSD"]);

        return { coin: asset, free, locked, amount, usdValue };
      })
      .filter(Boolean);

    const totalUsd = balances.reduce((s, x) => s + (x.usdValue || 0), 0);
    balances.forEach((b) => {
      b.portfolioPct = totalUsd ? ((b.usdValue / totalUsd) * 100).toFixed(2) : "0.00";
    });

    // --- Available balance in USD ---
    const availableBalanceUsd = balances.reduce((s, b) => s + (b.free * (b.usdValue / b.amount || 0)), 0);

    // --- Wallets breakdown ---
    const wallets = {
      spots: balances.reduce((s, b) => s + b.usdValue, 0),
      funding: 0,
      futures: 0,
    };

    // --- Fetch futures balances safely ---
    let futuresBalance = 0;
    try {
      const futures = await binance.futuresBalance();
      futuresBalance = Object.values(futures).reduce((sum, a) => sum + parseFloat(a.balance || 0), 0);
    } catch (err) {
      console.warn("Could not fetch futures balances:", err.message);
    }
    wallets.futures = futuresBalance;

    console.log("✅ Final Binance account data normalized:", {
      totalUsd,
      availableBalanceUsd,
      holdingsCount: balances.length,
    });

    return {
      email: "N/A",
      totalBalance: parseFloat((totalUsd + wallets.futures).toFixed(2)),
      availableBalance: parseFloat(availableBalanceUsd.toFixed(2)),
      dailyPnl: 0,
      weeklyPnl: 0,
      holdings: balances,
      wallets: wallets,
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
