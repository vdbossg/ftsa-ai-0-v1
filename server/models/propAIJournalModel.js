// models/propAIJournalModel.js
const mongoose = require("mongoose");

const PropAIJournalSchema = new mongoose.Schema(
  {
    ticket: { type: Number, required: true, unique: true },
    date: { type: Date, required: true },
    broker: { type: String, required: true },
    login: { type: String, required: true },
    accountType: { type: String, default: "prop" }, // demo or prop
    platform: { type: String, default: "PropFirm" },
    pair: String,
    profit: Number,
    side: String,
    lotSize: Number,
    entry: Number,
    tp: Number,
    sl: Number,
    exit: Number,
    rr: Number,
    pips: Number,
    riskPercent: Number,
    session: String,
    aiStrategy: String,
    executionNotes: String,
    conclusions: String,
    balanceHistory: [Number],
    profitTarget: Number,
    initialProfit: Number,
    gainDrawdownPercent: Number,
    status: { type: String, default: "closed" }, // closed or open
  },
  { timestamps: true } // adds createdAt and updatedAt
);

module.exports = mongoose.model("PropAIJournal", PropAIJournalSchema);
