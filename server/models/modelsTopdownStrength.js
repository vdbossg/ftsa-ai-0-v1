const mongoose = require('mongoose');

const TimeframeSchema = new mongoose.Schema({
  bias: { type: String, required: true },
  strength: { type: Number, required: true }
}, { _id: false });

const SymbolTopdownSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true },
  timeframes: {
    "1D": { type: TimeframeSchema, required: true },
    "4H": { type: TimeframeSchema, required: true },
    "1H": { type: TimeframeSchema, required: true },
    "30M": { type: TimeframeSchema, required: true }
  },
  multiTFBias: { type: String, required: true },
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SymbolTopdownStrength', SymbolTopdownSchema);