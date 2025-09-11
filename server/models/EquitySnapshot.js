// server/models/EquitySnapshot.js
const mongoose = require("mongoose");

const EquitySnapshotSchema = new mongoose.Schema({
  account: { type: String, required: false },             // MT4/MT5 account id
  day: { type: String, required: true },                  // YYYY-MM-DD for grouping daily trades
  balanceStart: { type: Number, required: true },         // balance at first snapshot of the day
  balance: { type: Number, required: true },              // current balance
  equity: { type: Number, required: true },               // current equity
  margin: { type: Number, default: 0 },                   // margin used (optional)
  targetEquity: { type: Number, required: true },         // absolute equity target (from appConfig.json)
  stopEquity: { type: Number, required: true },           // absolute equity stop (from appConfig.json)
  tpPercent: { type: Number, required: true },            // TP percent from config
  riskPercent: { type: Number, required: true },          // SL percent from config
  createdAt: { type: Date, default: Date.now }            // snapshot time
});

// Indexes
EquitySnapshotSchema.index({ createdAt: -1 });
EquitySnapshotSchema.index({ day: 1 });

module.exports = mongoose.model("EquitySnapshot", EquitySnapshotSchema);
