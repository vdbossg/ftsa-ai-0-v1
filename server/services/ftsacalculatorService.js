//FTSA_AI_0.v1\server\services\ftsacalculatorService.js
const Trade = require('../models/ftsacalculator');
const TVAlert = require('../models/tvAlertModel');
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

const lots = parseFloat(calculateLotSize(riskAmount, slPips, pipValue).toFixed(2)); // rounds to 2 decimals
    
    // 🔥 Get TP directly from finalTvsignals collection
const signal = await TVAlert.findOne({
    symbol: tradeData.symbol,
    status: 'NEW',
    choch: true
}).sort({ createdAt: -1 });

if (!signal) {
    throw new Error('No matching NEW + CHOCH signal found for TP selection');
}

let adjustedTp;

switch (tradeData.tpTargets.toLowerCase()) {
    case 'tp1':
        adjustedTp = signal.tp1;
        break;
    case 'tp2':
        adjustedTp = signal.tp2;
        break;
    case 'tp3':
    default:
        adjustedTp = signal.tp3;
        break;
}
    const tradeObject = {
        ...tradeData,
        lots,
        tp: adjustedTp,
        tradeActivated: 'PENDING'
    };

    // Keep only latest trade
    // Save or update trade per user
const savedTrade = await Trade.findOneAndUpdate(
  { userId: tradeObject.userId },       // filter by userId
  { $set: tradeObject },                // update with new trade data
  { upsert: true, new: true, setDefaultsOnInsert: true } // create if not exists
);

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
