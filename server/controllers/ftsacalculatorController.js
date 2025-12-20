const Trade = require('../models/ftsacalculator');
const { calculateTrade } = require('../services/ftsacalculatorService');

// POST: calculate and save trade
async function ftsaCalculator(req, res) {
    try {
        const tradeData = req.body;

        // Basic validation
        const requiredFields = ['tradeId', 'symbol', 'type', 'mode', 'entry', 'sl', 'tp', 'initialBalance', 'risk', 'tpTargets'];
        for (let field of requiredFields) {
            if (!(field in tradeData)) {
                return res.status(400).json({ success: false, message: `Missing field: ${field}` });
            }
        }

        const result = await calculateTrade(tradeData);

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
