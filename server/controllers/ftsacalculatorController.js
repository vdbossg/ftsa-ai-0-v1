const Trade = require('../models/ftsacalculator');
const { calculateTrade } = require('../services/ftsacalculatorService');
const currentWatcherUser = require('../services/currentWatcherUser.json'); 

// POST: calculate and save trade from frontend's Today's Trade
async function ftsaCalculator(req, res) {
    try {
        const tradeData = req.body.pendingTrade;

        if (!tradeData) {
            return res.status(400).json({ success: false, message: "No pending trade provided" });
        }

        const tradeForCalc = {
            tradeId: tradeData.symbol + "_" + Date.now(),
            userId: currentWatcherUser.id,  // use JSON
            symbol: tradeData.symbol,
            type: tradeData.type,
            mode: tradeData.mode || "PENDING",
            entry: tradeData.entry,
            sl: tradeData.sl,
            tp: tradeData.tp,
            initialBalance: tradeData.initialBalance ?? 1000,
            risk: tradeData.risk ?? 1,
            tpTargets: tradeData.tpTargets ?? "tp1",
            dailyMaxLoss: tradeData.dailyMaxLoss ?? 1
        };

        const result = await calculateTrade(tradeForCalc);

        res.json({
            success: true,
            data: result
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
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

        const filter = {
            userId: eaTrade.userId || currentWatcherUser.id, // fallback to JSON
            symbol: eaTrade.symbol,
            type: eaTrade.type.toUpperCase()
        };

        const update = {
            ...eaTrade,
            updatedAt: new Date()
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
        const latestTrade = await Trade.findOne({ userId: currentWatcherUser.id }).sort({ _id: -1 }); // use JSON

        if (!latestTrade) {
            return res.status(404).json({ success: false, message: 'No trade found' });
        }

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