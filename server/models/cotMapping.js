const mongoose = require("mongoose");

const cotSchema = new mongoose.Schema({
  pair: { type: String, required: true, unique: true },
  cotCurrency: { type: String, required: true },
  reportDate: { type: String, required: true },
  nonCommercial: {
    long: Number,
    short: Number,
    net: Number,
    percent: String
  },
  bias: { type: String }, // 🟩 bullish, 🟥 bearish, ⚪ neutral
}, { timestamps: true });

module.exports = mongoose.model("Cot", cotSchema);