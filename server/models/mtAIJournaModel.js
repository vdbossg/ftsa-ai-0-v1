const mongoose = require("mongoose");

const MTJournalSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  broker: { type: String, required: true },
  login: { type: String, required: true },
  ticket: { type: Number, required: true, unique: true },
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
});

module.exports = mongoose.model("MTJournal", MTJournalSchema);
