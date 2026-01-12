const mongoose = require('mongoose');

const tvsConverterSchema = new mongoose.Schema({
    symbol: { type: String, required: true },
    type: { type: String, enum: ['BUY', 'SELL'], required: true },
    mode: { type: String, enum: ['PENDING', 'MARKET'], required: true },
    choch: { type: Number, required: true },
    entry: { type: Number, required: true },
    sl: { type: Number, required: true },
    tp: { type: Number, required: true },
    support: { type: Number },      // Only present for SELL
    resistance: { type: Number },   // Only present for BUY
    timeframe: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
}, {
    strict: false // Allows saving dynamic fields if needed
});

module.exports = mongoose.model('TVSConverter', tvsConverterSchema);
