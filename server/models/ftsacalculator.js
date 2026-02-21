//FTSA_AI_0.v1\server\models\ftsacalculator.js
const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
    tradeId: { type: String, required: true },
    userId: { type: String, required: true }, // <-- identifies the user
    symbol: { type: String, required: true },
    type: { type: String, enum: ['BUY', 'SELL'], required: true },
    mode: { type: String, required: true },
    entry: { type: Number, required: true },
    sl: { type: Number, required: true },
    tp: { type: Number, required: true },
    timeframe: String,
    maxTrades: Number,
    risk: { type: Number, required: true },
    dailyMaxLoss: Number,
    tpTargets: { type: String, enum: ['tp1', 'tp2', 'tp3'], default: 'tp3' },
    initialBalance: { type: Number, required: true },
    lots: Number,
    tradeActivated: String
}, { timestamps: true });

module.exports = mongoose.model('ftsacalculator', tradeSchema);
