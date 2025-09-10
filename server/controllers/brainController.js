// server/controllers/brainController.js
const brainService = require("../services/brainService");
const commandService = require("../services/commandService");
const newsService = require("../services/newsService");
const chochService = require("../services/chochService");

// In-memory storage for TradingView signals
let tvSignals = [];

// 📊 Get currency strength ranking
exports.getStrength = async (req, res) => {
  try {
    const data = await brainService.getRankedPairs();
    res.json({ success: true, data });
  } catch (err) {
    console.error("❌ Error fetching strength:", err);
    res.status(500).json({ success: false, error: "Failed to fetch strength data" });
  }
};

// 📡 Receive TradingView webhook signal
exports.receiveTradingViewSignal = async (req, res) => {
  const { symbol, percent, timeframe, direction } = req.body;
  console.log("📡 Received TradingView signal:", req.body);

  // 1️⃣ Store signal in memory
  tvSignals.push({
    symbol,
    percent,
    timeframe,
    direction,
    receivedAt: new Date().toISOString()
  });

  // 2️⃣ Update pair strength if valid
  if (symbol && typeof percent === "number") {
    await brainService.updatePairStrength(symbol, percent);
  }

  // 3️⃣ Update LTF CHoCH if timeframe is low (example: 15m)
  if (timeframe && timeframe.includes("15")) {
    const isValid = ["bull", "bear"].includes(direction);
    await chochService.storeLTF(symbol, direction, isValid);

    if (!isValid) {
      console.warn(`⚠️ Ignoring invalid CHoCH direction for ${symbol}: ${direction}`);
    }
  }

  res.json({ ok: true, message: "Signal processed" });
};

// 🛠️ Get next command for an MT account
exports.getCommand = async (req, res) => {
  try {
    const account = req.query.account;
    const cmd = await commandService.getCommandForAccount(account);
    res.json(cmd);
  } catch (err) {
    console.error("❌ Error fetching command:", err);
    res.status(500).json({ error: "Failed to fetch command" });
  }
};

// 💰 Receive equity report from EA
exports.postEquityReport = async (req, res) => {
  try {
    const { account, balance, equity, dailyTarget } = req.body;
    console.log(`💰 Equity report for ${account}: balance=${balance}, equity=${equity}`);

    // Auto-close logic based on profit target
    if (dailyTarget && equity >= balance + dailyTarget) {
      console.log(`✅ Target reached for ${account}, command EA to close all positions`);
      await commandService.setCloseAll(account);
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("❌ Error processing equity report:", err);
    res.status(500).json({ error: "Failed to process equity report" });
  }
};

// 📰 Get latest news
exports.getLatestNews = async (req, res) => {
  try {
    const news = await newsService.fetchLatest();
    res.json(news);
  } catch (err) {
    console.error("❌ Error fetching news:", err);
    res.status(500).json({ error: "Failed to fetch news" });
  }
};

// 🔀 Get CHoCH direction for all symbols
exports.getChochDirection = async (req, res) => {
  try {
    const symbols = await brainService.getAllSymbols();
    const chochData = {};

    for (let symbol of symbols) {
      chochData[symbol] = await chochService.getLTF(symbol);
    }

    res.json(chochData);
  } catch (err) {
    console.error("❌ Error fetching CHoCH direction:", err);
    res.status(500).json({ error: "Failed to fetch CHoCH data" });
  }
};

// 📈 Get current strongest pair (≥ threshold)
exports.getStrongestPair = async (req, res) => {
  try {
    const pair = await brainService.getStrongestPair();
    res.json({ success: true, data: pair });
  } catch (err) {
    console.error("❌ Error fetching strongest pair:", err);
    res.status(500).json({ success: false, error: "Failed to fetch strongest pair" });
  }
};

// 📰 + 🔀 Dashboard summary
exports.getDashboardData = async (req, res) => {
  try {
    const news = await newsService.fetchLatest();
    const symbols = await brainService.getAllSymbols();
    const chochData = {};

    for (let symbol of symbols) {
      chochData[symbol] = await chochService.getLTF(symbol);
    }

    res.json({ news, chochData });
  } catch (err) {
    console.error("❌ Error fetching dashboard data:", err);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
};
