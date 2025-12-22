//FTSA_AI_0.v1\server\services\ftsacalculatorService.js
const Trade = require('../models/ftsacalculator');

// Constant pip value (for simplicity)
const PIP_VALUE = 10;

// Calculate risk amount
function calculateRiskAmount(initialBalance, risk) {
    return initialBalance * (risk / 100);
}

// Calculate SL pips based on trade type
function calculateSlPips(type, entry, sl) {
    return Math.abs(type.toUpperCase() === 'BUY' ? entry - sl : sl - entry);
}

// Calculate lot size
function calculateLotSize(riskAmount, slPips) {
    return riskAmount / (PIP_VALUE * slPips);
}

// Adjust TP based on tpTargets
function adjustTp(type, entry, tp, tpTargets) {
    let distance = tp - entry;
    if (type.toUpperCase() === 'SELL') distance = entry - tp;

    switch (tpTargets.toLowerCase()) {
        case 'tp1':
            return type.toUpperCase() === 'BUY' ? entry + distance / 3 : entry - distance / 3;
        case 'tp2':
            return type.toUpperCase() === 'BUY' ? entry + (2 * distance) / 3 : entry - (2 * distance) / 3;
        case 'tp3':
        default:
            return tp;
    }
}

// Determine trend for second JSON
function determineTrend(type) {
    return type.toUpperCase() === 'BUY' ? 'bullish' : 'bearish';
}

// Main calculation function
async function calculateTrade(tradeData) {
    const riskAmount = calculateRiskAmount(tradeData.initialBalance, tradeData.risk);
    const slPips = calculateSlPips(tradeData.type, tradeData.entry, tradeData.sl);
    const lots = calculateLotSize(riskAmount, slPips);
    const adjustedTp = adjustTp(tradeData.type, tradeData.entry, tradeData.tp, tradeData.tpTargets);

    const tradeObject = {
        ...tradeData,
        lots,
        tp: adjustedTp,
        tradeActivated: 'PENDING'
    };

    // Keep only latest trade
    await Trade.deleteMany({});
    const savedTrade = await Trade.create(tradeObject);

    // First JSON structure (signal)
    const signalJson = {
        symbol: savedTrade.symbol,
        type: savedTrade.type,
        mode: 'PENDING',
        Price: savedTrade.entry,
        lots: savedTrade.lots,
        sl: savedTrade.sl,
        tp: savedTrade.tp
    };

    // Second JSON structure (trend)
    const trendJson = {
        time: new Date().toISOString(),
        pair: savedTrade.symbol,
        trend: determineTrend(savedTrade.type),
        type: savedTrade.type.toLowerCase(),
        mode: 'PENDING',
        entry: savedTrade.entry,
        sl: savedTrade.sl,
        tp: savedTrade.tp,
        tradeActivated: savedTrade.tradeActivated
    };

    return { signalJson, trendJson };
}

module.exports = { calculateTrade };
