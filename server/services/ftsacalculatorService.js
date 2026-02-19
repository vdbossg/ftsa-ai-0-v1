//FTSA_AI_0.v1\server\services\ftsacalculatorService.js
const Trade = require('../models/ftsacalculator');

// Constant pip value (for simplicity)


// Calculate risk amount
function calculateRiskAmount(initialBalance, risk) {
    return initialBalance * (risk / 100);
}

// Calculate SL pips based on trade type
// Calculate SL pips based on instrument type
function calculateSlPips(symbol, type, entry, sl) {

    const directionDistance =
        type.toUpperCase() === 'BUY'
            ? entry - sl
            : sl - entry;

    const x = Math.abs(directionDistance);

    const pair = symbol.toUpperCase();

    // JPY pairs
    if (pair.endsWith('JPY')) {
        return x * 100;
    }

    // XAUUSD
    if (pair === 'XAUUSD') {
        return x * 100;
    }

    // BTCUSD
    if (pair === 'BTCUSD') {
        return x * 100;
    }

    // NAS100
    if (pair === 'NAS100') {
        return x * 10;
    }

    // US30
    if (pair === 'US30') {
        return x * 10;
    }

    // NON-JPY (default forex)
    return x * 10000;
}


// Calculate lot size
// Get pip value based on instrument
function getPipValue(symbol) {

    const pair = symbol.toUpperCase();

    if (pair.endsWith('JPY')) return 6.86;
    if (pair === 'XAUUSD') return 10;
    if (pair === 'BTCUSD') return 0.1;
    if (pair === 'US30') return 0.1;
    if (pair === 'NAS100') return 0.1;

    return 10; // non-JPY forex default
}

// Calculate lot size
function calculateLotSize(riskAmount, slPips, pipValue) {
    if (slPips === 0) return 0;
    return riskAmount / (slPips * pipValue);
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
    const slPips = calculateSlPips(
    tradeData.symbol,
    tradeData.type,
    tradeData.entry,
    tradeData.sl
);

const pipValue = getPipValue(tradeData.symbol);

const lots = parseFloat(calculateLotSize(riskAmount, slPips, pipValue).toFixed(3)); // rounds to 3 decimals

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
