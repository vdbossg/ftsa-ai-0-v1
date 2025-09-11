// server/routes/equityRoutes.js
const express = require("express");
const router = express.Router();
const EquitySnapshot = require("../models/EquitySnapshot");
const fs = require("fs");
const path = require("path");

// ---- Helper: load live config from brain ----
function loadAppConfig() {
  try {
    const configPath = path.join(__dirname, "../../config/appConfig.json");
    if (fs.existsSync(configPath)) {
      const raw = fs.readFileSync(configPath, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("❌ Failed to load appConfig.json:", err);
  }
  return null;
}

// ---- GET: latest snapshot ----
router.get("/", async (req, res) => {
  try {
    const latest = await EquitySnapshot.findOne().sort({ createdAt: -1 }).lean();
    res.json({ latest });
  } catch (err) {
    console.error("❌ Failed to fetch equity snapshot:", err);
    res.status(500).json({ error: "Failed to fetch equity snapshot" });
  }
});

// ---- POST: EA sends balance/equity ----
router.post("/", async (req, res) => {
  try {
    const { account, balance, equity, margin } = req.body;

    if (typeof balance !== "number" || typeof equity !== "number") {
      return res.status(400).json({ error: "Balance and equity must be numbers" });
    }

    // Load live config from brain
    const config = loadAppConfig();
    if (!config) {
      return res.status(500).json({ error: "No appConfig.json available" });
    }

    const targetEquity = parseFloat(config.targetEquity);
    const stopEquity = parseFloat(config.stopEquity);
    const tpPercent = parseFloat(config.tpPercent);
    const riskPercent = parseFloat(config.riskPercent);

    // Determine today's snapshot and initial balance
    const today = new Date().toISOString().slice(0, 10);
    let firstSnapshot = await EquitySnapshot.findOne({ day: today }).sort({ createdAt: 1 });
    let balanceStart = firstSnapshot ? firstSnapshot.balanceStart : balance;

    // Save the snapshot
    const snapshot = new EquitySnapshot({
  account: account || "default",
  day: today,
  balanceStart,
  balance: balance,
  equity: equity,
  targetEquity,
  stopEquity,
  tpPercent,
  riskPercent,
  createdAt: new Date(),
});

    await snapshot.save();

    // --- Decision logic ---
    const hitTarget = equity >= targetEquity;
    const hitStop = equity <= stopEquity;

    console.log(
      `📊 Equity snapshot: Account=${account || "default"} | Balance=${balance} | Equity=${equity} | TP=${hitTarget ? "✅ HIT" : "❌ not yet"} | SL=${hitStop ? "🛑 HIT" : "ok"}`
    );

    // Response for EA
    res.json({
      ok: true,
      hitTarget,
      hitStop,
      targetEquity,
      stopEquity,
      tpPercent,
      riskPercent,
      snapshot,
    });
  } catch (err) {
    console.error("❌ Failed to save equity snapshot:", err);
    res.status(500).json({ error: "Failed to save equity snapshot" });
  }
});

module.exports = router;
