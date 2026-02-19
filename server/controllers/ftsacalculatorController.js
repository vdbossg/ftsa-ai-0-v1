//FTSA_AI_0.v1\server\controllers\ftsacalculatorController.js
const Trade = require('../models/ftsacalculator');
const { calculateTrade } = require('../services/ftsacalculatorService');

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


// GET: fetch latest trade
async function getLatestTrade(req, res) {
    try {
        const latestTrade = await Trade.findOne().sort({ _id: -1 });

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

module.exports = { ftsaCalculator, getLatestTrade };
