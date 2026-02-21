//FTSA_AI_0.v1\server\controllers\ftsacalculatorController.js
const fs = require('fs');
const path = require('path');
const Trade = require('../models/ftsacalculator');
const { calculateTrade } = require('../services/ftsacalculatorService');


function getCurrentUserId() {
    const filePath = path.join(__dirname, '../services/currentWatcherUser.json');
    if (!fs.existsSync(filePath)) return null;
    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return jsonData.userId || null;
}
// POST: calculate and save trade from frontend's Today's Trade
async function ftsaCalculator(req, res) {
    try {
        // Get the trade sent by frontend
        const tradeData = req.body.pendingTrade;

        if (!tradeData) {
            return res.status(400).json({ success: false, message: "No pending trade provided" });
        }

        // Map frontend trade to calculation format
        const tradeForCalc = {
            tradeId: tradeData.symbol + "_" + Date.now(),
            symbol: tradeData.symbol,
            type: tradeData.type,
            mode: tradeData.mode || "PENDING",
            entry: tradeData.entry,
            sl: tradeData.sl,
            tp: tradeData.tp,
            initialBalance: tradeData.initialBalance ?? 1000, // default if frontend does not provide
            risk: tradeData.risk ?? 1,                        // default if frontend does not provide
            tpTargets: tradeData.tpTargets ?? "tp1",          // default if frontend does not provide
            dailyMaxLoss: tradeData.dailyMaxLoss ?? 1
        };

        // Call existing calculateTrade service
        const result = await calculateTrade(tradeForCalc);

        res.json({
            success: true,
            data: result
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}

// POST: update trade status from EA
async function updateTradeStatus(req, res) {
    try {
        const eaTrade = req.body;
console.log("📥 EA UPDATE RECEIVED:", eaTrade);


        if (!eaTrade || !eaTrade.symbol || !eaTrade.tradeActivated) {
            return res.status(400).json({ success: false, message: "Invalid trade update" });
        }

        // Save or update in DB
       // Get current user
const userId = getCurrentUserId();
if (!userId) return res.status(400).json({ success: false, message: "No logged-in user found" });

// Save or update in DB only for this user
const filter = { symbol: eaTrade.symbol, type: eaTrade.type.toUpperCase(), userId };
const update = {
    ...eaTrade,
    updatedAt: new Date(),
    userId
};
const options = { upsert: true, new: true, setDefaultsOnInsert: true };

const updatedTrade = await Trade.findOneAndUpdate(filter, update, options);

        res.json({ success: true, data: updatedTrade });
    } catch (err) {
        console.error("Error updating trade from EA:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

// GET: fetch latest trade
async function getLatestTrade(req, res) {
    try {
        const userId = getCurrentUserId();
if (!userId) return res.status(400).json({ success: false, message: "No logged-in user found" });

const latestTrade = await Trade.findOne({ userId }).sort({ _id: -1 });

        if (!latestTrade) {
            return res.status(404).json({ success: false, message: 'No trade found' });
        }

        // Rebuild JSON structures
        const signalJson = {
            symbol: latestTrade.symbol,
            type: latestTrade.type,
            mode: 'PENDING',
            Price: latestTrade.entry,
            lots: latestTrade.lots,
            sl: latestTrade.sl,
            tp: latestTrade.tp
        };

        const trendJson = {
            time: new Date().toISOString(),
            pair: latestTrade.symbol,
            trend: latestTrade.type.toUpperCase() === 'BUY' ? 'bullish' : 'bearish',
            type: latestTrade.type.toLowerCase(),
            mode: 'PENDING',
            entry: latestTrade.entry,
            sl: latestTrade.sl,
            tp: latestTrade.tp,
            tradeActivated: latestTrade.tradeActivated
        };

        res.json({ signalJson, trendJson });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}


module.exports = { ftsaCalculator, getLatestTrade, updateTradeStatus };
